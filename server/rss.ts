import { XMLParser } from 'fast-xml-parser';
import { getCollection } from './db.ts';
import { classifyNewsCategories, stripHtmlAndLimitSentences } from '../src/lib/domain.ts';
import type { NewsArticle } from '../src/types/site.ts';

const RSS_SOURCES: { name: string; url: string }[] = [
  { name: 'ACM TechNews', url: 'https://technews.acm.org/rss.xml' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'CISA', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml' },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
});

function extractText(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj['#text'] === 'string') return obj['#text'];
    if (typeof obj.__cdata === 'string') return obj.__cdata;
  }
  return '';
}

function extractLink(item: Record<string, unknown>): string {
  if (typeof item.link === 'string') return item.link;
  if (Array.isArray(item.link)) {
    const first = item.link.find((l) => typeof l === 'object' && l !== null && (l as Record<string, unknown>)['@_href']) || item.link[0];
    if (typeof first === 'string') return first;
    if (typeof first === 'object' && first !== null) {
      return String((first as Record<string, unknown>)['@_href'] || '');
    }
  }
  if (typeof item.link === 'object' && item.link !== null) {
    const obj = item.link as Record<string, unknown>;
    if (obj['@_href']) return String(obj['@_href']);
    if (obj['#text']) return String(obj['#text']);
  }
  return '';
}

async function fetchOneFeed(source: { name: string; url: string }): Promise<Omit<NewsArticle, '_id'>[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BitsAndBrainsCollectiveBot/1.0 (+https://bitsnbrainsco.example)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = parser.parse(xml) as Record<string, unknown>;

    let rawItems: unknown[] = [];
    const rss = parsed.rss as Record<string, unknown> | undefined;
    const feed = parsed.feed as Record<string, unknown> | undefined;
    if (rss?.channel) {
      const ch = rss.channel as Record<string, unknown>;
      if (Array.isArray(ch.item)) rawItems = ch.item;
      else if (ch.item) rawItems = [ch.item];
    } else if (feed?.entry) {
      rawItems = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    }

    const out: Omit<NewsArticle, '_id'>[] = [];
    for (const entry of rawItems.slice(0, 12)) {
      if (typeof entry !== 'object' || !entry) continue;
      const item = entry as Record<string, unknown>;
      const title = stripHtmlAndLimitSentences(extractText(item.title), 2);
      const link = extractLink(item).trim();
      if (!title || !link || !/^https?:\/\//i.test(link)) continue;

      const rawSummary =
        extractText(item.description) ||
        extractText(item.summary) ||
        extractText(item['content:encoded']) ||
        extractText(item.content);
      const summary = stripHtmlAndLimitSentences(rawSummary, 2) || `Read more at ${source.name}.`;

      const rawDate =
        extractText(item.pubDate) ||
        extractText(item.published) ||
        extractText(item.updated) ||
        extractText(item['dc:date']);
      const parsedDate = rawDate ? new Date(rawDate) : new Date();
      const publishedAt = Number.isNaN(parsedDate.getTime())
        ? new Date().toISOString()
        : parsedDate.toISOString();

      out.push({
        title,
        sourceName: source.name,
        link,
        summary,
        publishedAt,
        categories: classifyNewsCategories(title, summary, source.name),
        pinned: false,
        hidden: false,
      });
    }
    return out;
  } catch {
    // If a feed fails, skip it quietly as requested
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshNewsFeeds(): Promise<{ added: number; total: number }> {
  const col = getCollection<NewsArticle>('news');
  const results = await Promise.all(RSS_SOURCES.map((s) => fetchOneFeed(s)));
  const flat = results.flat();
  let added = 0;

  for (const article of flat) {
    const existing = await col.findOne({ link: article.link });
    if (!existing) {
      await col.insertOne(article);
      added++;
    }
  }

  const total = await col.countDocuments();
  return { added, total };
}

export function startNewsScheduler() {
  // Run initial pull asynchronously so startup is instant
  void refreshNewsFeeds().catch(() => {});
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    void refreshNewsFeeds().catch(() => {});
  }, SIX_HOURS_MS);
}
