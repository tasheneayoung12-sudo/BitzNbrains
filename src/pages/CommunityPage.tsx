import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';
import { validateCommunityForm } from '../lib/domain';
import type { CommunityPost, CommunityTopic } from '../types/site';

const TOPICS: CommunityTopic[] = [
  'Intro to Computer Science',
  'Coding',
  'AI & Machine Learning',
  'Cybersecurity',
  'Careers in Tech',
  'Other',
];

export function CommunityPage() {
  const { siteContent } = useSite();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<CommunityTopic>('Intro to Computer Science');
  const [comment, setComment] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch('/api/community')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setPosts(d))
      .finally(() => setLoading(false));
  }, []);

  const groupedPosts = useMemo(() => {
    const map = new Map<CommunityTopic, CommunityPost[]>();
    for (const t of TOPICS) map.set(t, []);
    for (const p of posts) {
      const list = map.get(p.topic) || [];
      list.push(p);
      map.set(p.topic, list);
    }
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [posts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setConfirmation('');
    const fieldErrors = validateCommunityForm({ displayName, email, topic, comment, agreed });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email,
          topic,
          comment,
          agreed,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Could not post right now. Please check your entries.');
        return;
      }
      setConfirmation(
        data.message || 'Thank you! Please allow 24–48 hours for your comment to be reviewed and posted.'
      );
      setDisplayName('');
      setEmail('');
      setComment('');
      setAgreed(false);
      setErrors({});
    } catch {
      setSubmitError('Network hiccup. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const copy = siteContent?.community;

  if (siteContent && !siteContent.pagesEnabled.community) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Community is taking a short break.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-12">
      <SeoHead
        pageKey="community"
        fallbackTitle="Join the Community – Bits & Brains Collective"
        fallbackDescription="Share ideas, ask beginner-friendly tech questions, and learn together in a respectful community."
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0E1033]">
            {copy?.heading || 'Join the Community'}
          </h1>
          <AdminEditButton pageKey="community" label="Community" />
        </div>
        <p className="max-w-3xl text-lg text-[#0E1033]/85">{copy?.intro}</p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Post Form */}
        <section
          aria-labelledby="community-form-heading"
          className="lg:col-span-5 rounded-2xl border-2 border-[#0E1033] bg-white p-6 shadow-[0_4px_0_#0E1033] h-fit"
        >
          <h2 id="community-form-heading" className="font-display text-2xl font-bold text-[#0E1033]">
            Share an Idea or Question
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            {/* Hidden honeypot field */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="comm-website">Website</label>
              <input
                id="comm-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="comm-name" className="block text-sm font-bold text-[#0E1033] mb-1">
                Display name
              </label>
              <input
                id="comm-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Maya R."
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
              />
              {errors.displayName && (
                <p role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                  {errors.displayName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="comm-email" className="block text-sm font-bold text-[#0E1033] mb-1">
                Email (never shown publicly)
              </label>
              <input
                id="comm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="comm-topic" className="block text-sm font-bold text-[#0E1033] mb-1">
                Topic
              </label>
              <select
                id="comm-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value as CommunityTopic)}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="comm-comment" className="block text-sm font-bold text-[#0E1033] mb-1">
                Comment or question
              </label>
              <textarea
                id="comm-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ask anything or share a helpful tip..."
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
              />
              {errors.comment && (
                <p role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                  {errors.comment}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#1F4BFF]"
                />
                <span className="text-sm text-[#0E1033]">
                  {copy?.agreementText ||
                    'I agree to keep it respectful: no profanity, hate, harassment or disrespect of any kind.'}{' '}
                  <Link
                    to="/our-code"
                    className="font-bold text-[#1F4BFF] underline underline-offset-4"
                  >
                    Read Our Code.
                  </Link>
                </span>
              </label>
            </div>

            <div aria-live="polite">
              {submitError && (
                <p role="alert" className="text-sm font-bold text-[#D1006F]">
                  {submitError}
                </p>
              )}
              {confirmation && (
                <p role="status" className="rounded-xl border-2 border-[#1F4BFF] bg-[#F7F8FF] p-3 text-sm font-bold text-[#1F4BFF]">
                  {confirmation}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!agreed || submitting}
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-3 font-display text-base font-bold text-white shadow-[0_4px_0_#0E1033] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? 'Submitting Post...' : 'Post to Community'}
            </button>
          </form>
        </section>

        {/* Approved Community Posts Grouped by Topic */}
        <section className="lg:col-span-7 space-y-8" aria-labelledby="approved-posts-heading">
          <h2 id="approved-posts-heading" className="font-display text-3xl font-bold text-[#0E1033]">
            Community Board
          </h2>

          {loading ? (
            <p>Loading community posts...</p>
          ) : groupedPosts.length === 0 ? (
            <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6">
              <p className="font-display text-xl font-bold">No approved posts yet.</p>
              <p className="mt-1 text-sm text-[#0E1033]/80">
                Be the first to share a question or idea on the left!
              </p>
            </div>
          ) : (
            groupedPosts.map(([topicName, list]) => (
              <div key={topicName} className="space-y-3">
                <h3 className="font-display text-xl font-bold text-[#1F4BFF] border-b-2 border-[#D8DDF5] pb-1.5">
                  {topicName}
                </h3>
                <div className="space-y-3">
                  {list.map((post) => (
                    <article
                      key={post._id}
                      className="rounded-2xl border-2 border-[#0E1033] bg-white p-5"
                    >
                      <div className="flex items-center gap-2 text-sm font-bold text-[#0E1033]">
                        <MessageCircle className="h-4 w-4 text-[#D1006F]" aria-hidden="true" />
                        <span>{post.displayName}</span>
                        <span className="text-[#0E1033]/50 font-normal">·</span>
                        <span className="text-xs font-medium text-[#0E1033]/70">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-base leading-relaxed text-[#0E1033]">
                        {post.comment}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
