'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOfflineStatus();
  const { queueSize, isSyncing } = useOfflineQueue();
  const { success } = useToast();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (isOnline && wasOffline && !isSyncing) {
      success("Back online — changes synced");
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, isSyncing, success]);

  if (isOnline && queueSize === 0) return null;

  return (
    <div className={`sticky top-0 z-[100] w-full ${isOnline ? 'bg-blue-500' : 'bg-amber-500'} text-white px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300`}>
      {isSyncing ? (
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      <p className="text-sm font-medium">
        {isSyncing 
          ? "Syncing changes..." 
          : !isOnline 
            ? `You are offline. ${queueSize > 0 ? `${queueSize} operations queued — will sync on reconnect.` : 'Changes will sync when you reconnect.'}`
            : queueSize > 0 ? `${queueSize} operations pending sync.` : 'Back online.'
        }
      </p>
    </div>
  );
};

export default OfflineIndicator;
