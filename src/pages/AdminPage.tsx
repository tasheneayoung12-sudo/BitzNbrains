import { useCallback, useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminAuthScreen } from '../components/admin/AdminAuthScreen';
import { AdminPagesEditor } from '../components/admin/AdminPagesEditor';
import { AdminListsManager } from '../components/admin/AdminListsManager';
import { AdminInbox } from '../components/admin/AdminInbox';

interface OverviewData {
  dbMode: 'mongodb' | 'local';
  newBookings: number;
  pendingPosts: number;
  newsletterCount: number;
  recentSubscribers: { _id: string; firstName: string; email: string; createdAt: string }[];
}

export function AdminPage() {
  const { auth } = useSite();
  const [section, setSection] = useState<'overview' | 'inbox' | 'pages' | 'lists'>('overview');
  const [overview, setOverview] = useState<OverviewData | null>(null);

  const loadOverview = useCallback(async () => {
    if (!auth.authenticated) return;
    const res = await fetch('/api/admin/overview');
    if (res.ok) {
      setOverview(await res.json());
    }
  }, [auth.authenticated]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (!auth.loaded) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="font-display text-xl font-bold">Checking admin login...</p>
      </div>
    );
  }

  if (!auth.authenticated) {
    return (
      <>
        <SeoHead
          pageKey="admin"
          fallbackTitle="Admin Login – Bits & Brains Collective"
          fallbackDescription="Admin sign in for Bits & Brains Collective."
        />
        <AdminAuthScreen />
      </>
    );
  }

  const isOwner = auth.user?.role === 'owner';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      <SeoHead
        pageKey="admin"
        fallbackTitle="Admin Dashboard – Bits & Brains Collective"
        fallbackDescription="Manage website text, images, services, resources, events, and community posts."
      />

      <header className="border-b-2 border-[#D8DDF5] pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0E1033]">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#0E1033]/80">
          Edit your website in plain language—no code needed.
          {overview?.dbMode === 'local'
            ? ' (Preview storage active: add MONGODB_URI in Secrets to connect MongoDB Atlas.)'
            : overview?.dbMode === 'mongodb'
            ? ' (Connected to MongoDB Atlas.)'
            : ''}
        </p>
      </header>

      {/* Main Dashboard Tabs */}
      <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSection('overview')}
          className={`rounded-xl border-2 border-[#0E1033] px-4 py-2.5 font-display text-sm font-bold ${
            section === 'overview' ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
          }`}
        >
          Dashboard Home
        </button>
        <button
          type="button"
          onClick={() => setSection('inbox')}
          className={`rounded-xl border-2 border-[#0E1033] px-4 py-2.5 font-display text-sm font-bold ${
            section === 'inbox' ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
          }`}
        >
          Inbox & Moderation
        </button>
        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => setSection('pages')}
              className={`rounded-xl border-2 border-[#0E1033] px-4 py-2.5 font-display text-sm font-bold ${
                section === 'pages' ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
              }`}
            >
              Edit Pages & SEO
            </button>
            <button
              type="button"
              onClick={() => setSection('lists')}
              className={`rounded-xl border-2 border-[#0E1033] px-4 py-2.5 font-display text-sm font-bold ${
                section === 'lists' ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
              }`}
            >
              Manage Lists
            </button>
          </>
        )}
      </nav>

      {/* Dashboard Home */}
      {section === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033]">
              <p className="text-sm font-bold text-[#0E1033]/75">New Booking Requests</p>
              <p className="mt-2 font-display text-4xl font-bold text-[#1F4BFF] tabular-nums">
                {overview?.newBookings ?? 0}
              </p>
              <button
                type="button"
                onClick={() => setSection('inbox')}
                className="mt-3 text-sm font-bold text-[#D1006F] underline"
              >
                Open inbox
              </button>
            </div>

            <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033]">
              <p className="text-sm font-bold text-[#0E1033]/75">Pending Community Posts</p>
              <p className="mt-2 font-display text-4xl font-bold text-[#D1006F] tabular-nums">
                {overview?.pendingPosts ?? 0}
              </p>
              <button
                type="button"
                onClick={() => setSection('inbox')}
                className="mt-3 text-sm font-bold text-[#1F4BFF] underline"
              >
                Review posts
              </button>
            </div>

            <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033]">
              <p className="text-sm font-bold text-[#0E1033]/75">Newsletter Signups</p>
              <p className="mt-2 font-display text-4xl font-bold text-[#0E1033] tabular-nums">
                {overview?.newsletterCount ?? 0}
              </p>
              {isOwner && (
                <a
                  href="/api/admin/export/newsletter"
                  className="mt-3 inline-block text-sm font-bold text-[#1F4BFF] underline"
                >
                  Download CSV
                </a>
              )}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
            <h2 className="font-display text-xl font-bold text-[#0E1033]">
              Newest Newsletter Signups
            </h2>
            {!overview?.recentSubscribers?.length ? (
              <p className="mt-2 text-sm text-[#0E1033]/75">No signups yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-[#D8DDF5]">
                {overview.recentSubscribers.map((sub) => (
                  <li key={sub._id} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
                    <span className="font-bold text-[#0E1033]">
                      {sub.firstName} ({sub.email})
                    </span>
                    <span className="text-[#0E1033]/70">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {section === 'inbox' && <AdminInbox onChanged={loadOverview} />}
      {section === 'pages' && isOwner && <AdminPagesEditor />}
      {section === 'lists' && isOwner && <AdminListsManager />}
    </div>
  );
}
