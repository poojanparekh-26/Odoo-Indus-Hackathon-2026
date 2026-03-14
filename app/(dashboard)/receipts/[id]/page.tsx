'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Package, 
  Printer, 
  User, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal, { useConfirmModal } from '@/components/ui/ConfirmModal';
import { format } from 'date-fns';

interface ReceiptLine {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
  unitCost: number;
}

interface Receipt {
  id: string;
  reference: string;
  supplierId: string;
  status: string;
  scheduledDate: string;
  createdBy: string;
  createdAt: string;
  lines: ReceiptLine[];
}

const ReceiptDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal controls
  const validateModal = useConfirmModal();
  const cancelModal = useConfirmModal();

  const fetchReceipt = async () => {
    try {
      const res = await fetch(`/api/receipts/${id}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch receipt');
      setReceipt(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    const modal = newStatus === 'Cancelled' ? cancelModal : validateModal;
    modal.startLoading();
    
    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to update status');
      
      toast.success(newStatus === 'Cancelled' ? 'Receipt cancelled' : 'Status updated');
      setReceipt(result.data);
      modal.close();
    } catch (err: any) {
      toast.error(err.message);
      modal.stopLoading();
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-primary)]" />
        <p className="font-medium">Loading receipt details...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10" />
        </div>
        <p className="text-xl font-bold text-[var(--text-primary)]">{error || 'Receipt not found'}</p>
        <Link href="/receipts" className="text-[var(--brand-primary)] font-semibold hover:underline">
          Back to Receipts
        </Link>
      </div>
    );
  }

  const totalCost = receipt.lines.reduce((acc, line) => acc + (line.quantity * line.unitCost), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          href="/receipts" 
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/receipts/${id}/print`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print / Export
          </Link>
          
          {receipt.status === 'Draft' && (
            <>
              <button 
                onClick={validateModal.open}
                className="px-6 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                Validate
              </button>
              <button 
                onClick={cancelModal.open}
                className="px-4 py-2 text-red-500 font-bold text-sm hover:underline"
              >
                Cancel
              </button>
            </>
          )}

          {receipt.status === 'Ready' && (
            <>
              <button 
                onClick={validateModal.open}
                className="px-6 py-2 bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-green-500/20 transition-all"
              >
                Validate (Receive Stock)
              </button>
              <button 
                onClick={cancelModal.open}
                className="px-4 py-2 text-red-500 font-bold text-sm hover:underline"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]/30">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">{receipt.reference}</h1>
                  <p className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Inbound Shipment
                  </p>
                </div>
                <StatusBadge status={receipt.status as any} />
              </div>
            </div>
            
            <div className="p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold border-b border-[var(--border)]">
                    <th className="pb-4">Product</th>
                    <th className="pb-4">SKU</th>
                    <th className="pb-4 text-right">Qty</th>
                    <th className="pb-4 text-right">Unit Cost</th>
                    <th className="pb-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {receipt.lines.map((line) => (
                    <tr key={line.id} className="text-sm">
                      <td className="py-4 font-semibold text-[var(--text-primary)]">{line.product.name}</td>
                      <td className="py-4 text-[var(--text-secondary)] font-mono">{line.product.sku}</td>
                      <td className="py-4 text-right font-bold">{line.quantity}</td>
                      <td className="py-4 text-right">₹{line.unitCost.toLocaleString()}</td>
                      <td className="py-4 text-right font-bold text-[var(--text-primary)]">
                        ₹{(line.quantity * line.unitCost).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="pt-6">
                      <div className="flex justify-end border-t-2 border-[var(--border)] pt-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total Valuation</p>
                          <p className="text-3xl font-black text-[var(--brand-primary)]">₹{totalCost.toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-widest text-xs">Receipt Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--brand-primary)]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Supplier ID</p>
                  <p className="text-sm font-semibold">{receipt.supplierId}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--brand-primary)]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Scheduled Date</p>
                  <p className="text-sm font-semibold">{format(new Date(receipt.scheduledDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--brand-primary)]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Processed By</p>
                  <p className="text-sm font-semibold text-[var(--text-secondary)] capitalize">{receipt.createdBy || 'System'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {receipt.status === 'Done' && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3 text-green-700">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold mb-1">Inventory Updated</p>
                <p>Stock has been successfully added to warehouse locations and movements recorded.</p>
              </div>
            </div>
          )}

          {receipt.status === 'Cancelled' && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-700">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold mb-1">Receipt Cancelled</p>
                <p>This transaction was cancelled and no stock was received.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={validateModal.isOpen}
        isLoading={validateModal.isLoading}
        title={receipt.status === 'Draft' ? 'Validate Draft' : 'Receive Inventory'}
        message={
          receipt.status === 'Draft' 
            ? 'Confirming this receipt will mark it as Ready for stock intake.' 
            : 'Are you sure you want to validate this receipt? This will immediately add products to your inventory levels.'
        }
        confirmLabel={receipt.status === 'Draft' ? 'Continue' : 'Validate & Receive'}
        onConfirm={() => handleUpdateStatus(receipt.status === 'Draft' ? 'Ready' : 'Done')}
        onCancel={validateModal.close}
      />

      <ConfirmModal
        isOpen={cancelModal.isOpen}
        isLoading={cancelModal.isLoading}
        title="Cancel Receipt"
        message="Are you sure you want to cancel this receipt? This action cannot be undone."
        confirmLabel="Cancel Receipt"
        onConfirm={() => handleUpdateStatus('Cancelled')}
        onCancel={cancelModal.close}
        danger
      />
    </div>
  );
};

export default ReceiptDetailPage;
