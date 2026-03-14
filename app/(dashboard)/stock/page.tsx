'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import InlineStockEdit from '@/components/stock/InlineStockEdit';
import { Search, Filter, ArrowUpDown, Package, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RoleGuard from '@/components/ui/RoleGuard';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitCost: number;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  reorderThreshold: number;
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?perPage=100');
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockUpdated = (productId: string, newValue: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const diff = newValue - p.onHandQty;
        return {
          ...p,
          onHandQty: newValue,
          availableQty: p.availableQty + diff
        };
      }
      return p;
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const getStockStatus = (p: Product) => {
    if (p.onHandQty <= 0) return 'Critical';
    if (p.onHandQty <= p.reorderThreshold) return 'At Risk';
    return 'OK';
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Stock Management</h1>
          <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1">
            Monitor and adjust inventory levels in real-time.
            <Info className="w-3 h-3 cursor-help" />
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input 
            type="text"
            placeholder="Search products, SKUs, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">SKU</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] text-right">Unit Cost</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">On Hand</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] text-center">Reserved</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] text-center">Available</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] text-center">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="px-6 py-8"><div className="h-4 bg-[var(--bg-secondary)] rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--brand-primary)]">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border)]">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-right">
                      ₹{product.unitCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <RoleGuard allowedRoles={['manager']}>
                        <InlineStockEdit 
                          productId={product.id} 
                          currentValue={product.onHandQty} 
                          onUpdated={(val) => handleStockUpdated(product.id, val)}
                        />
                      </RoleGuard>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {product.reservedQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${product.availableQty <= product.reorderThreshold ? 'text-red-500' : 'text-green-600'}`}>
                        {product.availableQty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={getStockStatus(product)} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        {product.reorderThreshold}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
