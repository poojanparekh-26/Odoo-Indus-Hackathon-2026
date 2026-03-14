import React from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { Warehouse } from 'lucide-react';

export interface WarehousePerformance {
  warehouseId: string;
  warehouseName: string;
  receiptCompletionPct: number;
  deliveryCompletionPct: number;
  totalReceipts: number;
  totalDeliveries: number;
}

interface Props {
  items: WarehousePerformance[];
}

function Pill({
  pct,
  label,
  color,
}: {
  pct: number;
  label: string;
  color: 'green' | 'blue';
}) {
  const colorClass =
    color === 'green'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}
      style={{
        background: color === 'green' ? 'rgba(var(--green-500-rgb, 34,197,94), 0.12)' : 'rgba(var(--blue-500-rgb, 59,130,246), 0.12)',
        color: color === 'green' ? 'var(--green-500)' : 'var(--blue-500)',
      }}
    >
      {pct}% {label}
    </span>
  );
}

export default function WarehousePerformanceCard({ items }: Props) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Warehouse className="h-5 w-5 text-blue-500" />
        <div>
          <h2 className="font-bold text-[var(--text-primary)] text-base leading-tight">Warehouse Performance</h2>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Receipt & delivery completion</p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No warehouse data"
          description="No completed operations found."
          icon={<Warehouse className="h-8 w-8" />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(wh => (
            <div
              key={wh.warehouseId}
              className="flex flex-col gap-2 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
            >
              <p className="font-semibold text-sm text-[var(--text-primary)]">{wh.warehouseName}</p>
              <div className="flex flex-wrap gap-2">
                <Pill pct={wh.receiptCompletionPct} label="Receipts" color="green" />
                <Pill pct={wh.deliveryCompletionPct} label="Deliveries" color="blue" />
              </div>
              <p className="text-[10px] text-[var(--text-secondary)]">
                {wh.totalReceipts} receipts · {wh.totalDeliveries} deliveries
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
