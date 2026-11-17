import { useEffect, useState } from 'react';
import {
  Accessibility,
  ExternalLink,
  HeartHandshake,
  MessageSquareHeart,
  SearchCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';
import type { NewsArticle } from '../types/site';

const ICON_MAP: Record<string, typeof HeartHandshake> = {
  HeartHandshake,
  MessageSquareHeart,
  ShieldCheck,
  Accessibility,
  SearchCheck,
  Users,
};

const NEWS_CATEGORIES = [
  'All',
  'AI',
  'Cybersecurity',
  'Privacy',
  'Diversity in Tech',
  'Laws & Policy',
] as const;

export function OurCodePage() {
  const { siteContent } = useSite();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    setLoadingNews(true);
    const params = new URLSearchParams({
      category: selectedCategory,
      page: String(page),
    });
    fetch(`/api/news?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setNews(Array.isArray(data.items) ? data.items : []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {
        setNews([]);
      })
      .finally(() => setLoadingNews(false));
  }, [selectedCategory, page]);

  const oc = siteContent?.ourCode;

  if (siteContent && !siteContent.pagesEnabled.ourCode) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Our Code is currently hidden.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-14">
      <SeoHead
        pageKey="ourCode"
        fallbackTitle="Our Code & Tech Ethics News – Bits & Brains Collective"
        fallbackDescription="Read the Bits & Brains Code and catch plain-language tech ethics news from trusted sources."
      />

      {/* Code Header & Principles */}
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0E1033]">
            {oc?.heading || 'The Bits & Brains Code'}
          </h1>
          <AdminEditButton pageKey="ourCode" label="Our Code" />
        </div>
        <p className="mt-3 max-w-3xl text-lg text-[#0E1033]/85">
          {oc?.intro}
        </p>
        <p className="mt-2 text-sm font-semibold text-[#0E1033]">
          {oc?.acmNotePrefix || 'Inspired by the'}{' '}
          <a
            href={oc?.acmLinkUrl || 'https://www.acm.org/code-of-ethics'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1F4BFF] underline underline-offset-4 hover:text-[#D1006F]"
          >
            {oc?.acmLinkLabel || 'ACM Code of Ethics'}
          </a>
          .
        </p>

        {(oc?.sectionsEnabled?.principles ?? true) && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(oc?.principles || []).map((p, idx) => {
              const Icon = ICON_MAP[p.icon] || HeartHandshake;
              const isBlue = idx % 2 === 0;
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033]"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#0E1033] text-white ${
                      isBlue ? 'bg-[#1F4BFF]' : 'bg-[#D1006F]'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-bold text-[#0E1033]">{p.title}</h2>
                  <p className="mt-2 text-base text-[#0E1033]/85">{p.description}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Tech Ethics in the News */}
      {(oc?.sectionsEnabled?.news ?? true) && (
        <section className="border-t-2 border-[#D8DDF5] pt-10">
          <h2 className="font-display text-3xl font-bold text-[#0E1033]">
            {oc?.newsHeading || 'Tech Ethics in the News'}
          </h2>
          <p className="mt-2 max-w-3xl text-base text-[#0E1033]/80">
            {oc?.newsSubheading ||
              'Short summaries from trusted newsrooms on AI, cybersecurity, privacy, fairness, and tech laws.'}
          </p>

          {/* Filter Buttons */}
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter news by topic">
            {NEWS_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  aria-pressed={active}
                  className={`rounded-xl border-2 border-[#0E1033] px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#1F4BFF] text-white'
                      : 'bg-white text-[#0E1033] hover:bg-[#F7F8FF]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {loadingNews ? (
            <p className="mt-6 text-base font-medium text-[#0E1033]/70">
              Loading latest stories...
            </p>
          ) : news.length === 0 ? (
            <div className="mt-6 rounded-2xl border-2 border-[#0E1033] bg-white p-6">
              <p className="font-display text-lg font-bold text-[#0E1033]">
                No stories in this topic right now.
              </p>
              <p className="mt-1 text-sm text-[#0E1033]/80">
                Our server checks ACM TechNews, MIT Technology Review, Ars Technica, Wired, The Verge, and CISA every 6 hours. Try picking All topics or check back shortly.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => {
                const dateLabel = new Date(item.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                return (
                  <article
                    key={item._id}
                    className="flex flex-col justify-between rounded-2xl border-2 border-[#0E1033] bg-white p-5"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#1F4BFF]">
                        {item.sourceName} · {dateLabel}
                        {item.pinned ? ' · Featured' : ''}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-bold leading-snug text-[#0E1033]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#0E1033]/85">
                        {item.summary}
                      </p>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#D1006F] underline underline-offset-4 hover:text-[#1F4BFF]"
                    >
                      Read the full story at {item.sourceName}{' '}
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </a>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border-2 border-[#0E1033] bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm font-semibold tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border-2 border-[#0E1033] bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
