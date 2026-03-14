'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/dashboard');
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
          <p className="text-sm text-[var(--text-secondary)]">Sign in to your account</p>
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
            <label htmlFor="password" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--brand-primary)] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
          
          <div className="text-center pt-2">
            <p className="text-[11px] text-[var(--text-secondary)] italic">
              Demo: admin@coreinventory.com / admin123 (Manager)
            </p>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--brand-primary)] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
