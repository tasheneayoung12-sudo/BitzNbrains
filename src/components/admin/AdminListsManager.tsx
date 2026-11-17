import React, { useEffect, useState } from 'react';
import { Download, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { ImageUploadField } from './AdminPagesEditor';
import type {
  BootcampProgram,
  NewsArticle,
  ResourceEntry,
  SpotlightItem,
  TechEventItem,
  ToolOfTheWeekItem,
} from '../../types/site';

type ListKind = 'spotlights' | 'tools_of_the_week' | 'resources' | 'events' | 'programs' | 'news';

export function AdminListsManager() {
  const [kind, setKind] = useState<ListKind>('spotlights');
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Quick Add states
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newExtra1, setNewExtra1] = useState('');
  const [newExtra2, setNewExtra2] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoAlt, setNewPhotoAlt] = useState('');

  async function loadList(target: ListKind) {
    setLoading(true);
    setMsg('');
    try {
      const url = target === 'news' ? '/api/admin/news' : `/api/admin/list/${target}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadList(kind);
    setNewName('');
    setNewDesc('');
    setNewExtra1('');
    setNewExtra2('');
    setNewPhotoUrl('');
    setNewPhotoAlt('');
  }, [kind]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    let payload: Record<string, unknown> = {};

    if (kind === 'spotlights') {
      payload = {
        name: newName,
        years: newExtra1 || '[Years]',
        whatTheyDid: newDesc || '[One-sentence summary]',
        whyItMatters: newExtra2 || '[Why it matters today]',
        photoUrl: newPhotoUrl,
        photoAlt: newPhotoAlt || newName,
        order: items.length + 1,
      };
    } else if (kind === 'tools_of_the_week') {
      payload = {
        name: newName,
        whatItDoes: newDesc,
        whoItIsFor: newExtra1 || 'Everyone',
        tryItUrl: newExtra2 || 'https://example.com',
        isCurrent: true,
        weekLabel: 'This Week',
      };
    } else if (kind === 'resources') {
      payload = {
        name: newName,
        category: newExtra1 || 'Housing',
        description: newDesc,
        whoItServes: 'Youth & families',
        phone: newExtra2 || '[VERIFY]',
        website: '[VERIFY]',
        area: 'National',
      };
    } else if (kind === 'events') {
      payload = {
        title: newName,
        date: newExtra1 || '2026-12-20',
        cost: Number(newExtra2 || 0),
        costLabel: Number(newExtra2 || 0) === 0 ? 'Free' : `$${newExtra2}`,
        zip: '90001',
        city: newDesc || 'Online',
        link: 'https://www.eventbrite.com',
        mode: (newDesc || '').toLowerCase() === 'online' || !newDesc ? 'online' : 'in-person',
      };
    } else if (kind === 'programs') {
      payload = {
        name: newName,
        provider: newExtra1 || newName,
        description: newDesc,
        costType: 'Free',
        ageGroup: 'All Ages',
        mode: 'Online',
        topic: newExtra2 || 'Coding',
        link: '[VERIFY]',
        area: 'Online',
      };
    }

    const res = await fetch(`/api/admin/list/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewName('');
      setNewDesc('');
      setNewExtra1('');
      setNewExtra2('');
      setNewPhotoUrl('');
      setNewPhotoAlt('');
      setMsg('Added!');
      await loadList(kind);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/list/${kind}/${id}`, { method: 'DELETE' });
    await loadList(kind);
  }

  async function toggleNews(id: string, patch: { pinned?: boolean; hidden?: boolean }) {
    await fetch(`/api/admin/news/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await loadList('news');
  }

  async function refreshNews() {
    setMsg('Checking news feeds...');
    const res = await fetch('/api/admin/news/refresh', { method: 'POST' });
    if (res.ok) {
      const d = await res.json();
      setMsg(`News checked! Added ${d.added} new stories (${d.total} total).`);
      await loadList('news');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['spotlights', 'Who Built This?'],
              ['tools_of_the_week', 'Free Tool of the Week'],
              ['resources', 'Resources'],
              ['events', 'Tech Events'],
              ['programs', 'Bootcamps'],
              ['news', 'News Stories'],
            ] as [ListKind, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-xl border-2 border-[#0E1033] px-3.5 py-2 text-sm font-bold whitespace-nowrap ${
                kind === k ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {(kind === 'resources' || kind === 'events' || kind === 'programs') && (
          <a
            href={`/api/admin/export/${kind}`}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0E1033] bg-white px-4 py-2 text-sm font-bold"
          >
            <Download className="h-4 w-4 text-[#1F4BFF]" aria-hidden="true" /> Export CSV
          </a>
        )}
      </div>

      {msg && (
        <p role="status" className="rounded-xl border-2 border-[#1F4BFF] bg-white p-3 text-sm font-bold text-[#1F4BFF]">
          {msg}
        </p>
      )}

      {/* Add Form (for non-RSS lists) */}
      {kind !== 'news' ? (
        <form onSubmit={handleAdd} className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 space-y-4">
          <h3 className="font-display text-xl font-bold text-[#0E1033]">
            Add New Entry
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold mb-1">
                {kind === 'events' ? 'Event Title' : 'Name'}
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                {kind === 'spotlights'
                  ? 'Years (e.g. 1918–2020)'
                  : kind === 'tools_of_the_week'
                  ? 'Who it is for'
                  : kind === 'resources'
                  ? 'Category (e.g. Housing, Mental Health)'
                  : kind === 'events'
                  ? 'Date (YYYY-MM-DD)'
                  : 'Provider'}
              </label>
              <input
                type="text"
                value={newExtra1}
                onChange={(e) => setNewExtra1(e.target.value)}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                {kind === 'events' ? 'City (or "Online")' : 'Short Description / What they did'}
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">
                {kind === 'spotlights'
                  ? 'Why it matters today'
                  : kind === 'tools_of_the_week'
                  ? 'Try It URL'
                  : kind === 'resources'
                  ? 'Phone'
                  : kind === 'events'
                  ? 'Cost in $ (0 for Free)'
                  : 'Topic'}
              </label>
              <input
                type="text"
                value={newExtra2}
                onChange={(e) => setNewExtra2(e.target.value)}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 text-sm"
              />
            </div>
          </div>

          {kind === 'spotlights' && (
            <ImageUploadField
              label="Spotlight Photo (optional)"
              currentUrl={newPhotoUrl}
              currentAlt={newPhotoAlt}
              onUploaded={(url, alt) => {
                setNewPhotoUrl(url);
                setNewPhotoAlt(alt);
              }}
            />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-2.5 font-display text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Item
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border-2 border-[#0E1033] bg-white p-5">
          <div>
            <h3 className="font-display text-xl font-bold">Manage Cached News Stories</h3>
            <p className="text-sm text-[#0E1033]/80">
              Pin important stories to the top or hide ones you do not want shown.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshNews}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-4 py-2 text-sm font-bold text-white"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Pull RSS Feeds Now
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
            <p className="font-bold">No entries in this list yet.</p>
          </div>
        ) : kind === 'news' ? (
          (items as NewsArticle[]).map((n) => (
            <div
              key={n._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-[#0E1033] bg-white p-4"
            >
              <div className="max-w-2xl">
                <p className="text-xs font-bold text-[#1F4BFF]">
                  {n.sourceName} {n.pinned ? '· PINNED' : ''} {n.hidden ? '· HIDDEN' : ''}
                </p>
                <p className="font-display text-lg font-bold text-[#0E1033]">{n.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleNews(n._id, { pinned: !n.pinned })}
                  className="rounded-lg border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-1.5 text-xs font-bold"
                >
                  {n.pinned ? 'Unpin' : 'Pin to Top'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleNews(n._id, { hidden: !n.hidden })}
                  className="rounded-lg border-2 border-[#0E1033] bg-white px-3 py-1.5 text-xs font-bold text-[#D1006F]"
                >
                  {n.hidden ? 'Show Again' : 'Hide'}
                </button>
              </div>
            </div>
          ))
        ) : (
          items.map((raw) => {
            const item = raw as Record<string, string | undefined>;
            const itemId = item._id || '';
            const title = item.name || item.title || '';
            const subtitle =
              item.whatTheyDid || item.whatItDoes || item.description || item.city || '';
            return (
              <div
                key={itemId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-[#0E1033] bg-white p-4"
              >
                <div className="max-w-2xl">
                  <p className="font-display text-lg font-bold text-[#0E1033]">{title}</p>
                  {subtitle && <p className="text-sm text-[#0E1033]/80">{subtitle}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(itemId)}
                  aria-label={`Delete ${title}`}
                  className="inline-flex items-center gap-1 rounded-lg border-2 border-[#0E1033] bg-white px-3 py-1.5 text-xs font-bold text-[#D1006F] hover:bg-[#F7F8FF]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
