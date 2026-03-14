'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';

export interface LowStockAlert {
  productId: string;
  name: string;
  onHandQty: number;
  reorderThreshold: number;
}

const LowStockBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('low-stock-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleAlert = useCallback((newAlert: LowStockAlert) => {
    setAlerts((prev) => {
      // Avoid duplicate products in the list
      const exists = prev.find((a) => a.productId === newAlert.productId);
      if (exists) return prev;
      return [newAlert, ...prev].slice(0, 5);
    });
    setIsDismissed(false);
    sessionStorage.setItem('low-stock-dismissed', 'false');
  }, []);

  useSocket<LowStockAlert>('low-stock-alert', handleAlert);

  if (alerts.length === 0 || isDismissed) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 p-4 low-stock-banner overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
            !
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-900">Low Stock Warning</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
              {alerts.map((alert) => (
                <span key={alert.productId} className="text-xs text-amber-700">
                  <span className="font-medium">{alert.name}</span>: {alert.onHandQty} left (Threshold: {alert.reorderThreshold})
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsDismissed(true);
            sessionStorage.setItem('low-stock-dismissed', 'true');
          }}
          className="text-amber-500 hover:text-amber-700 transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LowStockBanner;
