'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { AlertTriangle, Flame, Bug, Clock, X, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  type: 'low-stock' | 'damage' | 'late-operation' | 'inventory-loss';
  message: string;
  severity: 'Warning' | 'Critical';
  timestamp: Date;
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [, setTick] = useState(0);

  // Auto-refresh relative time every 60s
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const addAlert = useCallback((newAlert: Omit<Alert, 'id' | 'timestamp'>) => {
    setAlerts(prev => {
      const updated = [
        { ...newAlert, id: Math.random().toString(36).substr(2, 9), timestamp: new Date() },
        ...prev
      ];
      return updated.slice(0, 10);
    });
  }, []);

  // Socket Subscriptions
  useSocket('low-stock-alert', (data: any) => {
    addAlert({
      type: 'low-stock',
      message: `${data.productName} (${data.sku}) is below threshold in ${data.warehouseName}. Current: ${data.currentStock}`,
      severity: 'Critical'
    });
  });

  useSocket('damage-alert', (data: any) => {
    addAlert({
      type: 'damage',
      message: `${data.quantity} units of ${data.productName} damaged: ${data.reason}`,
      severity: 'Warning'
    });
  });

  useSocket('late-operation-alert', (data: any) => {
    addAlert({
      type: 'late-operation',
      message: `${data.type} ${data.reference} is over ${data.hoursLate} hours late.`,
      severity: 'Critical'
    });
  });

  useSocket('inventory-loss-alert', (data: any) => {
    addAlert({
      type: 'inventory-loss',
      message: `Stock loss detected: ₹${data.damagedValue.toLocaleString()} in last 24h (${data.percentage}% of inventory).`,
      severity: 'Critical'
    });
  });

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'low-stock':
      case 'late-operation':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'inventory-loss':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'damage':
        return <Bug className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-secondary)]/50">
        <h3 className="font-black text-sm uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
          Smart Alerts
          {alerts.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
              {alerts.length}
            </span>
          )}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-green-600 font-bold text-sm">No alerts — all systems normal ✓</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className="group relative bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4 transition-all hover:shadow-md hover:border-[var(--brand-primary)]/30 animate-in slide-in-from-right-4 duration-300"
            >
              <button 
                onClick={() => dismissAlert(alert.id)}
                className="absolute top-2 right-2 p-1 text-[var(--text-secondary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-3">
                <div className="mt-0.5">{getIcon(alert.type)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-primary)] font-medium">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
