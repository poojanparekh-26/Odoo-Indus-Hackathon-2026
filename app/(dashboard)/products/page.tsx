import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import ProductsTable from '@/components/products/ProductsTable';

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = searchParams.page || '1';
  const perPage = searchParams.perPage || '10';
  const category = searchParams.category || '';
  const sku = searchParams.sku || '';

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const query = new URLSearchParams({
    page: page as string,
    perPage: perPage as string,
    category: category as string,
    sku: sku as string,
  });

  try {
    const res = await fetch(`${baseUrl}/api/products?${query.toString()}`, {
      cache: 'no-store',
      // Pass the cookies if needed, but since it's internal we might need to handle auth
      // Usually in server components we'd fetch directly from the DB or a service
      // But follow instructions to use the API URL
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], total: 0, page: 1, totalPages: 1 };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data: products, total, totalPages } = await getProducts(searchParams);
  const page = parseInt((searchParams.page as string) || '1');
  const perPage = parseInt((searchParams.perPage as string) || '10');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Products</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage your inventory items and stock levels.</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-semibold shadow-sm hover:bg-blue-600 transition-all text-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label htmlFor="sku" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Search SKU / Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="sku"
                name="sku"
                defaultValue={searchParams.sku as string}
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
              defaultValue={searchParams.category as string}
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

      <ProductsTable
        products={products}
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
      />
    </div>
  );
}
