import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { BrainLogo } from './BrainLogo';
import { NewsletterBox } from './NewsletterBox';
import { InlineEditModal } from './InlineEditModal';

export function Layout({ children }: { children: React.ReactNode }) {
  const { siteContent, auth, viewMode, setViewMode, logout } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const pagesEnabled = siteContent?.pagesEnabled;
  const navLinks = [
    { to: '/channel', label: 'Channel', enabled: pagesEnabled?.channel ?? true },
    { to: '/about', label: 'About', enabled: pagesEnabled?.about ?? true },
    { to: '/resources', label: 'Resources', enabled: pagesEnabled?.resources ?? true },
    { to: '/community', label: 'Community', enabled: pagesEnabled?.community ?? true },
    { to: '/bootcamps', label: 'Bootcamps', enabled: pagesEnabled?.bootcamps ?? true },
  ].filter((l) => l.enabled);

  const mobileAllLinks = [
    { to: '/', label: 'Home' },
    ...navLinks,
    ...(pagesEnabled?.events ?? true ? [{ to: '/events', label: 'Tech Events' }] : []),
    ...(pagesEnabled?.ourCode ?? true ? [{ to: '/our-code', label: 'Our Code' }] : []),
    ...(pagesEnabled?.bookABrain ?? true ? [{ to: '/book-a-brain', label: 'Book a Brain' }] : []),
  ];

  const brandName = siteContent?.branding.siteName || 'Bits & Brains Collective';
  const handle = siteContent?.branding.handle || '@BitsNBrainsCo';
  const youtubeUrl = siteContent?.branding.youtubeUrl || 'https://www.youtube.com/@BitsNBrainsCo';
  const privacyNote =
    siteContent?.branding.footerPrivacyNote ||
    'Your privacy matters. Contact info you share with us is never shown publicly or sold to anyone.';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FF] text-[#0E1033]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Admin View Toggle Bar — ONLY shown when logged in, NEVER visible to visitors */}
      {auth.authenticated && (
        <div className="border-b-2 border-[#0E1033] bg-[#0E1033] text-white px-4 py-2">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                Signed in as {auth.user?.email} ({auth.user?.role})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {auth.user?.role === 'owner' && (
                <div className="inline-flex rounded-lg border border-white/30 bg-white/10 p-0.5" role="group" aria-label="View mode">
                  <button
                    type="button"
                    onClick={() => setViewMode('admin')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                      viewMode === 'admin' ? 'bg-[#FF2E93] text-white' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    View as Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('visitor')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                      viewMode === 'visitor' ? 'bg-[#1F4BFF] text-white' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    View as Visitor
                  </button>
                </div>
              )}
              <Link
                to="/admin"
                className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#0E1033] hover:bg-[#F7F8FF] whitespace-nowrap"
              >
                Admin Dashboard
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-lg border border-white/40 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10 whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean 3-zone Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[#0E1033] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
          {/* Zone 1: Logo placeholder + single-line Brand wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 font-display text-xl font-bold tracking-tight text-[#0E1033] whitespace-nowrap shrink-0"
          >
            <BrainLogo
              size="sm"
              logoUrl={siteContent?.branding.logoUrl}
              logoAlt={siteContent?.branding.logoAlt}
            />
            <span>{brandName}</span>
          </Link>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-semibold whitespace-nowrap shrink-0 transition-colors hover:text-[#1F4BFF] ${
                    isActive ? 'text-[#1F4BFF] underline decoration-2 underline-offset-8' : 'text-[#0E1033]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {(pagesEnabled?.bookABrain ?? true) && (
              <Link
                to="/book-a-brain"
                className="hidden sm:inline-flex items-center justify-center rounded-xl border-2 border-[#0E1033] bg-[#D1006F] px-4 py-2 font-display text-sm font-semibold text-white shadow-[0_3px_0_#0E1033] transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                Book a Brain
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex lg:hidden items-center justify-center rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] p-2 text-[#0E1033]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t-2 border-[#0E1033] bg-white px-4 py-4 lg:hidden"
          >
            <ul className="grid grid-cols-2 gap-2">
              {mobileAllLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-xl border-2 px-3 py-2.5 text-sm font-semibold ${
                      location.pathname === item.to
                        ? 'border-[#1F4BFF] bg-[#1F4BFF] text-white'
                        : 'border-[#0E1033] bg-[#F7F8FF] text-[#0E1033]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <InlineEditModal />

      {/* Footer (every page) */}
      <footer className="mt-16 border-t-2 border-[#0E1033] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <BrainLogo
                  size="sm"
                  logoUrl={siteContent?.branding.logoUrl}
                  logoAlt={siteContent?.branding.logoAlt}
                />
                <div>
                  <p className="font-display text-lg font-bold text-[#0E1033]">{brandName}</p>
                  <p className="text-sm font-semibold text-[#1F4BFF]">{handle}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#0E1033]/80">{privacyNote}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D1006F] underline underline-offset-4 hover:text-[#1F4BFF]"
                >
                  YouTube {handle}
                </a>
                <Link
                  to="/our-code"
                  className="text-[#0E1033] underline underline-offset-4 hover:text-[#1F4BFF]"
                >
                  Our Code
                </Link>
                <Link
                  to="/resources"
                  className="text-[#0E1033] underline underline-offset-4 hover:text-[#1F4BFF]"
                >
                  Resources
                </Link>
                <Link
                  to="/events"
                  className="text-[#0E1033] underline underline-offset-4 hover:text-[#1F4BFF]"
                >
                  Tech Events
                </Link>
                <Link
                  to="/admin"
                  className="text-[#0E1033]/70 underline underline-offset-4 hover:text-[#1F4BFF]"
                >
                  Admin
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <NewsletterBox
                compact
                title="Join the Bits & Brains Newsletter"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
