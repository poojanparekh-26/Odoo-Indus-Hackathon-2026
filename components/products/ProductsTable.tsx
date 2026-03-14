'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Edit2, Eye } from 'lucide-react';
import Link from 'next/link';
import Pagination from '../ui/Pagination';
import StatusBadge from '../ui/StatusBadge';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitCost: number;
  onHandQty: number;
  reservedQty: number;
  reorderThreshold: number;
  availableQty: number;
}

interface ProductsTableProps {
  products: Product[];
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
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
    router.push(`/products?${params.toString()}`);
  };

  const getStockHealth = (p: Product) => {
    if (p.availableQty <= p.reorderThreshold) return 'Critical';
    if (p.availableQty <= p.reorderThreshold * 1.5) return 'Waiting'; // Using 'Waiting' as 'At Risk' proxy for StatusBadge
    return 'Ready'; // Using 'Ready' as 'OK' proxy
  };

  const getStockHealthLabel = (p: Product) => {
    if (p.availableQty <= p.reorderThreshold) return 'Critical';
    if (p.availableQty <= p.reorderThreshold * 1.5) return 'At Risk';
    return 'OK';
  };

  const getQtyColorClass = (p: Product) => {
    if (p.availableQty <= p.reorderThreshold) return 'text-red-600 font-bold';
    if (p.availableQty <= p.reorderThreshold * 1.5) return 'text-amber-600 font-semibold';
    return 'text-[var(--text-primary)]';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name / SKU</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Unit Cost</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                  No products found matching your criteria.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{product.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                    {formatCurrency(product.unitCost)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className={`text-sm ${getQtyColorClass(product)}`}>
                        {product.availableQty} <span className="text-xs font-normal text-[var(--text-secondary)]">available</span>
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] flex gap-2">
                        <span>{product.onHandQty} On Hand</span>
                        <span>•</span>
                        <span>{product.reservedQty} Rsrvd</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={getStockHealth(product) as any} />
                    <span className="ml-2 text-[10px] text-[var(--text-secondary)] uppercase font-medium">
                      {getStockHealthLabel(product)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-2 rounded-lg hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="p-2 rounded-lg hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-all"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductsTable;
