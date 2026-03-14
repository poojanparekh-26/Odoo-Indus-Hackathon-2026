'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('manager');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.');
      } else {
        router.push('/login');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">CoreInventory</h1>
          <p className="text-sm text-[var(--text-secondary)]">Create your account</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-4 shadow-sm"
        >
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Account Type
            </label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] appearance-none"
            >
              <option value="manager">Manager (Full Access)</option>
              <option value="staff">Staff (View Only)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--brand-primary)] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--brand-primary)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
