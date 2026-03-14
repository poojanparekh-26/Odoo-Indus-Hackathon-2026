import React from 'react';
import LowStockBanner from '@/components/dashboard/LowStockBanner';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import DashboardKPIs from '@/components/dashboard/DashboardKPIs';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <LowStockBanner />
      
      <header>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Inventory Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm">Real-time overview of your warehouse operations.</p>
      </header>

      <DashboardKPIs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl h-80 flex items-center justify-center text-[var(--text-secondary)] italic shadow-sm">
            Stock Movement Trend Placeholder
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl h-80 flex items-center justify-center text-[var(--text-secondary)] italic shadow-sm">
            Warehouse Distribution Placeholder
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="h-[670px]">
            <AlertsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
