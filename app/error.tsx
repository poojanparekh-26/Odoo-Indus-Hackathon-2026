'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-red-200/50 animate-bounce">
        <AlertTriangle className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tight">
        Something went wrong
      </h1>
      
      <p className="text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
        An unexpected error occurred in this part of the application. 
        <span className="block mt-2 font-mono text-xs bg-red-50 text-red-600 p-2 rounded border border-red-100">
          {error.message || 'Unknown application error'}
        </span>
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[var(--brand-primary)] text-white rounded-2xl font-bold hover:scale-[1.05] transition-transform active:scale-95 shadow-lg shadow-[var(--brand-primary)]/20"
        >
          <RefreshCcw className="w-5 h-5" />
          Try Again
        </button>
        
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-2xl font-bold hover:bg-[var(--bg-secondary)] transition-all active:scale-95"
        >
          <Home className="w-5 h-5" />
          Back to Safety
        </Link>
      </div>
    </div>
  );
}
