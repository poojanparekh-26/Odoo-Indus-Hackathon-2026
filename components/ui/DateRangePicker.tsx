'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset page to 1 on filter change
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    updateParams({ startDate: '', endDate: '' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-end gap-3">
      <div className="space-y-1.5 flex-1 min-w-[140px]">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">From</label>
        <input
          type="date"
          value={startDate}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          onChange={(e) => updateParams({ startDate: e.target.value })}
        />
      </div>
      <div className="space-y-1.5 flex-1 min-w-[140px]">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">To</label>
        <input
          type="date"
          value={endDate}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          onChange={(e) => updateParams({ endDate: e.target.value })}
        />
      </div>
      {(startDate || endDate) && (
        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-red-500 transition-colors h-10"
          title="Clear Dates"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DateRangePicker;
