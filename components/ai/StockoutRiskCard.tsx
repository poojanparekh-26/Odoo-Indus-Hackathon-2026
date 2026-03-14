import React from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

export interface StockoutItem {
  productId: string;
  productName: string;
  sku: string;
  onHandQty: number;
  avgDailyUsage: number;
  daysRemaining: number;
}

interface Props {
  items: StockoutItem[];
}

function getBarColor(days: number): string {
  if (days < 7) return 'bg-red-500';
  if (days <= 14) return 'bg-amber-400';
  return 'bg-green-500';
}

function getLabel(days: number): string {
  if (days > 30) return 'In stock';
  return `${days} day${days === 1 ? '' : 's'} remaining`;
}

export default function StockoutRiskCard({ items }: Props) {
  const sorted = [...items].sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-red-500" />
        <div>
          <h2 className="font-bold text-[var(--text-primary)] text-base leading-tight">Stockout Risk</h2>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Based on 30-day usage</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No stockout risks"
          description="All products have sufficient stock."
          icon={<BarChart3 className="h-8 w-8" />}
        />
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-72">
          {sorted.map(item => {
            const pct = Math.min((item.daysRemaining / 30) * 100, 100);
            return (
              <div key={item.productId} className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[60%]">
                    {item.productName}
                  </span>
                  <span className={`text-[11px] font-semibold ${item.daysRemaining < 7 ? 'text-red-500' : item.daysRemaining <= 14 ? 'text-amber-500' : 'text-green-500'}`}>
                    {getLabel(item.daysRemaining)}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.daysRemaining)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--text-secondary)]">{item.sku} · {item.onHandQty} units on hand</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
