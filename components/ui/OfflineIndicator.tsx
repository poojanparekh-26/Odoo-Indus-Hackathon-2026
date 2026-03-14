'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, queueSize, setQueueSize };
}

const OfflineIndicator: React.FC = () => {
  const { isOnline, queueSize } = useOfflineStatus();
  const { success } = useToast();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      success("Back online — syncing changes");
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, success]);

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-[100] w-full bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <p className="text-sm font-medium">
        You are offline. {queueSize > 0 ? `${queueSize} operations queued — will sync on reconnect.` : 'Changes will sync when you reconnect.'}
      </p>
    </div>
  );
};

export default OfflineIndicator;
