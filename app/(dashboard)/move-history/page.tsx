'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { ArrowLeftRight, FileInput, Truck, AlertTriangle, Settings2, Search, Filter, ScrollText, Loader2 } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { format } from 'date-fns';
import HistoryPagination from '@/components/move-history/HistoryPagination';
import { EmptyMovementsState } from '@/components/ui/EmptyState';
import { useSearchParams } from 'next/navigation';

function MoveHistoryContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const type = searchParams.get('type') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const sku = searchParams.get('sku') || '';

  const [movements, setMovements] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const query = new URLSearchParams({
      page: page.toString(),
      type: type,
      startDate: startDate,
      endDate: endDate,
      sku: sku
    });

    fetch(`/api/move-history?${query.toString()}`)
      .then(r => r.ok ? r.json() : { data: [], total: 0, totalPages: 1 })
      .then(res => {
        if (isMounted) {
          setMovements(res.data || []);
          setPagination({ total: res.total || 0, totalPages: res.totalPages || 1 });
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [page, type, startDate, endDate, sku]);

  const getTypeIcon = (mType: string) => {
    switch (mType) {
      case 'IN': return <FileInput className="h-4 w-4 text-[var(--green-500)]" />;
      case 'OUT': return <Truck className="h-4 w-4 text-[var(--red-500)]" />;
      case 'TRANSFER': return <ArrowLeftRight className="h-4 w-4 text-[var(--blue-500)]" />;
      case 'DAMAGE': return <AlertTriangle className="h-4 w-4 text-[var(--orange-500)]" />;
      case 'ADJUST': return <Settings2 className="h-4 w-4 text-[var(--gray-400)]" />;
      default: return null;
    }
  };

  const getRowBorder = (mType: string) => {
    switch (mType) {
      case 'IN': return 'border-l-4 border-l-[var(--green-500)]';
      case 'OUT': return 'border-l-4 border-l-[var(--red-500)]';
      case 'TRANSFER': return 'border-l-4 border-l-[var(--blue-500)]';
      case 'DAMAGE': return 'border-l-4 border-l-[var(--orange-500)]';
      case 'ADJUST': return 'border-l-4 border-l-[var(--gray-400)]';
      default: return '';
    }
  };

  const exportUrl = `/api/move-history/export?${new URLSearchParams({
    type, startDate, endDate, sku
  }).toString()}`;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Stock Movements</h1>
          <p className="text-[var(--text-secondary)] text-sm">Full audit log of inventory transfers and adjustments.</p>
        </div>
        <a 
          href={exportUrl}
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--bg-primary)] hover:border-[var(--brand-primary)] transition-all shadow-sm text-sm"
        >
          <ScrollText className="h-4 w-4 text-[var(--brand-primary)]" />
          <span>Export CSV</span>
        </a>
      </header>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <form className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Product Search</label>
            <div className="relative">
              <input
                type="text"
                name="sku"
                defaultValue={sku}
                placeholder="Name or SKU..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </div>

          <div className="space-y-1.5 w-40">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Move Type</label>
            <select
              name="type"
              defaultValue={type}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] appearance-none"
            >
              <option value="">All Types</option>
              <option value="IN">Stock In (Receipts)</option>
              <option value="OUT">Stock Out (Deliveries)</option>
              <option value="TRANSFER">Internal Transfer</option>
              <option value="DAMAGE">Damage Report</option>
              <option value="ADJUST">Inventory Adjustment</option>
            </select>
          </div>

          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[var(--brand-primary)] text-white rounded-lg font-semibold hover:bg-blue-600 transition-all text-sm h-10"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : movements.length === 0 ? (
        <EmptyMovementsState />
      ) : (
        <>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    <th className="px-6 py-4">Date & Reference</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4 text-right">Quantity</th>
                    <th className="px-6 py-4">Done By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {movements.map((move: any) => (
                    <tr key={move.id} className={`${getRowBorder(move.type)} hover:bg-[var(--bg-secondary)] transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{move.reference}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          {format(new Date(move.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-primary)]">{move.product.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{move.product.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
                          {getTypeIcon(move.type)}
                          {move.type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                          <span className="truncate max-w-[100px]">{move.fromLocation?.name || 'External'}</span>
                          <ArrowLeftRight className="h-3 w-3 opacity-50" />
                          <span className="truncate max-w-[100px]">{move.toLocation?.name || 'External'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">
                        {move.type === 'OUT' || move.type === 'DAMAGE' ? '-' : '+'}{move.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--brand-primary)] font-bold">
                            {move.doneBy?.[0] || 'U'}
                          </div>
                          <span className="text-xs text-[var(--text-secondary)]">{move.doneBy || 'System'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <HistoryPagination page={page} totalPages={pagination.totalPages} total={pagination.total} />
          </div>
        </>
      )}
    </div>
  );
}

export default function MoveHistoryPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" /></div>}>
      <MoveHistoryContent />
    </Suspense>
  );
}
