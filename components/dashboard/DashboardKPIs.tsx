'use client';

import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import { Package, FileInput, Truck, AlertCircle, Clock } from 'lucide-react';

interface KPIData {
  products: number;
  receipts: number;
  deliveries: number;
  lowStock: number;
}

const DashboardKPIs = () => {
  const [counts, setCounts] = useState<KPIData>({
    products: 0,
    receipts: 0,
    deliveries: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchCounts = async () => {
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
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard counts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and 30s polling
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // 1s update for "Last updated" counter
  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>
      
      <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
        <Clock className="w-3 h-3" />
        <span>Sync Status: <span className="text-[var(--text-primary)]">{secondsAgo === 0 ? 'Just now' : `${secondsAgo} seconds ago`}</span></span>
        <span className="mx-2 opacity-30">|</span>
        <span className="text-blue-500">Auto-refresh active (30s)</span>
      </div>
    </div>
  );
};

export default DashboardKPIs;
