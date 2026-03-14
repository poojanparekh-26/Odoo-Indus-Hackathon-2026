'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import Pagination from '../ui/Pagination';
import StatusBadge from '../ui/StatusBadge';
import { format } from 'date-fns';

interface ReceiptLine {
  id: string;
  quantity: number;
}

interface Receipt {
  id: string;
  reference: string;
  supplierId: string;
  status: string;
  scheduledDate: string | Date;
  lines: ReceiptLine[];
}

interface ReceiptsTableProps {
  receipts: Receipt[];
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

const ReceiptsTable: React.FC<ReceiptsTableProps> = ({
  receipts,
  page,
  totalPages,
  total,
  perPage,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/receipts?${params.toString()}`);
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Scheduled Date</th>
              <th className="px-6 py-4">Lines</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                  No receipts found.
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                  <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                    {receipt.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                    {receipt.supplierId}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {format(new Date(receipt.scheduledDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      {receipt.lines?.length || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={receipt.status as any} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/receipts/${receipt.id}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)] hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-[var(--border)]">
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ReceiptsTable;
