import React, { useEffect, useMemo, useState } from 'react';
import { Check, Download, Search, Trash2, X } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import type { BookingSubmission, CommunityPost } from '../../types/site';

export function AdminInbox({ onChanged }: { onChanged: () => void }) {
  const { auth } = useSite();
  const isOwner = auth.user?.role === 'owner';

  const [tab, setTab] = useState<'bookings' | 'community' | 'moderators'>(
    isOwner ? 'bookings' : 'community'
  );
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [moderators, setModerators] = useState<{ _id: string; name: string; email: string; role: string }[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [modName, setModName] = useState('');
  const [modEmail, setModEmail] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [modFeedback, setModFeedback] = useState('');

  async function loadAll() {
    const commRes = await fetch('/api/admin/community');
    if (commRes.ok) {
      setPosts(await commRes.json());
    }
    if (isOwner) {
      const [bookRes, modRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/moderators'),
      ]);
      if (bookRes.ok) setBookings(await bookRes.json());
      if (modRes.ok) setModerators(await modRes.json());
    }
  }

  useEffect(() => {
    void loadAll();
  }, [isOwner]);

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.fullName.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.message.toLowerCase().includes(q)
    );
  }, [bookings, bookingSearch]);

  async function updateBooking(id: string, patch: { status?: string; notes?: string }) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await loadAll();
    onChanged();
  }

  async function updatePostStatus(id: string, status: 'approved' | 'rejected') {
    await fetch(`/api/admin/community/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadAll();
    onChanged();
  }

  async function deletePost(id: string) {
    await fetch(`/api/admin/community/${id}`, { method: 'DELETE' });
    await loadAll();
    onChanged();
  }

  async function addModerator(e: React.FormEvent) {
    e.preventDefault();
    setModFeedback('');
    const res = await fetch('/api/admin/moderators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modName, email: modEmail, password: modPassword }),
    });
    const d = await res.json();
    if (!res.ok) {
      setModFeedback(d.error || 'Could not add moderator.');
      return;
    }
    setModName('');
    setModEmail('');
    setModPassword('');
    setModFeedback('Moderator added!');
    await loadAll();
  }

  async function removeModerator(id: string) {
    await fetch(`/api/admin/moderators/${id}`, { method: 'DELETE' });
    await loadAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={() => setTab('bookings')}
              className={`rounded-xl border-2 border-[#0E1033] px-4 py-2 text-sm font-bold ${
                tab === 'bookings' ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
              }`}
            >
              Book a Brain Requests ({bookings.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setTab('community')}
            className={`rounded-xl border-2 border-[#0E1033] px-4 py-2 text-sm font-bold ${
              tab === 'community' ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
            }`}
          >
            Community Posts ({posts.filter((p) => p.status === 'pending').length} pending)
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => setTab('moderators')}
              className={`rounded-xl border-2 border-[#0E1033] px-4 py-2 text-sm font-bold ${
                tab === 'moderators' ? 'bg-[#1F4BFF] text-white' : 'bg-white text-[#0E1033]'
              }`}
            >
              Moderators ({moderators.length})
            </button>
          )}
        </div>

        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/admin/export/bookings"
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0E1033] bg-white px-3.5 py-2 text-xs font-bold"
            >
              <Download className="h-4 w-4 text-[#1F4BFF]" aria-hidden="true" /> Export Bookings CSV
            </a>
            <a
              href="/api/admin/export/community"
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0E1033] bg-white px-3.5 py-2 text-xs font-bold"
            >
              <Download className="h-4 w-4 text-[#1F4BFF]" aria-hidden="true" /> Export Posts CSV
            </a>
            <a
              href="/api/admin/export/newsletter"
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0E1033] bg-white px-3.5 py-2 text-xs font-bold"
            >
              <Download className="h-4 w-4 text-[#1F4BFF]" aria-hidden="true" /> Export Newsletter CSV
            </a>
          </div>
        )}
      </div>

      {/* BOOKINGS INBOX */}
      {tab === 'bookings' && isOwner && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0E1033]/60"
              aria-hidden="true"
            />
            <input
              type="search"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Search by name, email, or message..."
              aria-label="Search booking requests"
              className="w-full rounded-xl border-2 border-[#0E1033] bg-white py-2.5 pl-9 pr-3 text-sm"
            />
          </div>

          {filteredBookings.length === 0 ? (
            <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
              <p className="font-bold">No Book a Brain requests yet.</p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <article
                key={b._id}
                className="rounded-2xl border-2 border-[#0E1033] bg-white p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#1F4BFF]">
                      {new Date(b.createdAt).toLocaleString()} · {b.paymentOption} · Est. ${b.estimatedTotal}
                    </p>
                    <h3 className="font-display text-xl font-bold text-[#0E1033]">
                      {b.fullName}
                    </h3>
                    <p className="text-sm text-[#0E1033]/80">
                      {b.email} · {b.phone} · Best time: {b.bestTime}
                    </p>
                  </div>
                  <select
                    aria-label={`Status for ${b.fullName}`}
                    value={b.status}
                    onChange={(e) => updateBooking(b._id, { status: e.target.value })}
                    className="rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-1.5 text-sm font-bold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="booked">Booked</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <p className="text-sm font-semibold text-[#D1006F]">
                  Services: {b.serviceSnapshots?.map((s) => s.name).join(', ')}
                </p>
                <p className="text-base text-[#0E1033]">{b.message}</p>

                <div>
                  <label className="block text-xs font-bold text-[#0E1033]/75 mb-1">
                    Private notes
                  </label>
                  <input
                    type="text"
                    defaultValue={b.notes || ''}
                    onBlur={(e) => updateBooking(b._id, { notes: e.target.value })}
                    placeholder="Add a note (auto-saves when you click away)"
                    className="w-full rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] px-3 py-2 text-sm"
                  />
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* COMMUNITY MODERATION */}
      {tab === 'community' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
              <p className="font-bold">No community posts yet.</p>
            </div>
          ) : (
            posts.map((p) => (
              <article
                key={p._id}
                className="rounded-2xl border-2 border-[#0E1033] bg-white p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#1F4BFF]">
                      {p.topic} · Status: {p.status.toUpperCase()}
                    </p>
                    <h3 className="font-display text-xl font-bold text-[#0E1033]">
                      {p.displayName}
                    </h3>
                    {p.email && (
                      <p className="text-xs text-[#0E1033]/70">Private email: {p.email}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePostStatus(p._id, 'approved')}
                      className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-3.5 py-1.5 text-xs font-bold text-white"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePostStatus(p._id, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-[#D1006F] px-3.5 py-1.5 text-xs font-bold text-white"
                    >
                      <X className="h-4 w-4" aria-hidden="true" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePost(p._id)}
                      aria-label={`Delete post by ${p.displayName}`}
                      className="inline-flex items-center gap-1 rounded-xl border-2 border-[#0E1033] bg-white px-3 py-1.5 text-xs font-bold text-[#0E1033]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                    </button>
                  </div>
                </div>
                <p className="text-base text-[#0E1033]">{p.comment}</p>
              </article>
            ))
          )}
        </div>
      )}

      {/* MODERATORS MANAGEMENT (Owner Only) */}
      {tab === 'moderators' && isOwner && (
        <div className="space-y-6">
          <form onSubmit={addModerator} className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-[#0E1033]">
              Add a Moderator
            </h3>
            <p className="text-sm text-[#0E1033]/80">
              Moderators can only approve or reject community posts. They cannot change pages, prices, or bookings.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="text"
                required
                value={modName}
                onChange={(e) => setModName(e.target.value)}
                placeholder="Name"
                aria-label="Moderator name"
                className="rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 text-sm"
              />
              <input
                type="email"
                required
                value={modEmail}
                onChange={(e) => setModEmail(e.target.value)}
                placeholder="Email"
                aria-label="Moderator email"
                className="rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 text-sm"
              />
              <input
                type="password"
                required
                minLength={8}
                value={modPassword}
                onChange={(e) => setModPassword(e.target.value)}
                placeholder="Password (8+ chars)"
                aria-label="Moderator password"
                className="rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3 py-2 text-sm"
              />
            </div>
            {modFeedback && (
              <p role="status" className="text-sm font-bold text-[#1F4BFF]">
                {modFeedback}
              </p>
            )}
            <button
              type="submit"
              className="rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-2.5 font-display text-sm font-bold text-white"
            >
              Add Moderator
            </button>
          </form>

          <div className="space-y-2">
            {moderators.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between rounded-xl border-2 border-[#0E1033] bg-white px-4 py-3"
              >
                <div>
                  <p className="font-bold text-[#0E1033]">
                    {m.name} ({m.role})
                  </p>
                  <p className="text-sm text-[#0E1033]/75">{m.email}</p>
                </div>
                {m.role !== 'owner' && (
                  <button
                    type="button"
                    onClick={() => removeModerator(m._id)}
                    className="rounded-lg border-2 border-[#0E1033] px-3 py-1 text-xs font-bold text-[#D1006F]"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
