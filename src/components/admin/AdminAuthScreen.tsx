import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

export function AdminAuthScreen() {
  const { auth, refreshAuth } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();
  const resetToken = searchParams.get('reset') || '';

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>(
    resetToken ? 'reset' : 'login'
  );
  const [name, setName] = useState('Owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create your admin account.');
        return;
      }
      await refreshAuth();
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login did not work.');
        return;
      }
      await refreshAuth();
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setInfo(data.message || 'Check your notification email for a reset link.');
    } catch {
      setError('Could not send reset request.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not reset password.');
        return;
      }
      setInfo(data.message || 'Password updated! You can log in now.');
      setSearchParams({});
      setPassword('');
      setMode('login');
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  if (!auth.hasAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 sm:p-8 shadow-[0_6px_0_#0E1033]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] text-white">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-[#0E1033]">
            Set Up Your Admin Login
          </h1>
          <p className="mt-2 text-sm text-[#0E1033]/85">
            Welcome! Since this is your first time opening Admin, pick your email and password so only you can edit the website.
          </p>

          <form onSubmit={handleSetup} className="mt-6 space-y-4">
            <div>
              <label htmlFor="setup-name" className="block text-sm font-bold mb-1">
                Your name
              </label>
              <input
                id="setup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
              />
            </div>
            <div>
              <label htmlFor="setup-email" className="block text-sm font-bold mb-1">
                Admin email
              </label>
              <input
                id="setup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bitznbrainsco@gmail.com"
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
              />
            </div>
            <div>
              <label htmlFor="setup-pw" className="block text-sm font-bold mb-1">
                Password (at least 8 characters)
              </label>
              <input
                id="setup-pw"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
              />
            </div>

            <div aria-live="polite">
              {error && (
                <p role="alert" className="text-sm font-bold text-[#D1006F]">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-3 font-display text-base font-bold text-white"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 sm:p-8 shadow-[0_6px_0_#0E1033]">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#0E1033] bg-[#D1006F] text-white">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>

        {mode === 'login' && (
          <>
            <h1 className="mt-4 font-display text-3xl font-bold text-[#0E1033]">Admin Login</h1>
            <p className="mt-1 text-sm text-[#0E1033]/80">
              Sign in to edit pages, check requests, and review community posts.
            </p>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-bold mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                />
              </div>
              <div>
                <label htmlFor="login-pw" className="block text-sm font-bold mb-1">
                  Password
                </label>
                <input
                  id="login-pw"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                />
              </div>
              <div aria-live="polite">
                {error && (
                  <p role="alert" className="text-sm font-bold text-[#D1006F]">
                    {error}
                  </p>
                )}
                {info && (
                  <p role="status" className="text-sm font-bold text-[#1F4BFF]">
                    {info}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-3 font-display text-base font-bold text-white"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfo('');
                  setMode('forgot');
                }}
                className="block w-full text-center text-sm font-bold text-[#1F4BFF] underline underline-offset-4"
              >
                Forgot password?
              </button>
            </form>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h1 className="mt-4 font-display text-3xl font-bold text-[#0E1033]">
              Reset Your Password
            </h1>
            <p className="mt-1 text-sm text-[#0E1033]/80">
              Enter your admin email and we will send a reset link to your notification email.
            </p>
            <form onSubmit={handleForgot} className="mt-6 space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-bold mb-1">
                  Admin email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                />
              </div>
              <div aria-live="polite">
                {error && (
                  <p role="alert" className="text-sm font-bold text-[#D1006F]">
                    {error}
                  </p>
                )}
                {info && (
                  <p role="status" className="text-sm font-bold text-[#1F4BFF]">
                    {info}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#D1006F] px-5 py-3 font-display text-base font-bold text-white"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="block w-full text-center text-sm font-bold text-[#0E1033] underline"
              >
                Back to login
              </button>
            </form>
          </>
        )}

        {mode === 'reset' && (
          <>
            <h1 className="mt-4 font-display text-3xl font-bold text-[#0E1033]">
              Choose a New Password
            </h1>
            <form onSubmit={handleReset} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reset-pw" className="block text-sm font-bold mb-1">
                  New password (at least 8 characters)
                </label>
                <input
                  id="reset-pw"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                />
              </div>
              <div aria-live="polite">
                {error && (
                  <p role="alert" className="text-sm font-bold text-[#D1006F]">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-2 border-[#0E1033] bg-[#1F4BFF] px-5 py-3 font-display text-base font-bold text-white"
              >
                {loading ? 'Saving...' : 'Save New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
