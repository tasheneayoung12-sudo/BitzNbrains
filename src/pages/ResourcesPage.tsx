import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, LogOut, Phone, Search, ShieldAlert } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';
import { filterAndSortResources } from '../lib/domain';
import type { ResourceEntry } from '../types/site';

const CATEGORIES = [
  'All',
  'Foster Youth',
  'Justice-Impacted Youth',
  'Homeless Youth',
  'Domestic Violence Survivors',
  'Mental Health',
  'Housing',
  'Education',
  'Jobs',
  'Legal Help',
] as const;

export function ResourcesPage() {
  const { siteContent } = useSite();
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const lastEscRef = useRef<number>(0);

  function triggerQuickExit() {
    window.location.replace('https://www.google.com');
  }

  useEffect(() => {
    fetch('/api/resources')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setResources(d))
      .finally(() => setLoading(false));
  }, []);

  // Pressing Esc twice quickly triggers Quick Exit
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscRef.current < 800) {
          triggerQuickExit();
        }
        lastEscRef.current = now;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(
    () => filterAndSortResources(resources, search, category),
    [resources, search, category]
  );

  const resCopy = siteContent?.resources;

  if (siteContent && !siteContent.pagesEnabled.resources) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Resources page is temporarily offline.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <SeoHead
        pageKey="resources"
        fallbackTitle="You Are Not Alone – Helpful Resources | Bits & Brains Collective"
        fallbackDescription="Find trusted support programs for youth, housing, mental health, legal help, education, and jobs in plain language."
      />

      {/* Emergency Banner + Always-visible Quick Exit at top right */}
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-[#0E1033] bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-[0_4px_0_#0E1033]">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border-2 border-[#0E1033] bg-[#FF2E93] p-2.5 text-white shrink-0">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="font-display text-lg sm:text-xl font-bold text-[#0E1033]">
            {resCopy?.emergencyBanner || 'In immediate danger? Call 911.'}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end shrink-0">
          <button
            type="button"
            onClick={triggerQuickExit}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-[#D1006F] px-5 py-2.5 font-display text-base font-bold text-white shadow-[0_3px_0_#0E1033] hover:bg-[#FF2E93] whitespace-nowrap"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            QUICK EXIT
          </button>
          <span className="mt-1 text-xs font-medium text-[#0E1033]/80">
            {resCopy?.quickExitNote || 'Need to leave fast? Click Quick Exit.'} (Or press Esc twice)
          </span>
        </div>
      </div>

      {/* Warm Header */}
      <header className="rounded-2xl border-2 border-[#0E1033] bg-[#1F4BFF] p-6 sm:p-8 text-white shadow-[0_4px_0_#0E1033]">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl sm:text-5xl font-bold">
            {resCopy?.heading || "You're Not Alone. Help Is Right Here."}
          </h1>
          <AdminEditButton pageKey="resources" label="Resources" />
        </div>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-white/95">
          {resCopy?.intro}
        </p>
      </header>

      {/* Search Bar & Category Chips */}
      <section aria-label="Search and filter resources" className="space-y-4">
        <div className="max-w-xl">
          <label htmlFor="res-search" className="block text-sm font-bold text-[#0E1033] mb-1.5">
            Search by program name or what they help with
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0E1033]/60"
              aria-hidden="true"
            />
            <input
              id="res-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try housing, 211, legal, foster..."
              className="w-full rounded-xl border-2 border-[#0E1033] bg-white py-3 pl-11 pr-4 text-base text-[#0E1033]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by support category">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={`rounded-xl border-2 border-[#0E1033] px-3.5 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
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
      </section>

      {/* Alphabetized A-Z Resource Cards */}
      <section aria-live="polite">
        <p className="text-sm font-semibold text-[#0E1033]/80">
          Showing {filtered.length} {filtered.length === 1 ? 'program' : 'programs'} (sorted A–Z)
        </p>

        {loading ? (
          <p className="mt-4 text-base">Loading resources...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-[#0E1033] bg-white p-6">
            <p className="font-display text-xl font-bold">No matching programs found.</p>
            <p className="mt-1 text-sm text-[#0E1033]/80">
              Try clearing your search box or picking All categories.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#D1006F]">
                    {item.category} · {item.area}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-[#0E1033]">
                    {item.name}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-[#0E1033]">
                    {item.description}
                  </p>
                  <p className="mt-3 text-sm text-[#0E1033]/85">
                    <span className="font-bold">Who it serves: </span>
                    {item.whoItServes}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#D8DDF5] pt-3 text-sm font-bold">
                  <span className="inline-flex items-center gap-1.5 text-[#0E1033]">
                    <Phone className="h-4 w-4 text-[#1F4BFF]" aria-hidden="true" />
                    Phone: {item.phone}
                  </span>
                  {/^https?:\/\//i.test(item.website) ? (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#1F4BFF] underline underline-offset-4"
                    >
                      Visit website <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-[#0E1033]/80">Website: {item.website}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
