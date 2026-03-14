'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin border-4 border-[var(--brand-primary)] border-t-transparent rounded-full" />
        <p className="font-bold text-[var(--text-secondary)]">Loading settings...</p>
      </div>
    );
  }

  const role = (session?.user as any)?.role || 'staff';

  if (role !== 'manager') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Access Restricted</h3>
        <p className="text-[var(--text-secondary)]">You need manager privileges to view this page.</p>
        <Link 
          href="/dashboard" 
          className="mt-4 px-6 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/20 transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">System Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm">Manage application preferences and user configurations.</p>
      </header>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
           <div>
             <h3 className="text-sm font-bold text-[var(--text-primary)]">Data Retention</h3>
             <p className="text-xs text-[var(--text-secondary)] mb-2">Configure how long audit logs and history records are kept.</p>
             <select className="bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-sm">
               <option>30 days</option>
               <option>90 days</option>
               <option>1 year</option>
             </select>
           </div>
           <hr className="border-[var(--border)]" />
           <div>
             <h3 className="text-sm font-bold text-[var(--text-primary)]">Default Currency</h3>
             <p className="text-xs text-[var(--text-secondary)] mb-2">Set the default currency symbol for inventory valuation.</p>
             <select className="bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-sm">
               <option>₹ (INR)</option>
               <option>$ (USD)</option>
               <option>€ (EUR)</option>
             </select>
           </div>
        </div>
      </div>
    </div>
  );
}
