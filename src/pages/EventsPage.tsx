import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';
import { filterEvents } from '../lib/domain';
import type { TechEventItem } from '../types/site';

interface EnrichedEvent extends TechEventItem {
  distanceMiles?: number | null;
}

export function EventsPage() {
  const { siteContent } = useSite();
  const [zipInput, setZipInput] = useState('');
  const [activeZip, setActiveZip] = useState('');
  const [radius, setRadius] = useState(25);
  const [freeOrLowCost, setFreeOrLowCost] = useState(false);
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [zipOrigin, setZipOrigin] = useState<{ zip: string; city: string; state: string } | null>(null);
  const [zipValid, setZipValid] = useState(true);
  const [loading, setLoading] = useState(true);

  async function loadEvents(zip: string) {
    setLoading(true);
    try {
      const q = zip ? `?zip=${encodeURIComponent(zip)}` : '';
      const res = await fetch(`/api/events${q}`);
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
      setZipOrigin(data.zipOrigin || null);
      setZipValid(data.zipValid !== false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents('');
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = zipInput.trim();
    setActiveZip(cleaned);
    void loadEvents(cleaned);
  }

  const visibleEvents = useMemo(
    () =>
      filterEvents(events, {
        radiusMiles: radius,
        freeOrLowCost,
        hasZipOrigin: Boolean(zipOrigin),
      }),
    [events, radius, freeOrLowCost, zipOrigin]
  );

  const searchZipForExternal = /^\d{5}$/.test(activeZip || zipInput.trim())
    ? activeZip || zipInput.trim()
    : '90001';

  const copy = siteContent?.events;

  if (siteContent && !siteContent.pagesEnabled.events) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Tech Events page is temporarily paused.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-10">
      <SeoHead
        pageKey="events"
        fallbackTitle="Tech Events Near You – Bits & Brains Collective"
        fallbackDescription="Find free and low-cost tech events near your zip code or online."
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0E1033]">
            {copy?.heading || 'Tech Events Near You'}
          </h1>
          <AdminEditButton pageKey="events" label="Tech Events" />
        </div>
        <p className="max-w-3xl text-lg text-[#0E1033]/85">{copy?.intro}</p>
      </header>

      {/* Zip + Radius + Cost Filters */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033]"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-4">
            <label htmlFor="ev-zip" className="block text-sm font-bold text-[#0E1033] mb-1">
              5-digit zip code
            </label>
            <input
              id="ev-zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="e.g., 90001"
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5 tabular-nums"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="ev-radius" className="block text-sm font-bold text-[#0E1033] mb-1">
              Distance
            </label>
            <select
              id="ev-radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
            >
              <option value={10}>Within 10 miles</option>
              <option value={25}>Within 25 miles</option>
              <option value={50}>Within 50 miles</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="flex items-center gap-2.5 rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={freeOrLowCost}
                onChange={(e) => setFreeOrLowCost(e.target.checked)}
                className="h-4 w-4 accent-[#1F4BFF]"
              />
              <span className="text-sm font-bold text-[#0E1033]">Free / under $25</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-4 py-2.5 font-display text-base font-bold text-white whitespace-nowrap"
            >
              Find Events Near Me
            </button>
          </div>
        </div>

        <div aria-live="polite" className="mt-3">
          {!zipValid && activeZip && (
            <p className="text-sm font-semibold text-[#D1006F]">
              We could not find zip code {activeZip}. Showing online events—try another 5-digit U.S. zip code.
            </p>
          )}
          {zipOrigin && (
            <p className="text-sm font-semibold text-[#1F4BFF]">
              Showing in-person events within {radius} miles of {zipOrigin.city}, {zipOrigin.state} ({zipOrigin.zip}) plus all online events.
            </p>
          )}
        </div>
      </form>

      {/* External Eventbrite & Meetup Search Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`https://www.eventbrite.com/d/${searchZipForExternal}/tech/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-[#D1006F] px-5 py-2.5 font-display text-sm font-bold text-white"
        >
          Find more near {searchZipForExternal} on Eventbrite{' '}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          href={`https://www.meetup.com/find/?keywords=tech&location=us--${searchZipForExternal}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-white px-5 py-2.5 font-display text-sm font-bold text-[#0E1033]"
        >
          Find more near {searchZipForExternal} on Meetup{' '}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      {/* Events List */}
      <section aria-live="polite">
        {loading ? (
          <p>Loading tech events...</p>
        ) : visibleEvents.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
            <p className="font-display text-xl font-bold">No matching events right here yet.</p>
            <p className="mt-1 text-sm text-[#0E1033]/80">
              Try widening your distance to 50 miles or use the Eventbrite and Meetup buttons above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleEvents.map((ev) => (
              <article
                key={ev._id}
                className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#1F4BFF]">
                    {ev.mode === 'online' ? 'Online Event' : 'In-Person Event'} · {ev.costLabel}
                    {typeof ev.distanceMiles === 'number' ? ` · ${ev.distanceMiles} miles away` : ''}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-bold text-[#0E1033]">
                    {ev.title}
                  </h2>
                  {ev.description && (
                    <p className="mt-2 text-base text-[#0E1033]/85">{ev.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-[#0E1033]/80">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#D1006F]" aria-hidden="true" />
                      {ev.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#1F4BFF]" aria-hidden="true" />
                      {ev.city}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#D8DDF5]">
                  <a
                    href={ev.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D1006F] underline underline-offset-4"
                  >
                    See event details <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
