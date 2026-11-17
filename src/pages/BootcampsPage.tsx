import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';
import { filterBootcamps } from '../lib/domain';
import type { BootcampProgram } from '../types/site';

export function BootcampsPage() {
  const { siteContent } = useSite();
  const [programs, setPrograms] = useState<BootcampProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [freeOrLowCost, setFreeOrLowCost] = useState(false);
  const [ageGroup, setAgeGroup] = useState('All');
  const [mode, setMode] = useState('All');
  const [topic, setTopic] = useState('All');

  useEffect(() => {
    fetch('/api/programs')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setPrograms(d))
      .finally(() => setLoading(false));
  }, []);

  const topics = useMemo(() => {
    const set = new Set<string>(programs.map((p) => p.topic).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [programs]);

  const filtered = useMemo(
    () =>
      filterBootcamps(programs, {
        search,
        freeOrLowCost,
        ageGroup,
        mode,
        topic,
      }),
    [programs, search, freeOrLowCost, ageGroup, mode, topic]
  );

  const copy = siteContent?.bootcamps;

  if (siteContent && !siteContent.pagesEnabled.bootcamps) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Bootcamps page is paused right now.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-10">
      <SeoHead
        pageKey="bootcamps"
        fallbackTitle="Bootcamps & Certifications – Bits & Brains Collective"
        fallbackDescription="Search free and low-cost coding bootcamps, IT programs, and tech certificates by age, topic, and format."
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0E1033]">
            {copy?.heading || 'Bootcamps & Certifications'}
          </h1>
          <AdminEditButton pageKey="bootcamps" label="Bootcamps" />
        </div>
        <p className="max-w-3xl text-lg text-[#0E1033]/85">{copy?.intro}</p>
      </header>

      {/* Search & Filter Bar */}
      <section
        aria-label="Filter bootcamps and certifications"
        className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033] space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <label htmlFor="bc-search" className="block text-sm font-bold text-[#0E1033] mb-1">
              Search programs
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0E1033]/60"
                aria-hidden="true"
              />
              <input
                id="bc-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Coding, IT, freeCodeCamp..."
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bc-age" className="block text-sm font-bold text-[#0E1033] mb-1">
              Ages
            </label>
            <select
              id="bc-age"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2.5 text-sm"
            >
              <option value="All">All Ages</option>
              <option value="Teens">Teens</option>
              <option value="Young Adults">Young Adults</option>
              <option value="Adults">Adults</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bc-mode" className="block text-sm font-bold text-[#0E1033] mb-1">
              Format
            </label>
            <select
              id="bc-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2.5 text-sm"
            >
              <option value="All">Online & In Person</option>
              <option value="Online">Online</option>
              <option value="In Person">In Person</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bc-topic" className="block text-sm font-bold text-[#0E1033] mb-1">
              Topic
            </label>
            <select
              id="bc-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2.5 text-sm"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={freeOrLowCost}
                onChange={(e) => setFreeOrLowCost(e.target.checked)}
                className="h-4 w-4 accent-[#1F4BFF]"
              />
              <span className="text-sm font-bold text-[#0E1033] whitespace-nowrap">Free / Low cost</span>
            </label>
          </div>
        </div>
      </section>

      {/* Programs List */}
      <section aria-live="polite">
        <p className="text-sm font-semibold text-[#0E1033]/80">
          Showing {filtered.length} {filtered.length === 1 ? 'program' : 'programs'}
        </p>

        {loading ? (
          <p className="mt-4">Loading programs...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-[#0E1033] bg-white p-6">
            <p className="font-display text-xl font-bold">No matching programs found.</p>
            <p className="mt-1 text-sm text-[#0E1033]/80">
              Try setting Ages or Topic back to All.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((p) => (
              <article
                key={p._id}
                className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#1F4BFF]">
                    {p.costType} · {p.ageGroup} · {p.mode} · {p.topic}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-bold text-[#0E1033]">
                    {p.name}
                  </h2>
                  <p className="text-sm font-semibold text-[#D1006F]">{p.provider}</p>
                  <p className="mt-2 text-base text-[#0E1033]/85">{p.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#D8DDF5] flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#0E1033]/75">{p.area || 'Online'}</span>
                  {/^https?:\/\//i.test(p.link) ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1F4BFF] underline underline-offset-4"
                    >
                      Visit program <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-[#0E1033]/75">Link: {p.link}</span>
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
