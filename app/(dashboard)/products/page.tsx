'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ProductsTable from '@/components/products/ProductsTable';
import { EmptyProductsState } from '@/components/ui/EmptyState';
import RoleGuard from '@/components/ui/RoleGuard';
import { useRouter } from 'next/navigation';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();
  const page = parseInt((searchParams.page as string) || '1');
  const perPage = parseInt((searchParams.perPage as string) || '10');
  const categoryParam = (searchParams.category as string) || '';
  const skuParam = (searchParams.sku as string) || '';

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let isMountedLocal = true;
    setLoading(true);

    const query = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
      category: categoryParam,
      sku: skuParam,
    });

    fetch(`/api/products?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => {
        if (isMountedLocal) {
          setProducts(data.data || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        if (isMountedLocal) {
          setProducts([]);
          setTotal(0);
          setTotalPages(1);
          setLoading(false);
        }
      });

    return () => {
      isMountedLocal = false;
    };
  }, [page, perPage, categoryParam, skuParam, isMounted]);

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get('category') as string;
    const sku = formData.get('sku') as string;

    const query = new URLSearchParams();
    query.set('page', '1');
    query.set('perPage', perPage.toString());
    if (category) query.set('category', category);
    if (sku) query.set('sku', sku);

    router.push(`/products?${query.toString()}`);
  };

  // Prevent hydration error (server vs client mismatch)
  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Products</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage your inventory items and stock levels.</p>
        </div>
        <RoleGuard allowedRoles={['manager']}>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-semibold shadow-sm hover:bg-blue-600 transition-all text-sm w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>New Product</span>
          </Link>
        </RoleGuard>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label htmlFor="sku" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Search SKU / Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="sku"
                name="sku"
                defaultValue={skuParam}
                placeholder="SKU-001..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={categoryParam}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] appearance-none"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Components">Components</option>
              <option value="Peripherals">Peripherals</option>
              <option value="General">General</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--border)] transition-all text-sm h-10"
          >
            <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>Apply Filters</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : products.length === 0 ? (
        <EmptyProductsState />
      ) : (
        <ProductsTable
          products={products}
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
        />
      )}
    </div>
  );
}
