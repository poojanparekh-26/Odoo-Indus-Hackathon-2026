'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import Pagination from '../ui/Pagination';
import StatusBadge from '../ui/StatusBadge';
import { format } from 'date-fns';

interface DeliveryLine {
  id: string;
  quantity: number;
}

interface Delivery {
  id: string;
  reference: string;
  customerId: string;
  status: string;
  scheduledDate: string | Date;
  lines: DeliveryLine[];
}

interface DeliveriesTableProps {
  deliveries: Delivery[];
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

const DeliveriesTable: React.FC<DeliveriesTableProps> = ({
  deliveries,
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
    router.push(`/deliveries?${params.toString()}`);
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Scheduled Date</th>
              <th className="px-6 py-4">Lines</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                  No deliveries found.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                  <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                    {delivery.reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                    {delivery.customerId}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {format(new Date(delivery.scheduledDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      {delivery.lines?.length || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={delivery.status as any} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/deliveries/${delivery.id}`}
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

export default DeliveriesTable;
