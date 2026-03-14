'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, AlertTriangle, Calendar, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyDamageReportsState } from '@/components/ui/EmptyState';
import { SearchParamsPagination } from '@/components/damage/SearchParamsPagination';
import { format } from 'date-fns';

export default function DamageReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = parseInt((searchParams.page as string) || '1');
  const status = (searchParams.status as string) || '';
  
  const [reports, setReports] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const query = new URLSearchParams({
      page: page.toString(),
      status: status,
      perPage: '20'
    });

    fetch(`/api/damage-reports?${query.toString()}`)
      .then(r => r.ok ? r.json() : { data: [], total: 0, totalPages: 1 })
      .then(res => {
        if (isMounted) {
          setReports(res.data || []);
          setPagination({ total: res.total || 0, totalPages: res.totalPages || 1 });
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [page, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Damage Reports</h1>
          <p className="text-[var(--text-secondary)] text-sm">Track and manage inventory loss and damaged items.</p>
        </div>
        <Link
          href="/damage-reports/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold shadow-sm hover:bg-red-600 transition-all text-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Report Damage</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <form className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--border)] transition-all text-sm h-10"
          >
            <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>Apply</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyDamageReportsState />
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Reported By</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                        {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{report.product.name}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">{report.product.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-red-500">{report.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border)] w-fit">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        {report.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                        <User className="h-3 w-3 text-[var(--text-secondary)]" />
                        {report.user?.name || report.reportedBy}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status as any} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/damage-reports/${report.id}`}
                        className="text-xs font-bold text-[var(--brand-primary)] hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-[var(--border)] flex justify-end">
             <SearchParamsPagination page={page} totalPages={pagination.totalPages} total={pagination.total} perPage={20} />
          </div>
        </div>
      )}
    </div>
  );
}
