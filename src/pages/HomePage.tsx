import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { BrainLogo } from '../components/BrainLogo';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';
import type { HomeBubble } from '../types/site';

function BubbleLink({ bubble, animClass }: { bubble: HomeBubble; animClass: string }) {
  const isBlue = bubble.color === 'blue';
  return (
    <Link
      to={bubble.to}
      className={`group block rounded-3xl border-2 border-[#0E1033] p-5 sm:p-6 text-center transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ${animClass} ${
        isBlue
          ? 'bg-[#1F4BFF] text-white shadow-[0_6px_0_#0E1033] hover:shadow-[0_0_0_5px_#1F4BFF,0_6px_0_#0E1033]'
          : 'bg-[#D1006F] text-white shadow-[0_6px_0_#0E1033] hover:shadow-[0_0_0_5px_#FF2E93,0_6px_0_#0E1033]'
      }`}
    >
      <span className="block font-display text-xl sm:text-2xl font-bold leading-tight">
        {bubble.title}
      </span>
      <span className="mt-1.5 block text-sm sm:text-base font-medium text-white/95">
        {bubble.subtitle}
      </span>
    </Link>
  );
}

export function HomePage() {
  const { siteContent } = useSite();
  const home = siteContent?.home;
  const bubbles = home?.bubbles || [
    {
      id: 'b-about',
      title: 'Meet the Creator',
      subtitle: 'The person behind the brains',
      to: '/about',
      color: 'pink' as const,
    },
    {
      id: 'b-channel',
      title: 'Watch the Channel',
      subtitle: 'Tech made easy, one video at a time',
      to: '/channel',
      color: 'blue' as const,
    },
    {
      id: 'b-book',
      title: 'Book a Brain',
      subtitle: 'Get help with tech, websites & more',
      to: '/book-a-brain',
      color: 'blue' as const,
    },
    {
      id: 'b-community',
      title: 'Join the Community',
      subtitle: 'Share ideas and ask questions',
      to: '/community',
      color: 'pink' as const,
    },
  ];

  const bottomLinks = home?.bottomLinks || [
    { id: 'ql-resources', label: 'Resources', to: '/resources' },
    { id: 'ql-events', label: 'Tech Events', to: '/events' },
    { id: 'ql-bootcamps', label: 'Bootcamps', to: '/bootcamps' },
    { id: 'ql-code', label: 'Our Code', to: '/our-code' },
  ];

  const topLeft = bubbles[0];
  const topRight = bubbles[1];
  const bottomLeft = bubbles[2];
  const bottomRight = bubbles[3];

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SeoHead
        pageKey="home"
        fallbackTitle="Bits & Brains Collective – Computer Science, Made Easy"
        fallbackDescription="Explore computer science videos, friendly tech help, free community support, and plain-language resources from Bits & Brains Collective."
      />

      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#0E1033]">
            {home?.topName || 'Bits & Brains Collective'}
          </h1>
          <AdminEditButton pageKey="home" label="Home" />
        </div>

        {/* Desktop Orbital Hub: 2 bubbles left, bobbing brain center, 2 bubbles right */}
        <div className="mt-10 hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-8 w-full">
          <div className="lg:col-span-4 space-y-8">
            {topLeft && <BubbleLink bubble={topLeft} animClass="animate-bubble-a" />}
            {bottomLeft && <BubbleLink bubble={bottomLeft} animClass="animate-bubble-b" />}
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="animate-gentle-bob">
              <BrainLogo
                size="lg"
                logoUrl={siteContent?.branding.logoUrl}
                logoAlt={siteContent?.branding.logoAlt}
              />
            </div>
            <p className="mt-6 font-display text-2xl font-bold text-[#0E1033]">
              {home?.promptLine || 'Where do you want to start?'}
            </p>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {topRight && <BubbleLink bubble={topRight} animClass="animate-bubble-b" />}
            {bottomRight && <BubbleLink bubble={bottomRight} animClass="animate-bubble-a" />}
          </div>
        </div>

        {/* Mobile / Tablet Layout: Bobbing brain on top, 2x2 grid of bubbles underneath */}
        <div className="mt-8 flex flex-col items-center w-full lg:hidden">
          <div className="animate-gentle-bob">
            <BrainLogo
              size="lg"
              logoUrl={siteContent?.branding.logoUrl}
              logoAlt={siteContent?.branding.logoAlt}
            />
          </div>
          <p className="mt-5 font-display text-xl sm:text-2xl font-bold text-[#0E1033]">
            {home?.promptLine || 'Where do you want to start?'}
          </p>

          <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:gap-5">
            {bubbles.map((bubble, i) => (
              <BubbleLink
                key={bubble.id}
                bubble={bubble}
                animClass={i % 2 === 0 ? 'animate-bubble-a' : 'animate-bubble-b'}
              />
            ))}
          </div>
        </div>

        {/* Bottom quick links */}
        <nav
          aria-label="More pages"
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-[#D8DDF5] pt-6"
        >
          {bottomLinks.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="text-sm sm:text-base font-semibold text-[#0E1033] underline decoration-[#1F4BFF] decoration-2 underline-offset-4 hover:text-[#1F4BFF]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
