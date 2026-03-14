import React from 'react';
import LowStockBanner from '@/components/dashboard/LowStockBanner';
import KPICard from '@/components/dashboard/KPICard';

export default function DashboardPage() {
  const kpis = [
    { 
      title: "Pending Orders", 
      value: 12, 
      description: "Waitlist for fulfillment",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      title: "Stock Value", 
      value: "$45,210", 
      description: "Current inventory valuation",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: "Received Today", 
      value: 4, 
      description: "Incoming warehouse shipments",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v4M16 4v4h4" />
        </svg>
      )
    },
    { 
      title: "Deliveries Ready", 
      value: 8, 
      description: "Scheduled for customer dispatch",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <LowStockBanner />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inventory Dashboard</h1>
          <p className="text-[var(--text-secondary)] text-sm">Real-time overview of your warehouse operations.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>

        {/* Placeholder for future charts/tables */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl h-64 flex items-center justify-center text-[var(--text-secondary)] italic">
            Stock Movement Trend Placeholder
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl h-64 flex items-center justify-center text-[var(--text-secondary)] italic">
            Warehouse Distribution Placeholder
          </div>
        </div>
      </main>
    </div>
  );
}
