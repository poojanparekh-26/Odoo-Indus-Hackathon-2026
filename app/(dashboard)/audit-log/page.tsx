import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  ScrollText, 
  Search, 
  Filter, 
  Calendar,
  User as UserIcon,
  Activity,
  Info,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import AuditPagination from '@/components/audit/AuditPagination';

async function getAuditLogs(searchParams: Record<string, string>) {
  const query = new URLSearchParams(searchParams);
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/audit-log?${query.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { data: [], total: 0, page: 1, totalPages: 1 };
  }
}

const ActionBadge = ({ action }: { action: string }) => {
  const variants: Record<string, { bg: string, text: string }> = {
    VALIDATE: { bg: 'bg-green-100', text: 'text-green-700' },
    CANCEL: { bg: 'bg-red-100', text: 'text-red-700' },
    DAMAGE_REPORT: { bg: 'bg-orange-100', text: 'text-orange-700' },
    ADJUST: { bg: 'bg-blue-100', text: 'text-blue-700' },
    CREATE: { bg: 'bg-gray-100', text: 'text-gray-700' },
    RECEIPT_DONE: { bg: 'bg-green-100', text: 'text-green-700' },
    DELIVERY_DONE: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  };

  const style = variants[action] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${style.bg} ${style.text}`}>
      {action.replace('_', ' ')}
    </span>
  );
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { data: logs, total, totalPages } = await getAuditLogs(searchParams);
  const page = parseInt(searchParams.page || '1');

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">System Audit Log</h1>
          <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1">
            Traceability and compliance records for all inventory operations.
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
              Search User / Entity ID
            </label>
            <div className="relative">
              <input
                type="text"
                name="userId"
                defaultValue={searchParams.userId}
                placeholder="Search by User ID..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
              Action Type
            </label>
            <select
              name="action"
              defaultValue={searchParams.action}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none appearance-none"
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="RECEIPT_DONE">RECEIPT_DONE</option>
              <option value="DELIVERY_DONE">DELIVERY_DONE</option>
              <option value="DAMAGE_REPORT">DAMAGE_REPORT</option>
              <option value="ADJUST">ADJUST</option>
              <option value="CANCEL">CANCEL</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={searchParams.startDate}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm h-10"
          >
            <Filter className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Action</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Entity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] font-black">
                          {log.user?.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{log.user?.name}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">{log.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase">{log.entityType}</span>
                        <span className="text-xs font-mono text-blue-600 truncate max-w-[120px]" title={log.entityId}>
                          {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[var(--text-secondary)] max-w-md truncate" title={log.metadata}>
                        {log.metadata}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)]">
            <AuditPagination 
              page={page} 
              totalPages={totalPages} 
              total={total} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
