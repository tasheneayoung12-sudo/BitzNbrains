import { useEffect, useState } from 'react';
import { ExternalLink, Play, Shield, Cpu, Compass, Sparkles, User } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { NewsletterBox } from '../components/NewsletterBox';
import { AdminEditButton } from '../components/AdminEditButton';
import type { SpotlightItem, ToolOfTheWeekItem } from '../types/site';

export function ChannelPage() {
  const { siteContent } = useSite();
  const [spotlights, setSpotlights] = useState<SpotlightItem[]>([]);
  const [tools, setTools] = useState<ToolOfTheWeekItem[]>([]);
  const [showPastTools, setShowPastTools] = useState(false);

  useEffect(() => {
    fetch('/api/spotlights')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSpotlights(d))
      .catch(() => {});
    fetch('/api/tools')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTools(d))
      .catch(() => {});
  }, []);

  const ch = siteContent?.channel;
  const youtubeUrl = siteContent?.branding.youtubeUrl || 'https://www.youtube.com/@BitsNBrainsCo';
  const newestSpotlight = spotlights[0];
  const olderSpotlights = spotlights.slice(1);
  const currentTool = tools.find((t) => t.isCurrent) || tools[0];
  const pastTools = tools.filter((t) => t._id !== currentTool?._id);

  if (siteContent && !siteContent.pagesEnabled.channel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">This page is taking a short break.</h1>
        <p className="mt-2 text-base">Check back soon for new videos and episodes.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-14">
      <SeoHead
        pageKey="channel"
        fallbackTitle="The Channel – Bits & Brains Collective"
        fallbackDescription="Computer science made easy. Watch Season 1 episodes, meet the Collective, explore Who Built This spotlights, and grab the Free Tool of the Week."
      />

      {/* Hero */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#0E1033]">
              {ch?.heroTitle || 'Computer Science, Made Easy.'}
            </h1>
            <AdminEditButton pageKey="channel" label="Channel" />
          </div>
          <p className="text-lg leading-relaxed text-[#0E1033]/85">
            {ch?.heroSubtitle ||
              'Short, friendly videos that explain how computers, coding, and AI (smart computer tools) really work—without confusing tech words.'}
          </p>
          <div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-[#D1006F] px-6 py-3.5 font-display text-base font-bold text-white shadow-[0_4px_0_#0E1033] transition-transform hover:-translate-y-0.5"
            >
              <Play className="h-5 w-5" aria-hidden="true" />
              {ch?.subscribeLabel || 'Subscribe on YouTube'}
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl border-2 border-[#0E1033] bg-white shadow-[0_6px_0_#0E1033]">
            {ch?.videoEmbedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={ch.videoEmbedUrl}
                  title="Bits & Brains Collective YouTube video"
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-[#1F4BFF] flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="rounded-full border-2 border-white bg-[#D1006F] p-4">
                  <Play className="h-8 w-8" aria-hidden="true" />
                </div>
                <p className="mt-4 font-display text-xl font-bold">YouTube Video Placeholder</p>
                <p className="mt-1 max-w-md text-sm text-white/90">
                  {ch?.videoPlaceholderText ||
                    'Channel trailer video placeholder — add your YouTube embed link in Admin.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mission */}
      {(ch?.sectionsEnabled?.mission ?? true) && (
        <section className="rounded-2xl border-2 border-[#0E1033] bg-[#1F4BFF] p-6 sm:p-8 text-white shadow-[0_4px_0_#0E1033]">
          <h2 className="font-display text-2xl font-bold">
            {ch?.missionHeading || 'Our Mission'}
          </h2>
          <p className="mt-2 max-w-3xl text-lg leading-relaxed text-white/95">
            {ch?.missionText ||
              'Bits & Brains spotlights the lesser-known people who built computer science and makes tech feel possible for everyone.'}
          </p>
        </section>
      )}

      {/* Meet the Collective */}
      {(ch?.sectionsEnabled?.collective ?? true) && (
        <section>
          <h2 className="font-display text-3xl font-bold text-[#0E1033]">
            {ch?.collectiveHeading || 'Meet the Collective'}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(ch?.collectiveMembers || []).map((member, idx) => {
              const IconComp =
                idx === 0
                  ? Cpu
                  : idx === 1
                  ? Sparkles
                  : idx === 2
                  ? Compass
                  : idx === 3
                  ? Shield
                  : User;
              return (
                <article
                  key={member.id}
                  className={`rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033] ${
                    member.comingSoon ? 'border-dashed' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.imageAlt || member.name}
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 shrink-0 rounded-xl border-2 border-[#0E1033] object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-[#0E1033] text-white ${
                          member.accent === 'pink' ? 'bg-[#D1006F]' : 'bg-[#1F4BFF]'
                        }`}
                        aria-hidden="true"
                      >
                        <IconComp className="h-7 w-7" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#1F4BFF]">
                        {member.comingSoon ? 'Coming Soon' : member.role}
                      </p>
                      <h3 className="font-display text-xl font-bold text-[#0E1033]">
                        {member.name}
                      </h3>
                      <p className="text-sm font-medium text-[#D1006F]">{member.inspiration}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-[#0E1033]/85">
                    {member.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Season 1 */}
      {(ch?.sectionsEnabled?.season1 ?? true) && (
        <section>
          <h2 className="font-display text-3xl font-bold text-[#0E1033]">
            {ch?.seasonHeading || 'Season 1 Episodes'}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(ch?.episodes || []).map((ep) => (
              <article
                key={ep.id}
                className="rounded-2xl border-2 border-[#0E1033] bg-white p-5 flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-[#1F4BFF] tabular-nums">
                    Episode {ep.number}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold text-[#0E1033]">
                    {ep.title}
                  </h3>
                  <p className="mt-2 text-base text-[#0E1033]/80">{ep.summary}</p>
                </div>
                {ep.videoUrl && (
                  <a
                    href={ep.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#D1006F] underline underline-offset-4"
                  >
                    Watch episode <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Who Built This? Spotlight */}
      {(ch?.sectionsEnabled?.spotlights ?? true) && (
        <section>
          <h2 className="font-display text-3xl font-bold text-[#0E1033]">
            {ch?.spotlightHeading || 'Who Built This? Meet the people tech forgot to mention.'}
          </h2>

          {newestSpotlight ? (
            <div className="mt-6 space-y-6">
              {/* Featured newest spotlight */}
              <article className="grid grid-cols-1 gap-6 rounded-2xl border-2 border-[#0E1033] bg-white p-6 sm:p-8 shadow-[0_4px_0_#0E1033] md:grid-cols-12 md:items-center">
                <div className="md:col-span-4">
                  {newestSpotlight.photoUrl ? (
                    <img
                      src={newestSpotlight.photoUrl}
                      alt={newestSpotlight.photoAlt || newestSpotlight.name}
                      referrerPolicy="no-referrer"
                      className="h-56 w-full rounded-xl border-2 border-[#0E1033] object-cover"
                    />
                  ) : (
                    <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0E1033] bg-[#F7F8FF] p-4 text-center">
                      <User className="h-12 w-12 text-[#1F4BFF]" aria-hidden="true" />
                      <span className="mt-2 text-sm font-semibold text-[#0E1033]/75">
                        Photo placeholder
                      </span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-8 space-y-3">
                  <p className="text-sm font-bold text-[#D1006F]">
                    Featured Spotlight · {newestSpotlight.years}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0E1033]">
                    {newestSpotlight.name}
                  </h3>
                  <p className="text-base leading-relaxed text-[#0E1033]">
                    <span className="font-bold">What they did: </span>
                    {newestSpotlight.whatTheyDid}
                  </p>
                  <p className="text-base leading-relaxed text-[#0E1033]/85">
                    <span className="font-bold text-[#1F4BFF]">Why it matters today: </span>
                    {newestSpotlight.whyItMatters}
                  </p>
                </div>
              </article>

              {/* Scrollable row of older spotlights */}
              {olderSpotlights.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-[#0E1033]">
                    Earlier Spotlights
                  </h3>
                  <div className="mt-3 flex gap-4 overflow-x-auto pb-3" role="region" aria-label="Earlier spotlights">
                    {olderSpotlights.map((sp) => (
                      <article
                        key={sp._id}
                        className="w-72 shrink-0 rounded-2xl border-2 border-[#0E1033] bg-white p-5"
                      >
                        {sp.photoUrl ? (
                          <img
                            src={sp.photoUrl}
                            alt={sp.photoAlt || sp.name}
                            referrerPolicy="no-referrer"
                            className="h-36 w-full rounded-xl border-2 border-[#0E1033] object-cover"
                          />
                        ) : (
                          <div className="flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-[#0E1033] bg-[#F7F8FF]">
                            <User className="h-8 w-8 text-[#1F4BFF]" aria-hidden="true" />
                          </div>
                        )}
                        <p className="mt-3 text-xs font-bold text-[#D1006F]">{sp.years}</p>
                        <h4 className="font-display text-lg font-bold text-[#0E1033]">{sp.name}</h4>
                        <p className="mt-1.5 text-sm text-[#0E1033]/85">{sp.whatTheyDid}</p>
                        <p className="mt-2 text-sm text-[#1F4BFF] font-medium">
                          Why it matters today: {sp.whyItMatters}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-base text-[#0E1033]/80">
              No spotlights added yet. Add your first spotlight in Admin.
            </p>
          )}
        </section>
      )}

      {/* Free Tool of the Week */}
      {(ch?.sectionsEnabled?.freeTool ?? true) && currentTool && (
        <section className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 sm:p-8 shadow-[0_4px_0_#0E1033]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#D1006F]">
                {ch?.toolHeading || 'Free Tool of the Week'} · {currentTool.weekLabel}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold text-[#0E1033]">
                {currentTool.name}
              </h2>
            </div>
            <a
              href={currentTool.tryItUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-3 font-display text-base font-bold text-white shadow-[0_3px_0_#0E1033]"
            >
              Try It <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-4 text-base text-[#0E1033]">
            <span className="font-bold">What it does: </span>
            {currentTool.whatItDoes}
          </p>
          <p className="mt-2 text-base text-[#0E1033]/85">
            <span className="font-bold">Who it is for: </span>
            {currentTool.whoItIsFor}
          </p>

          {pastTools.length > 0 && (
            <div className="mt-5 border-t border-[#D8DDF5] pt-4">
              <button
                type="button"
                onClick={() => setShowPastTools((v) => !v)}
                aria-expanded={showPastTools}
                className="text-sm font-bold text-[#1F4BFF] underline underline-offset-4"
              >
                {showPastTools ? 'Hide past tools' : `See past tools (${pastTools.length})`}
              </button>
              {showPastTools && (
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pastTools.map((tool) => (
                    <li key={tool._id} className="rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-bold text-[#0E1033]">
                          {tool.name}
                        </h3>
                        <a
                          href={tool.tryItUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-[#D1006F] underline"
                        >
                          Try It
                        </a>
                      </div>
                      <p className="mt-1 text-sm text-[#0E1033]/85">{tool.whatItDoes}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {/* Newsletter */}
      {(ch?.sectionsEnabled?.newsletter ?? true) && (
        <section>
          <NewsletterBox />
        </section>
      )}
    </div>
  );
}
