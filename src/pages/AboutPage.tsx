import { User } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';

export function AboutPage() {
  const { siteContent } = useSite();
  const ab = siteContent?.about;

  if (siteContent && !siteContent.pagesEnabled.about) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Meet the Creator is paused right now.</h1>
        <p className="mt-2 text-base">Please check out The Channel or Resources in the meantime.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-12">
      <SeoHead
        pageKey="about"
        fallbackTitle="Meet the Creator – Bits & Brains Collective"
        fallbackDescription="Get to know the creator behind Bits & Brains Collective, their story, credentials, and core beliefs."
      />

      <section className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5">
          {ab?.photoUrl ? (
            <img
              src={ab.photoUrl}
              alt={ab.photoAlt || 'Creator portrait'}
              referrerPolicy="no-referrer"
              className="aspect-square w-full rounded-2xl border-2 border-[#0E1033] object-cover shadow-[0_6px_0_#0E1033]"
            />
          ) : (
            <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-[#0E1033] bg-white flex flex-col items-center justify-center p-6 text-center shadow-[0_6px_0_#0E1033]">
              <div className="rounded-full border-2 border-[#0E1033] bg-[#F7F8FF] p-5">
                <User className="h-14 w-14 text-[#1F4BFF]" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-lg font-bold text-[#0E1033]">
                Creator Photo Placeholder
              </p>
              <p className="mt-1 text-sm text-[#0E1033]/75">
                Upload your photo anytime in the Admin page.
              </p>
            </div>
          )}
        </div>

        <div className="md:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0E1033]">
              {ab?.heroTitle || 'Meet the Creator'}
            </h1>
            <AdminEditButton pageKey="about" label="About Me" />
          </div>
          <p className="text-lg leading-relaxed text-[#0E1033]/85">
            {ab?.heroSubtitle}
          </p>

          {(ab?.sectionsEnabled?.bio ?? true) && (
            <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-[#1F4BFF]">
                {ab?.bioHeading || 'About Me'}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-[#0E1033]">{ab?.bioText}</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(ab?.sectionsEnabled?.story ?? true) && (
          <article className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033]">
            <h2 className="font-display text-2xl font-bold text-[#D1006F]">
              {ab?.storyHeading || 'My Story'}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#0E1033]">{ab?.storyText}</p>
          </article>
        )}

        {(ab?.sectionsEnabled?.credentials ?? true) && (
          <article className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033]">
            <h2 className="font-display text-2xl font-bold text-[#1F4BFF]">
              {ab?.credentialsHeading || 'Experience & Credentials'}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#0E1033]">{ab?.credentialsText}</p>
          </article>
        )}
      </section>

      {(ab?.sectionsEnabled?.beliefs ?? true) && (
        <section>
          <h2 className="font-display text-3xl font-bold text-[#0E1033]">
            {ab?.beliefsHeading || 'What I Believe'}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(ab?.beliefs || []).map((b, idx) => (
              <article
                key={b.id}
                className="rounded-2xl border-2 border-[#0E1033] bg-white p-6"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#D1006F]">
                  0{idx + 1}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#0E1033]">{b.title}</h3>
                <p className="mt-2 text-base text-[#0E1033]/85">{b.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
