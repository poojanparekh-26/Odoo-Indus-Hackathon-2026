'use client';

import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  loading?: boolean;
  color?: string;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, loading, color, description }) => {
  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl shadow-sm">
        <Skeleton width="40%" height="1.25rem" className="mb-4" />
        <Skeleton width="60%" height="2.25rem" className="mb-2" />
        <Skeleton width="80%" height="1rem" />
      </div>
    );
  }

  return (
    <div 
      className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl shadow-sm transition-all hover:shadow-md animate-in fade-in duration-200"
      style={{ borderLeft: color ? `4px solid ${color}` : undefined }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
        {icon && <div className="text-[var(--text-secondary)]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[var(--text-primary)]">{value}</span>
      </div>
      {description && (
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
      )}
    </div>
  );
};

export default KPICard;
