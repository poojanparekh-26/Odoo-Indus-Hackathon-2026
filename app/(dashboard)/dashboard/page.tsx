import React from 'react';
import LowStockBanner from '@/components/dashboard/LowStockBanner';

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
    <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-3xl font-bold text-[var(--text-primary)]">{value}</span>
    </div>
    <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
  </div>
);

export default function DashboardPage() {
  const kpis = [
    { title: "Pending Orders", value: 12, description: "Waitlist for fulfillment" },
    { title: "Stock Value", value: "$45,210", description: "Current inventory valuation" },
    { title: "Received Today", value: 4, description: "Incoming warehouse shipments" },
    { title: "Deliveries Ready", value: 8, description: "Scheduled for customer dispatch" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
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
