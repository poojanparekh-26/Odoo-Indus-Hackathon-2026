import React from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { Clock } from 'lucide-react';

export interface SlowMovingItem {
  productId: string;
  productName: string;
  sku: string;
  daysSinceLastMovement: number;
}

interface Props {
  items: SlowMovingItem[];
}

export default function SlowMovingCard({ items }: Props) {
  const sorted = [...items].sort((a, b) => b.daysSinceLastMovement - a.daysSinceLastMovement);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-500" />
        <div>
          <h2 className="font-bold text-[var(--text-primary)] text-base leading-tight">Slow Moving Stock</h2>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">No recent movement</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No slow movers"
          description="All products have had recent movement."
          icon={<Clock className="h-8 w-8" />}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[var(--border)]">
                <th className="pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Product</th>
                <th className="pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">SKU</th>
                <th className="pb-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold text-right">Days Idle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sorted.map(item => (
                <tr key={item.productId} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="py-2.5 pr-3 text-[var(--text-primary)] font-medium truncate max-w-[140px]">
                    {item.productName}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--text-secondary)] font-mono text-xs">
                    {item.sku}
                  </td>
                  <td className={`py-2.5 text-right font-semibold ${item.daysSinceLastMovement > 60 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                    {item.daysSinceLastMovement > 60
                      ? <strong>{item.daysSinceLastMovement}d</strong>
                      : `${item.daysSinceLastMovement}d`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
