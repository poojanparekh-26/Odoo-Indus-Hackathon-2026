'use client';

import React, { useState } from 'react';
import KanbanBoard from '@/components/operations/KanbanBoard';
import DeliveriesTable from '@/components/deliveries/DeliveriesTable';
import ViewToggle from '@/components/operations/ViewToggle';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyDeliveriesState } from '@/components/ui/EmptyState';

interface Delivery {
  id: string;
  reference: string;
  customerId: string;
  scheduledDate: string | Date;
  status: string;
  lines: any[];
}

interface DeliveriesViewProps {
  deliveries: Delivery[];
  paginatedDeliveries: {
    data: Delivery[];
    total: number;
    page: number;
    totalPages: number;
  };
}

const DeliveriesView: React.FC<DeliveriesViewProps> = ({ deliveries, paginatedDeliveries }) => {
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const kanbanItems = deliveries.map(d => ({
    id: d.id,
    reference: d.reference,
    partyName: d.customerId,
    date: d.scheduledDate,
    lineCount: d.lines?.length || 0,
    status: d.status
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Deliveries</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage outgoing shipments and customer fulfillment.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle storageKey="deliveries-view" onViewChange={setView} />
          <Link
            href="/deliveries/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Delivery</span>
          </Link>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <EmptyDeliveriesState />
      ) : view === 'list' ? (
        <DeliveriesTable 
          deliveries={paginatedDeliveries.data}
          page={paginatedDeliveries.page}
          totalPages={paginatedDeliveries.totalPages}
          total={paginatedDeliveries.total}
          perPage={20}
        />
      ) : (
        <KanbanBoard 
          columns={["Draft", "Waiting", "Ready", "Done", "Cancelled"]}
          items={kanbanItems}
          entityPath="deliveries"
        />
      )}
    </div>
  );
};

export default DeliveriesView;
