'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  DollarSign, 
  TrendingDown, 
  Warehouse, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Warehouse {
  id: string;
  name: string;
}

const CreateProductPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSku, setIsCheckingSku] = useState(false);
  const [skuError, setSkuError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    unitCost: '',
    reorderThreshold: '10',
    warehouseId: ''
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => {
        setWarehouses(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, warehouseId: data[0].id }));
        }
      })
      .catch(err => console.error('Failed to load warehouses', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'sku') setSkuError(null);
  };

  const checkSkuUniqueness = async () => {
    if (!formData.sku) return;
    
    setIsCheckingSku(true);
    try {
      const res = await fetch(`/api/products?sku=${encodeURIComponent(formData.sku)}`);
      const data = await res.json();
      
      // If any product found with exact SKU
      const exists = data.data.some((p: any) => p.sku === formData.sku);
      if (exists) {
        setSkuError('SKU already in use');
      } else {
        setSkuError(null);
      }
    } catch (err) {
      console.error('SKU check failed', err);
    } finally {
      setIsCheckingSku(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skuError) return toast.error('Please fix SKU error');
    if (!formData.name || !formData.sku || !formData.unitCost) {
      return toast.error('Please fill required fields');
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unitCost: parseFloat(formData.unitCost),
          reorderThreshold: parseInt(formData.reorderThreshold)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      toast.success('Product created successfully');
      router.push('/products');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/products" className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all">
          <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Register New Product</h1>
          <p className="text-[var(--text-secondary)] text-sm">Add a new item to your global inventory system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Package className="h-4 w-4 text-[var(--brand-primary)]" />
              Core Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. MacBook Pro M3"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">SKU (Unique Identifier) *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleInputChange}
                    onBlur={checkSkuUniqueness}
                    placeholder="PROD-001"
                    className={`w-full bg-[var(--bg-secondary)] border ${skuError ? 'border-red-500' : 'border-[var(--border)]'} rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:outline-none transition-all`}
                  />
                  {isCheckingSku && (
                    <div className="absolute right-4 top-3.5">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-primary)]" />
                    </div>
                  )}
                  {skuError && (
                    <div className="absolute right-4 top-3.5 text-red-500 flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase">{skuError}</span>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                  {!skuError && formData.sku && !isCheckingSku && (
                    <div className="absolute right-4 top-3.5 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:outline-none transition-all appearance-none"
                  >
                    <option value="General">General</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Components">Components</option>
                    <option value="Peripherals">Peripherals</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Initial Warehouse</label>
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:outline-none transition-all appearance-none"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Logic */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Financials
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Unit Cost (₹) *</label>
              <input
                type="number"
                name="unitCost"
                required
                step="0.01"
                min="0.01"
                value={formData.unitCost}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Smart Alerts
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Low Stock Threshold</label>
              <input
                type="number"
                name="reorderThreshold"
                value={formData.reorderThreshold}
                onChange={handleInputChange}
                min="0"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:outline-none transition-all"
              />
              <p className="text-[10px] text-[var(--text-secondary)] italic pt-1">
                Notify when stock drops below this level.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isCheckingSku || !!skuError}
            className="w-full bg-[var(--brand-primary)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating Product...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>Register Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
