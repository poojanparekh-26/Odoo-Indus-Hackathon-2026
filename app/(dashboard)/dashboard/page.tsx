'use client';

import React, { useState, useEffect } from 'react';
import LowStockBanner from '@/components/dashboard/LowStockBanner';
import KPICard from '@/components/dashboard/KPICard';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import { Package, FileInput, Truck, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    products: 0,
    receipts: 0,
    deliveries: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [prodRes, recRes, delRes, lowRes] = await Promise.all([
          fetch('/api/products?perPage=1').then(r => r.json()),
          fetch('/api/receipts?perPage=1').then(r => r.json()),
          fetch('/api/deliveries?perPage=1').then(r => r.json()),
          fetch('/api/stock/low').then(r => r.json())
        ]);

        setCounts({
          products: prodRes.total || 0,
          receipts: recRes.total || 0,
          deliveries: delRes.total || 0,
          lowStock: lowRes.data?.length || 0
        });
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const kpis = [
    { 
      title: "Total Products", 
      value: loading ? "..." : counts.products, 
      description: "Unique SKUs in catalog",
      icon: <Package className="w-5 h-5" />
    },
    { 
      title: "Active Receipts", 
      value: loading ? "..." : counts.receipts, 
      description: "Incoming warehouse shipments",
      icon: <FileInput className="w-5 h-5" />
    },
    { 
      title: "Active Deliveries", 
      value: loading ? "..." : counts.deliveries, 
      description: "Scheduled for customer dispatch",
      icon: <Truck className="w-5 h-5" />
    },
    { 
      title: "Low Stock Items", 
      value: loading ? "..." : counts.lowStock, 
      description: "Products below threshold",
      icon: <AlertCircle className="w-5 h-5" />,
      color: counts.lowStock > 0 ? "text-red-500" : ""
    },
  ];

  return (
    <div className="space-y-8">
      <LowStockBanner />
      
      <header>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Inventory Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm">Real-time overview of your warehouse operations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

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
