'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Edit2, Check, X, AlertTriangle, ArrowRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  reorderThreshold: number;
}

const ReorderRulesPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?perPage=100');
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatus = (p: Product) => {
    const available = p.onHandQty - p.reservedQty;
    if (available === 0) return 'Critical';
    if (available <= p.reorderThreshold) return 'At Risk';
    return 'OK';
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const statusOrder = { 'Critical': 0, 'At Risk': 1, 'OK': 2 };
      const statusA = getStatus(a);
      const statusB = getStatus(b);
      
      if (statusOrder[statusA as keyof typeof statusOrder] !== statusOrder[statusB as keyof typeof statusOrder]) {
        return statusOrder[statusA as keyof typeof statusOrder] - statusOrder[statusB as keyof typeof statusOrder];
      }
      return a.name.localeCompare(b.name);
    });
  }, [products]);

  const filteredProducts = sortedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateThreshold = async (id: string) => {
    const val = parseInt(editValue);
    if (isNaN(val) || val < 0) return toast.error('Invalid threshold');

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/products/${id}/reorder-threshold`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: val }),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Update failed');

      setProducts(prev => prev.map(p => p.id === id ? { ...p, reorderThreshold: val } : p));
      setEditingId(null);
      toast.success('Threshold updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reorder Rules</h1>
          <p className="text-[var(--text-secondary)] text-sm">Set thresholds to trigger low stock alerts automatically.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <div className="relative max-w-md">
          <input
            type="text"
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
            <p className="text-sm font-medium">Crunching stock data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Reorder Threshold</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStatus(product);
                    const available = product.onHandQty - product.reservedQty;
                    
                    return (
                      <tr key={product.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-[var(--text-primary)]">{product.name}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">{product.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] bg-[var(--bg-secondary)] border border-[var(--border)] px-2 py-0.5 rounded-full font-bold text-[var(--text-secondary)]">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <span className={`text-sm font-black ${status === 'OK' ? 'text-[var(--text-primary)]' : 'text-red-500'}`}>
                                {available}
                             </span>
                             <span className="text-[10px] text-[var(--text-secondary)]">Units</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingId === product.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                type="number"
                                className="w-20 bg-[var(--bg-primary)] border border-[var(--brand-primary)] rounded px-2 py-1 text-sm font-bold focus:outline-none"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateThreshold(product.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                              <button 
                                onClick={() => handleUpdateThreshold(product.id)}
                                disabled={isUpdating}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-2 group/edit cursor-pointer"
                              onClick={() => {
                                setEditingId(product.id);
                                setEditValue(product.reorderThreshold.toString());
                              }}
                            >
                              <span className="text-sm font-bold">{product.reorderThreshold}</span>
                              <Edit2 className="h-3 w-3 text-[var(--text-secondary)] opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={status as any} />
                            {status === 'Critical' && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Restock Now</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReorderRulesPage;
