'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  Warehouse, 
  History, 
  AlertTriangle, 
  Settings2, 
  Loader2,
  Edit3,
  ExternalLink,
  Layers,
  ShoppingBag,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleGuard from '@/components/ui/RoleGuard';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitCost: number;
  onHandQty: number;
  reservedQty: number;
  reorderThreshold: number;
  warehouse: { id: string; name: string };
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);
  const [tabData, setTabData] = useState<any>(null);
  const [isTabLoading, setIsTabLoading] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Product not found');
      setProduct(data.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabData = async (tab: string) => {
    if (tab === 'Overview') return;
    setIsTabLoading(true);
    try {
      let endpoint = '';
      if (tab === 'Movements') endpoint = `/api/move-history?productId=${id}`;
      if (tab === 'Damage') endpoint = `/api/damage-reports?status=All&productId=${id}`;
      if (tab === 'Adjustments') endpoint = `/api/move-history?productId=${id}&type=ADJUST`;

      const res = await fetch(endpoint);
      const data = await res.json();
      setTabData(data.data || []);
    } catch (err) {
      toast.error(`Failed to load ${tab} data`);
    } finally {
      setIsTabLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-primary)]" />
        <p className="font-bold text-[var(--text-secondary)]">Retrieving product specs...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Product Not Found</h3>
        <p className="text-[var(--text-secondary)]">This item may have been moved or deleted.</p>
        <Link href="/products" className="text-[var(--brand-primary)] font-bold hover:underline">Back to catalog</Link>
      </div>
    );
  }

  const available = product.onHandQty - product.reservedQty;
  const status = available === 0 ? 'Critical' : (available <= product.reorderThreshold ? 'At Risk' : 'OK');

  const tabs = [
    { name: 'Overview', icon: Package },
    { name: 'Movements', icon: History },
    { name: 'Damage', icon: AlertTriangle },
    { name: 'Adjustments', icon: Settings2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link href="/products" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" />
            Product Catalog
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">{product.name}</h1>
            <StatusBadge status={status as any} />
          </div>
          <div className="flex items-center gap-3">
             <span className="px-2 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[10px] font-mono font-bold text-[var(--text-secondary)]">
                {product.sku}
             </span>
             <span className="text-xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {product.category}
             </span>
          </div>
        </div>
        <div className="flex gap-3">
           <RoleGuard allowedRoles={['manager']}>
             <button className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--bg-secondary)] transition-all shadow-sm">
                <Edit3 className="h-4 w-4" />
                Edit Details
             </button>
           </RoleGuard>
           <RoleGuard allowedRoles={['manager']}>
             <button className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-500/20 transition-all">
                <ShoppingBag className="h-4 w-4" />
                Source More
             </button>
           </RoleGuard>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'On Hand', value: product.onHandQty, icon: Layers, color: 'text-blue-600' },
          { label: 'Reserved', value: product.reservedQty, icon: ShoppingBag, color: 'text-amber-600' },
          { label: 'Available', value: available, icon: Package, color: 'text-green-600' },
          { label: 'Threshold', value: product.reorderThreshold, icon: TrendingDown, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-[var(--border)] bg-[var(--bg-secondary)]/30 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.name 
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white' 
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[400px]">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest border-l-4 border-[var(--brand-primary)] pl-3">General Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                    <span className="text-sm text-[var(--text-secondary)]">Unit Cost</span>
                    <span className="text-sm font-black text-[var(--text-primary)]">₹{product.unitCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                    <span className="text-sm text-[var(--text-secondary)]">Primary Warehouse</span>
                    <span className="text-sm font-black text-[var(--text-primary)]">{product.warehouse.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                    <span className="text-sm text-[var(--text-secondary)]">Category</span>
                    <span className="text-sm font-black text-[var(--text-primary)]">{product.category}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest border-l-4 border-amber-500 pl-3">Inventory Health</h3>
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                   <p className="text-xs text-blue-700 font-medium mb-1 border-b border-blue-100 pb-2">Valuation Summary</p>
                   <div className="mt-4 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Total Assets</p>
                        <p className="text-3xl font-black text-blue-900">₹{(product.onHandQty * product.unitCost).toLocaleString()}</p>
                      </div>
                      <Link href="/move-history" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                        Audit Movements <ExternalLink className="h-3 w-3" />
                      </Link>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="space-y-4">
              {isTabLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
                  <p className="text-xs font-bold text-[var(--text-secondary)]">Fetching history...</p>
                </div>
              ) : tabData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
                  <History className="h-10 w-10 opacity-20 mb-4" />
                  <p className="italic text-sm">No {activeTab.toLowerCase()} records found for this product.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[10px] uppercase tracking-wider font-black text-[var(--text-secondary)]">
                        {activeTab === 'Movements' || activeTab === 'Adjustments' ? (
                          <>
                            <th className="pb-4">Type</th>
                            <th className="pb-4 text-right">Quantity</th>
                            <th className="pb-4">From</th>
                            <th className="pb-4">To</th>
                            <th className="pb-4 text-right">Date</th>
                          </>
                        ) : (
                          <>
                            <th className="pb-4">Reason</th>
                            <th className="pb-4 text-right">Quantity</th>
                            <th className="pb-4">Reported By</th>
                            <th className="pb-4 text-right">Date</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {tabData.map((item: any) => (
                        <tr key={item.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          {activeTab === 'Movements' || activeTab === 'Adjustments' ? (
                            <>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  item.type === 'IN' ? 'bg-green-50 text-green-600' :
                                  item.type === 'OUT' ? 'bg-red-50 text-red-600' :
                                  item.type === 'ADJUST' ? 'bg-indigo-50 text-indigo-600' :
                                  'bg-gray-50 text-gray-600'
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="py-4 text-right font-bold">{item.quantity}</td>
                              <td className="py-4 text-[var(--text-secondary)]">{item.fromLocation?.name || '-'}</td>
                              <td className="py-4 text-[var(--text-secondary)]">{item.toLocation?.name || '-'}</td>
                              <td className="py-4 text-right text-[var(--text-secondary)]">{format(new Date(item.createdAt), 'MMM d, p')}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 font-bold">{item.reason}</td>
                              <td className="py-4 text-right font-black text-red-600">{item.quantity}</td>
                              <td className="py-4 text-[var(--text-secondary)]">{item.reportedBy}</td>
                              <td className="py-4 text-right text-[var(--text-secondary)]">{format(new Date(item.createdAt), 'MMM d, p')}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
