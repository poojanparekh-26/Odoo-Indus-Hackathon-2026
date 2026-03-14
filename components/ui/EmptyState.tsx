'use client';

import React, { ReactNode } from 'react';
import { Inbox, Search, Box, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'inbox' | 'search' | 'box' | ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = 'inbox', action }) => {
  const renderIcon = () => {
    if (typeof icon !== 'string') return icon;

    const iconClasses = "w-16 h-16 text-[var(--text-secondary)] opacity-10 mb-4";
    switch (icon) {
      case 'search':
        return <Search className={iconClasses} />;
      case 'box':
        return <Box className={iconClasses} />;
      default:
        return <Inbox className={iconClasses} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-card)] border-2 border-dashed border-[var(--border)] rounded-3xl animate-in fade-in zoom-in-95 duration-500">
      {renderIcon()}
      <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 tracking-tight">{title}</h3>
      <p className="text-[var(--text-secondary)] max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      
      {action && (
        action.href ? (
          <Link 
            href={action.href}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-[var(--brand-primary)]/20"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Link>
        ) : (
          <button 
            onClick={action.onClick}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-[var(--brand-primary)]/20"
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;

/**
 * Presets for common empty states
 */

export const EmptyProductsState = () => (
  <EmptyState 
    icon="box"
    title="No products found"
    description="Your product catalog is empty. Start by adding your first product to track inventory."
    action={{ label: "Add Product", href: "/products/new" }}
  />
);

export const EmptyReceiptsState = () => (
  <EmptyState 
    icon="inbox"
    title="No receipts yet"
    description="You haven't recorded any incoming shipments. Create a receipt when new stock arrives."
    action={{ label: "Create Receipt", href: "/receipts/new" }}
  />
);

export const EmptyMovementsState = () => (
  <EmptyState 
    icon="search"
    title="No movement history"
    description="There are no stock movements recorded for the selected filters."
  />
);

export const EmptyDamageReportsState = () => (
  <EmptyState 
    icon="box"
    title="No damage reports"
    description="Clean record! No damaged or lost items have been reported yet."
    action={{ label: "Report Damage", href: "/damage-reports/new" }}
  />
);

export const EmptyDeliveriesState = () => (
  <EmptyState 
    icon="inbox"
    title="No deliveries yet"
    description="You haven't recorded any outgoing shipments. Create a delivery when fulfilling customer orders."
    action={{ label: "Create Delivery", href: "/deliveries/new" }}
  />
);
