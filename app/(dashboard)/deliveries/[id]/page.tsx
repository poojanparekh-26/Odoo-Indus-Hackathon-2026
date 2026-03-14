'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Truck, 
  Printer, 
  User, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal, { useConfirmModal } from '@/components/ui/ConfirmModal';
import RoleGuard from '@/components/ui/RoleGuard';
import { format } from 'date-fns';

interface DeliveryLine {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
    onHandQty: number;
    reservedQty: number;
  };
  quantity: number;
}

interface Delivery {
  id: string;
  reference: string;
  customerId: string;
  status: string;
  scheduledDate: string;
  createdBy: string;
  createdAt: string;
  lines: DeliveryLine[];
}

const DeliveryDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal controls
  const actionModal = useConfirmModal();
  const cancelModal = useConfirmModal();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const fetchDelivery = async () => {
    try {
      const res = await fetch(`/api/deliveries/${id}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch delivery');
      setDelivery(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    const modal = newStatus === 'Cancelled' ? cancelModal : actionModal;
    modal.startLoading();
    
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to update status');
      
      toast.success('Status updated successfully');
      setDelivery(result.data);
      modal.close();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
      modal.stopLoading();
    }
  };

  const openActionModal = (status: string) => {
    setPendingStatus(status);
    actionModal.open();
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-primary)]" />
        <p className="font-medium">Loading delivery details...</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10" />
        </div>
        <p className="text-xl font-bold text-[var(--text-primary)]">{error || 'Delivery not found'}</p>
        <Link href="/deliveries" className="text-[var(--brand-primary)] font-semibold hover:underline">
          Back to Deliveries
        </Link>
      </div>
    );
  }

  // Calculate if we have enough stock to reserve (for all items)
  const canReserveAll = delivery.lines.every(line => {
    const available = line.product.onHandQty - line.product.reservedQty;
    return available >= line.quantity;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          href="/deliveries" 
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print / Export
          </button>
          
          {delivery.status === 'Draft' && (
            <>
              <RoleGuard allowedRoles={['manager']}>
                <button 
                  onClick={() => openActionModal('Waiting')}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  Confirm
                </button>
              </RoleGuard>
              <RoleGuard allowedRoles={['manager']}>
                <button onClick={cancelModal.open} className="px-4 py-2 text-red-500 font-bold text-sm hover:underline">Cancel</button>
              </RoleGuard>
            </>
          )}

          {delivery.status === 'Waiting' && (
            <>
              <RoleGuard allowedRoles={['manager']}>
                <button 
                  onClick={() => openActionModal('Ready')}
                  disabled={!canReserveAll}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  Mark Ready (Reserve)
                </button>
              </RoleGuard>
              <RoleGuard allowedRoles={['manager']}>
                <button onClick={cancelModal.open} className="px-4 py-2 text-red-500 font-bold text-sm hover:underline">Cancel</button>
              </RoleGuard>
            </>
          )}

          {delivery.status === 'Ready' && (
            <>
              <RoleGuard allowedRoles={['manager']}>
                <button 
                  onClick={() => openActionModal('Done')}
                  className="px-6 py-2 bg-green-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-green-500/20 transition-all"
                >
                  Validate (Ship)
                </button>
              </RoleGuard>
              <RoleGuard allowedRoles={['manager']}>
                <button onClick={cancelModal.open} className="px-4 py-2 text-red-500 font-bold text-sm hover:underline">Cancel</button>
              </RoleGuard>
            </>
          )}
        </div>
      </div>

      {!canReserveAll && delivery.status === 'Waiting' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">Some items have insufficient stock for fulfillment. Restock required before marking as ready.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]/30">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">{delivery.reference}</h1>
                  <p className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Outbound Shipment
                  </p>
                </div>
                <StatusBadge status={delivery.status as any} />
              </div>
            </div>
            
            <div className="p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold border-b border-[var(--border)]">
                    <th className="pb-4">Product</th>
                    <th className="pb-4">SKU</th>
                    <th className="pb-4 text-right">Quantity</th>
                    <th className="pb-4 text-right">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {delivery.lines.map((line) => {
                    const available = line.product.onHandQty - line.product.reservedQty;
                    const isReserved = delivery.status === 'Ready' || delivery.status === 'Done';
                    
                    return (
                      <tr key={line.id} className="text-sm">
                        <td className="py-4">
                          <div className="font-semibold text-[var(--text-primary)]">{line.product.name}</div>
                          {isReserved && (
                            <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase mt-1">
                              <ShieldCheck className="h-3 w-3" />
                              <span>{line.quantity} units reserved from warehouse stock</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-[var(--text-secondary)] font-mono">{line.product.sku}</td>
                        <td className="py-4 text-right font-bold text-lg">{line.quantity}</td>
                        <td className="py-4 text-right">
                          {!isReserved ? (
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${available >= line.quantity ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {available} available
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-600">
                              Fulfilled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-widest text-xs">Delivery Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--brand-primary)]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Customer / Destination</p>
                  <p className="text-sm font-semibold">{delivery.customerId}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--brand-primary)]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Scheduled Delivery</p>
                  <p className="text-sm font-semibold">{format(new Date(delivery.scheduledDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--brand-primary)]">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Created At</p>
                  <p className="text-sm font-semibold">{format(new Date(delivery.createdAt), 'PP')}</p>
                </div>
              </div>
            </div>
          </div>
          
          {delivery.status === 'Ready' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-indigo-700">
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold mb-1">Stock Reserved</p>
                <p>Items for this delivery have been reserved in the inventory and cannot be sold to others.</p>
              </div>
            </div>
          )}

          {delivery.status === 'Done' && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3 text-green-700">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold mb-1">Stock Deducted</p>
                <p>Delivery finalized. Items have been removed from physical stock levels.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={actionModal.isOpen}
        isLoading={actionModal.isLoading}
        title={
          pendingStatus === 'Waiting' ? 'Confirm Delivery Request' :
          pendingStatus === 'Ready' ? 'Reserve Stock for Delivery' :
          'Validate Shipment'
        }
        message={
          pendingStatus === 'Waiting' ? 'Are you sure you want to confirm this delivery request? This will mark it for fulfillment.' :
          pendingStatus === 'Ready' ? 'This will reserve the required quantity from your warehouse stock. You can still cancel to release the reservation.' :
          'Are you sure you want to mark this delivery as Done? This will immediately consume the stock and record the delivery.'
        }
        confirmLabel={
          pendingStatus === 'Waiting' ? 'Confirm Request' :
          pendingStatus === 'Ready' ? 'Reserve Now' :
          'Ship Items'
        }
        onConfirm={() => pendingStatus && handleUpdateStatus(pendingStatus)}
        onCancel={actionModal.close}
      />

      <ConfirmModal
        isOpen={cancelModal.isOpen}
        isLoading={cancelModal.isLoading}
        title="Cancel Delivery"
        message="Are you sure you want to cancel this delivery shipment? Any stock reservations will be released."
        confirmLabel="Cancel Delivery"
        onConfirm={() => handleUpdateStatus('Cancelled')}
        onCancel={cancelModal.close}
        danger
      />
    </div>
  );
};

export default DeliveryDetailPage;
