'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import StockoutRiskCard, { StockoutItem } from '@/components/ai/StockoutRiskCard';
import SlowMovingCard, { SlowMovingItem } from '@/components/ai/SlowMovingCard';
import WasteCard, { WasteItem } from '@/components/ai/WasteCard';
import WarehousePerformanceCard, { WarehousePerformance } from '@/components/ai/WarehousePerformanceCard';

interface InsightsResponse {
  stockout_risk?: StockoutItem[];
  slow_moving?: SlowMovingItem[];
  waste?: WasteItem[];
  warehouse_performance?: WarehousePerformance[];
  fallback?: boolean;
  error?: string;
}

function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 h-64 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-full bg-[var(--bg-secondary)]" />
        <div className="h-4 w-36 rounded-md bg-[var(--bg-secondary)]" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-3 w-full rounded-md bg-[var(--bg-secondary)]" />
            <div className="h-2 w-3/4 rounded-md bg-[var(--bg-secondary)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIInsightsPage() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/ai/insights');
      const json: InsightsResponse = await res.json();
      setData(json);
      setLastFetched(new Date());
    } catch {
      setData({ fallback: true, error: 'Network error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(() => fetchInsights(), 60000);
    return () => clearInterval(interval);
  }, [fetchInsights]);

  const isFallback = data?.fallback === true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="h-6 w-6 text-[var(--brand-primary)]" />
            AI Insights
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            Machine learning analysis of your inventory data.
            {lastFetched && (
              <span className="ml-2 text-[10px] text-[var(--brand-primary)] font-mono uppercase tracking-wider">
                Updated {lastFetched.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Fallback / error */}
      {!loading && isFallback && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Brain className="h-14 w-14 text-[var(--text-secondary)] opacity-20" />
          <p className="text-lg font-bold text-[var(--text-primary)]">AI service unavailable</p>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            Check that the Python FastAPI service is running on{' '}
            <code className="font-mono text-xs bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000'}
            </code>
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* 2×2 cards */}
      {!loading && !isFallback && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StockoutRiskCard items={data.stockout_risk || []} />
          <SlowMovingCard items={data.slow_moving || []} />
          <WasteCard items={data.waste || []} />
          <WarehousePerformanceCard items={data.warehouse_performance || []} />
        </div>
      )}
    </div>
  );
}
