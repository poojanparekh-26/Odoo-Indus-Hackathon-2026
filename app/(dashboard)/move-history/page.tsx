import React from 'react';
import { ArrowLeftRight, FileInput, Truck, AlertTriangle, Settings2, Search, Filter } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { format } from 'date-fns';
import HistoryPagination from '@/components/move-history/HistoryPagination';

async function getMoveHistory(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = searchParams.page || '1';
  const type = searchParams.type || '';
  const startDate = searchParams.startDate || '';
  const endDate = searchParams.endDate || '';
  const sku = searchParams.sku || '';

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const query = new URLSearchParams({
    page: page as string,
    type: type as string,
    startDate: startDate as string,
    endDate: endDate as string,
    sku: sku as string,
  });

  try {
    const res = await fetch(`${baseUrl}/api/move-history?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch history');
    return await res.json();
  } catch (error) {
    console.error(error);
    return { data: [], total: 0, page: 1, totalPages: 1 };
  }
}

export default async function MoveHistoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data: movements, total, totalPages } = await getMoveHistory(searchParams);
  const page = parseInt((searchParams.page as string) || '1');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN': return <FileInput className="h-4 w-4 text-[var(--green-500)]" />;
      case 'OUT': return <Truck className="h-4 w-4 text-[var(--red-500)]" />;
      case 'TRANSFER': return <ArrowLeftRight className="h-4 w-4 text-[var(--blue-500)]" />;
      case 'DAMAGE': return <AlertTriangle className="h-4 w-4 text-[var(--orange-500)]" />;
      case 'ADJUST': return <Settings2 className="h-4 w-4 text-[var(--gray-400)]" />;
      default: return null;
    }
  };

  const getRowBorder = (type: string) => {
    switch (type) {
      case 'IN': return 'border-l-4 border-l-[var(--green-500)]';
      case 'OUT': return 'border-l-4 border-l-[var(--red-500)]';
      case 'TRANSFER': return 'border-l-4 border-l-[var(--blue-500)]';
      case 'DAMAGE': return 'border-l-4 border-l-[var(--orange-500)]';
      case 'ADJUST': return 'border-l-4 border-l-[var(--gray-400)]';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Stock Movements</h1>
        <p className="text-[var(--text-secondary)] text-sm">Full audit log of inventory transfers and adjustments.</p>
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
                defaultValue={searchParams.sku as string}
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
              defaultValue={searchParams.type as string}
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
            startDate={(searchParams.startDate as string) || ''} 
            endDate={(searchParams.endDate as string) || ''} 
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
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                    No movements recorded for this period.
                  </td>
                </tr>
              ) : (
                movements.map((move: any) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <HistoryPagination page={page} totalPages={totalPages} total={total} />
      </div>
    </div>
  );
}
