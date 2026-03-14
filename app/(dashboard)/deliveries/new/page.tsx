'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAutoSave } from '@/hooks/useAutoSave';

interface Product {
  id: string;
  name: string;
  sku: string;
  onHandQty: number;
  reservedQty: number;
}

interface LineItem {
  productId: string;
  quantity: number;
}

const DRAFT_KEY = 'new-delivery';

export default function NewDeliveryPage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const draftData = { customerId, scheduledDate, lines };
  const { savedAt, loadDraft, clearDraft } = useAutoSave(DRAFT_KEY, draftData);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.customerId || draft.lines?.length > 1 || draft.lines?.[0]?.productId !== '')) {
      setCustomerId(draft.customerId || '');
      setScheduledDate(draft.scheduledDate || '');
      setLines(draft.lines || [{ productId: '', quantity: 1 }]);
      toast.success('Restored draft from last session');
    }
  }, []);

  useEffect(() => {
    fetch('/api/products?perPage=500')
      .then(r => r.json())
      .then(data => setProducts(data.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setIsLoadingProducts(false));
  }, []);

  const addLine = () => setLines(prev => [...prev, { productId: '', quantity: 1 }]);

  const removeLine = (idx: number) =>
    setLines(prev => prev.filter((_, i) => i !== idx));

  const updateLine = (idx: number, field: keyof LineItem, value: string | number) =>
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));

  // Calculate total items
  const totalItems = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) { toast.error('Customer name is required'); return; }
    if (!scheduledDate) { toast.error('Scheduled date is required'); return; }
    if (lines.some(l => !l.productId || l.quantity <= 0)) {
      toast.error('All lines must have a product and quantity > 0'); return;
    }

    // Checking max quantities vs available
    for (const line of lines) {
      if (!line.productId) continue;
      const product = products.find(p => p.id === line.productId);
      if (product) {
        const availableQty = product.onHandQty - product.reservedQty;
        if (line.quantity > availableQty) {
          toast.error(`Not enough stock for ${product.name}. Available: ${Math.max(0, availableQty)}`);
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, scheduledDate, lines }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create delivery');
      }

      clearDraft();
      toast.success('Delivery created successfully');
      router.push('/deliveries');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Link href="/deliveries" className="hover:text-[var(--brand-primary)]">Deliveries</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium">New Delivery</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Truck className="h-6 w-6 text-indigo-500" />
          Create Delivery
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Plan an outgoing shipment to a customer.
          {savedAt && (
            <span className="ml-2 text-[10px] text-[var(--brand-primary)] italic">
              Draft saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
        {/* Customer / Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              required
            />
          </div>
        </div>

        {/* Lines */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Product Lines</h3>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 text-sm text-[var(--brand-primary)] hover:underline"
            >
              <Plus className="h-4 w-4" /> Add Line
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {lines.map((line, idx) => {
              const selectedProduct = products.find(p => p.id === line.productId);
              const availableQty = selectedProduct ? Math.max(0, selectedProduct.onHandQty - selectedProduct.reservedQty) : null;
              
              return (
                <div key={idx} className="flex gap-2 items-start flex-col sm:flex-row p-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/30">
                  <div className="w-full sm:flex-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">Product</label>
                    <select
                      value={line.productId}
                      onChange={e => updateLine(idx, 'productId', e.target.value)}
                      disabled={isLoadingProducts}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                      required
                    >
                      <option value="">Select product…</option>
                      {products.map(p => {
                        const productAvailableQty = Math.max(0, p.onHandQty - p.reservedQty);
                        return (
                          <option key={p.id} value={p.id} disabled={productAvailableQty <= 0}>
                            {p.name} ({p.sku}) {productAvailableQty <= 0 ? '- Out of Stock' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {selectedProduct && availableQty !== null && (
                      <p className="text-[10px] mt-1 font-medium flex items-center gap-1 text-[var(--text-secondary)]">
                        <AlertCircle className="w-3 h-3 text-indigo-400" />
                        Available: <span className="font-bold text-indigo-600 dark:text-indigo-400">{availableQty} units</span>
                      </p>
                    )}
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={availableQty !== null ? availableQty : undefined}
                      value={line.quantity}
                      onChange={e => updateLine(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                      required
                    />
                  </div>
                  <div className="pt-5 flex items-center justify-center self-end sm:self-auto sm:ml-2">
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      disabled={lines.length === 1}
                      aria-label="Remove line"
                      className="flex items-center justify-center p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotal */}
          <div className="flex justify-end pt-2 border-t border-[var(--border-color)] mt-2">
            <span className="text-sm text-[var(--text-secondary)]">
              Total Items: <span className="font-bold text-[var(--text-primary)]">{totalItems}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating Delivery...</span>
              </>
            ) : (
              <span>Create Delivery</span>
            )}
          </button>
          <Link
            href="/deliveries"
            className="block text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
