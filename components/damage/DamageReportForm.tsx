'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Camera, X, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  availableQty: number;
}

interface Warehouse {
  id: string;
  name: string;
}

const REASON_CHIPS = ['Rotten', 'Damaged', 'Expired', 'Lost'];

const DamageReportForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Form State
  const [productQuery, setProductQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(false);

  // Fetch Warehouses
  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouses(data))
      .catch(err => console.error('Failed to load warehouses', err));
  }, []);

  // Product Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (productQuery.length >= 2) {
        setIsSearching(true);
        fetch(`/api/products?sku=${encodeURIComponent(productQuery)}`)
          .then(res => res.json())
          .then(data => {
            setSearchResults(data.data || []);
            setShowResults(true);
          })
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productQuery]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error('Please select a product');
    if (quantity <= 0) return toast.error('Quantity must be greater than 0');
    if (quantity > selectedProduct.availableQty) {
      return toast.error(`Cannot report more than available stock (${selectedProduct.availableQty})`);
    }
    if (!warehouseId) return toast.error('Please select a warehouse');
    if (!reason) return toast.error('Please provide a reason');

    setIsLoading(true);
    try {
      const res = await fetch('/api/damage-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          reason,
          warehouseId,
          reportedBy: 'Admin User', // In a real app, this would come from session
          photoPath: photo
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      const warehouseName = warehouses.find(w => w.id === warehouseId)?.name;
      setSuccessData({
        quantity,
        productName: selectedProduct.name,
        reason,
        warehouseName
      });
      toast.success('Damage report submitted');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center shadow-xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Report Submitted!</h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
          ✅ <span className="font-semibold text-[var(--text-primary)]">{successData.quantity} {successData.productName}</span> reported as <span className="italic">{successData.reason}</span> in <span className="font-semibold text-[var(--text-primary)]">{successData.warehouseName}</span> — stock reduced by {successData.quantity}.
        </p>
        <button
          onClick={() => {
            setSuccessData(null);
            setSelectedProduct(null);
            setProductQuery('');
            setQuantity(0);
            setReason('');
            setPhoto(null);
          }}
          className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Report More Damage
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm">
      {/* Product Search */}
      <div className="space-y-1.5 relative" ref={searchRef}>
        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Product</label>
        <div className="relative">
          <input
            type="text"
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none"
            placeholder="Type SKU or Name to search..."
            value={selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : productQuery}
            onChange={(e) => {
              if (selectedProduct) setSelectedProduct(null);
              setProductQuery(e.target.value);
            }}
            onFocus={() => productQuery.length >= 2 && setShowResults(true)}
          />
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[var(--text-secondary)]" />
          {isSearching && <Loader2 className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-[var(--brand-primary)]" />}
          {selectedProduct && (
            <button 
              type="button"
              className="absolute right-4 top-3.5"
              onClick={() => {
                setSelectedProduct(null);
                setProductQuery('');
              }}
            >
              <X className="h-4 w-4 text-[var(--text-secondary)] hover:text-red-500" />
            </button>
          )}
        </div>

        {showResults && !selectedProduct && (
          <div className="absolute top-full mt-2 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
            {searchResults.length === 0 ? (
              <div className="p-4 text-sm text-[var(--text-secondary)] text-center italic">No products found</div>
            ) : (
              searchResults.map(p => (
                <div 
                  key={p.id}
                  className="p-3 hover:bg-[var(--bg-secondary)] cursor-pointer border-b border-[var(--border)] last:border-0 flex justify-between items-center"
                  onClick={() => {
                    setSelectedProduct(p);
                    setShowResults(false);
                  }}
                >
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{p.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{p.sku}</div>
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 bg-[var(--bg-secondary)] rounded-md border border-[var(--border)]">
                    {p.availableQty} available
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warehouse */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Warehouse</label>
          <select
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none appearance-none"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <option value="">Select Warehouse...</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Quantity</label>
          <div className="relative">
            <input
              type="number"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none"
              placeholder="0"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              max={selectedProduct?.availableQty}
            />
            {selectedProduct && quantity > selectedProduct.availableQty && (
              <div className="absolute right-3 top-3.5 text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}
          </div>
          {selectedProduct && (
            <p className="text-[10px] text-[var(--text-secondary)] italic">
              Max available: {selectedProduct.availableQty}
            </p>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Reason</label>
        <textarea
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none h-24 resize-none"
          placeholder="Describe the damage..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {REASON_CHIPS.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => setReason(chip)}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all font-medium"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Photo */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Photo (Optional)</label>
        <div className="flex items-center gap-4">
          <label className="relative cursor-pointer group">
            <div className="w-20 h-20 rounded-xl bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] group-hover:border-[var(--brand-primary)] group-hover:text-[var(--brand-primary)] transition-all overflow-hidden font-bold">
              {photo ? (
                <img src={photo} alt="Damage" className="w-full h-full object-cover" />
              ) : (
                <Camera className="h-8 w-8" />
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </label>
          <div className="text-xs text-[var(--text-secondary)]">
            <p className="font-semibold">Upload Photo</p>
            <p>JPEG, PNG up to 2MB</p>
          </div>
          {photo && (
            <button 
              type="button" 
              onClick={() => setPhoto(null)}
              className="ml-auto text-xs text-red-500 font-bold hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !selectedProduct || quantity <= 0 || quantity > (selectedProduct?.availableQty || 0)}
        className="w-full bg-[var(--brand-primary)] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Submitting Report...</span>
          </>
        ) : (
          <span>Submit Damage Report</span>
        )}
      </button>
    </form>
  );
};

export default DamageReportForm;
