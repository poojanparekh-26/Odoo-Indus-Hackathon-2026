'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileInput, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAutoSave } from '@/hooks/useAutoSave';

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface LineItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

const DRAFT_KEY = 'new-receipt';

export default function NewReceiptPage() {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', quantity: 1, unitCost: 0 }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const draftData = { supplierId, scheduledDate, lines };
  const { savedAt, loadDraft, clearDraft } = useAutoSave(DRAFT_KEY, draftData);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.supplierId || draft.lines?.length > 1)) {
      setSupplierId(draft.supplierId || '');
      setScheduledDate(draft.scheduledDate || '');
      setLines(draft.lines || [{ productId: '', quantity: 1, unitCost: 0 }]);
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

  const addLine = () => setLines(prev => [...prev, { productId: '', quantity: 1, unitCost: 0 }]);

  const removeLine = (idx: number) =>
    setLines(prev => prev.filter((_, i) => i !== idx));

  const updateLine = (idx: number, field: keyof LineItem, value: string | number) =>
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId.trim()) { toast.error('Supplier name is required'); return; }
    if (!scheduledDate) { toast.error('Scheduled date is required'); return; }
    if (lines.some(l => !l.productId || l.quantity <= 0)) {
      toast.error('All lines must have a product and quantity > 0'); return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, scheduledDate, lines }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create receipt');
      }

      clearDraft();
      toast.success('Receipt created successfully');
      router.refresh();
      router.push('/receipts');
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
        <Link href="/receipts" className="hover:text-[var(--brand-primary)]">Receipts</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium">New Receipt</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileInput className="h-6 w-6 text-[var(--brand-primary)]" />
          Create Receipt
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Record an incoming shipment from a supplier.
          {savedAt && (
            <span className="ml-2 text-[10px] text-[var(--brand-primary)] italic">
              Draft saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
        {/* Supplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
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

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_100px_120px_32px] gap-2 text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold px-1">
            <span>Product</span>
            <span>Qty</span>
            <span>Unit Cost</span>
            <span />
          </div>

          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_100px_120px_32px] gap-2 items-center">
              <select
                value={line.productId}
                onChange={e => updateLine(idx, 'productId', e.target.value)}
                disabled={isLoadingProducts}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                required
              >
                <option value="">Select product…</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={e => updateLine(idx, 'quantity', parseInt(e.target.value) || 1)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                required
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={line.unitCost}
                onChange={e => updateLine(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <button
                type="button"
                onClick={() => removeLine(idx)}
                disabled={lines.length === 1}
                aria-label="Remove line"
                className="flex items-center justify-center text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex justify-end pt-2 border-t border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-secondary)]">
              Subtotal: <span className="font-bold text-[var(--text-primary)]">${subtotal.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--brand-primary)] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating Receipt...</span>
              </>
            ) : (
              <span>Create Receipt</span>
            )}
          </button>
          <Link
            href="/receipts"
            className="block text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
