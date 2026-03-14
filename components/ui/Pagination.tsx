'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
}) => {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-[var(--bg-card)] border-t border-[var(--border)] sm:px-6">
      <div className="text-sm text-[var(--text-secondary)]">
        Showing <span className="font-medium text-[var(--text-primary)]">{start}</span>–
        <span className="font-medium text-[var(--text-primary)]">{end}</span> of{' '}
        <span className="font-medium text-[var(--text-primary)]">{total}</span> results
      </div>
      
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {getPageNumbers().map((p, idx) => (
          <React.Fragment key={idx}>
            {p === '...' ? (
              <span className="px-3 py-2 text-[var(--text-secondary)]">...</span>
            ) : (
              <button
                onClick={() => onPageChange(p as number)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg border transition-all ${
                  page === p
                    ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {p}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
