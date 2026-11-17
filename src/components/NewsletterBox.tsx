import React, { useId, useState } from 'react';

interface NewsletterBoxProps {
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

export function NewsletterBox({
  compact = false,
  title = 'Get friendly tech updates',
  subtitle = 'New videos, plain-language guides, and free tools sent right to your inbox.',
}: NewsletterBoxProps) {
  const idPrefix = useId();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setStatus('error');
      setMessage('Please add your first name so we know how to greet you.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error');
      setMessage('Please add a valid email address so we can send your updates.');
      return;
    }
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Could not sign you up right now. Please try again.');
        return;
      }
      setStatus('success');
      setMessage(data.message || 'Welcome! You are signed up.');
      setFirstName('');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network hiccup. Please check your connection and try again.');
    }
  }

  return (
    <div
      className={
        compact
          ? 'w-full'
          : 'rounded-2xl border-2 border-[#0E1033] bg-white p-6 sm:p-8 shadow-[0_4px_0_#0E1033]'
      }
    >
      <h3 className={compact ? 'font-display text-lg font-bold text-[#0E1033]' : 'font-display text-2xl font-bold text-[#0E1033]'}>
        {title}
      </h3>
      {!compact && <p className="mt-1 text-base text-[#0E1033]/80">{subtitle}</p>}

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3" noValidate>
        <div>
          <label
            htmlFor={`${idPrefix}-fname`}
            className="block text-sm font-semibold text-[#0E1033] mb-1"
          >
            First name
          </label>
          <input
            id={`${idPrefix}-fname`}
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your first name"
            className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5 text-base text-[#0E1033] placeholder:text-[#0E1033]/50"
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-email`}
            className="block text-sm font-semibold text-[#0E1033] mb-1"
          >
            Email address
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5 text-base text-[#0E1033] placeholder:text-[#0E1033]/50"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-2.5 font-display text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 whitespace-nowrap"
          >
            {status === 'submitting' ? 'Signing Up...' : 'Join Newsletter'}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="mt-2 min-h-[1.25rem]">
        {message && (
          <p
            className={`text-sm font-medium ${
              status === 'error' ? 'text-[#D1006F]' : 'text-[#1F4BFF]'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
