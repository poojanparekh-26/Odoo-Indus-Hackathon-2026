'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Package, FileInput, Truck } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface SearchResults {
  products: any[];
  receipts: any[];
  deliveries: any[];
}

const GlobalSearch: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (query.trim()) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults(null);
      setIsLoading(false);
    }
  }, [query, performSearch]);

  const flattenedResults = results 
    ? [
        ...results.products.map(p => ({ ...p, type: 'product' })),
        ...results.receipts.map(r => ({ ...r, type: 'receipt' })),
        ...results.deliveries.map(d => ({ ...d, type: 'delivery' }))
      ]
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, flattenedResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const item = flattenedResults[selectedIndex];
      navigate(item);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const navigate = (item: any) => {
    let url = '';
    if (item.type === 'product') url = `/products/${item.id}`;
    if (item.type === 'receipt') url = `/receipts/${item.id}`;
    if (item.type === 'delivery') url = `/deliveries/${item.id}`;
    
    if (url) {
      router.push(url);
      setIsOpen(false);
      setQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          placeholder="Search products, receipts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-[var(--text-secondary)] animate-spin" />
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-96 overflow-y-auto p-2">
            {flattenedResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                No results for "{query}"
              </div>
            ) : (
              <>
                {results.products.length > 0 && (
                  <Section title="Products" icon={<Package className="h-4 w-4" />} />
                )}
                {results.products.map((p, idx) => (
                  <ResultItem 
                    key={p.id} 
                    item={{...p, type: 'product'}} 
                    isSelected={selectedIndex === idx}
                    onClick={() => navigate({...p, type: 'product'})}
                  />
                ))}

                {results.receipts.length > 0 && (
                  <Section title="Receipts" icon={<FileInput className="h-4 w-4" />} />
                )}
                {results.receipts.map((r, idx) => (
                  <ResultItem 
                    key={r.id} 
                    item={{...r, type: 'receipt'}} 
                    isSelected={selectedIndex === results.products.length + idx}
                    onClick={() => navigate({...r, type: 'receipt'})}
                  />
                ))}

                {results.deliveries.length > 0 && (
                  <Section title="Deliveries" icon={<Truck className="h-4 w-4" />} />
                )}
                {results.deliveries.map((d, idx) => (
                  <ResultItem 
                    key={d.id} 
                    item={{...d, type: 'delivery'}} 
                    isSelected={selectedIndex === results.products.length + results.receipts.length + idx}
                    onClick={() => navigate({...d, type: 'delivery'})}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
    {icon}
    {title}
  </div>
);

const ResultItem = ({ item, isSelected, onClick }: { item: any, isSelected: boolean, onClick: () => void }) => {
  const displayTitle = item.type === 'product' ? item.name : item.reference;
  const subTitle = item.type === 'product' ? item.sku : `Status: ${item.status}`;

  return (
    <div 
      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)]' : 'hover:bg-[var(--bg-secondary)]'
      }`}
      onClick={onClick}
    >
      <div>
        <div className="text-sm font-medium">{displayTitle}</div>
        <div className="text-xs opacity-70">{subTitle}</div>
      </div>
      {item.status && (
        <StatusBadge status={item.status as any} />
      )}
    </div>
  );
};

export default GlobalSearch;
