import React from 'react';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center">
      <div className="relative mb-8">
        <span className="text-[120px] font-black text-[var(--text-primary)] opacity-5 select-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center animate-pulse">
            <Search className="w-10 h-10" />
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tight">
        Page Not Found
      </h1>
      
      <p className="text-[var(--text-secondary)] max-w-sm mb-12 leading-relaxed">
        The page you are looking for might have been moved, deleted, or never existed in the first place.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[var(--brand-primary)] text-white rounded-2xl font-bold hover:scale-[1.05] transition-transform active:scale-95 shadow-lg shadow-[var(--brand-primary)]/20"
        >
          <Home className="w-5 h-5" />
          Go to Dashboard
        </Link>
        
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-2xl font-bold hover:bg-[var(--bg-secondary)] transition-all active:scale-95 sm:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </div>
  );
}
