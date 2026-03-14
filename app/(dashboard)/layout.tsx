import React from 'react';
import OfflineIndicator from '@/components/ui/OfflineIndicator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <OfflineIndicator />
      {children}
    </div>
  );
}
