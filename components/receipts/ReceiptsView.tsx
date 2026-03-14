'use client';

import React, { useState } from 'react';
import KanbanBoard from '@/components/operations/KanbanBoard';
import ReceiptsTable from '@/components/receipts/ReceiptsTable';
import ViewToggle from '@/components/operations/ViewToggle';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface Receipt {
  id: string;
  reference: string;
  supplierId: string;
  scheduledDate: string | Date;
  status: string;
  lines: any[];
}

interface ReceiptsViewProps {
  receipts: Receipt[];
  paginatedReceipts: {
    data: Receipt[];
    total: number;
    page: number;
    totalPages: number;
  };
}

const ReceiptsView: React.FC<ReceiptsViewProps> = ({ receipts, paginatedReceipts }) => {
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const kanbanItems = receipts.map(r => ({
    id: r.id,
    reference: r.reference,
    partyName: r.supplierId,
    date: r.scheduledDate,
    lineCount: r.lines?.length || 0,
    status: r.status
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Receipts</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage incoming shipments and stock fulfillment.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle storageKey="receipts-view" onViewChange={setView} />
          <Link
            href="/receipts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Receipt</span>
          </Link>
        </div>
      </div>

      {view === 'list' ? (
        <ReceiptsTable 
          receipts={paginatedReceipts.data}
          page={paginatedReceipts.page}
          totalPages={paginatedReceipts.totalPages}
          total={paginatedReceipts.total}
          perPage={20}
        />
      ) : (
        <KanbanBoard 
          columns={["Draft", "Ready", "Done", "Cancelled"]}
          items={kanbanItems}
          entityPath="receipts"
        />
      )}
    </div>
  );
};

export default ReceiptsView;
