'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useSessionTimer - Tracks user inactivity and triggers a warning before expiry.
 * @param warningMinutes Minutes of inactivity before showWarning becomes true.
 * @param expireMinutes Minutes of inactivity before the session is considered expired.
 */
export function useSessionTimer(warningMinutes = 25, expireMinutes = 30) {
  const [showWarning, setShowWarning] = useState(false);
  const warningMs = warningMinutes * 60 * 1000;
  const expireMs = expireMinutes * 60 * 1000;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expireTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);

    timerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, warningMs);

    expireTimerRef.current = setTimeout(() => {
      // In a real app, you might trigger signOut() here directly
      console.log("Session expired due to inactivity");
    }, expireMs);
  }, [warningMs, expireMs]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      // If we are already showing the warning, we don't auto-reset 
      // User must interact with the modal specifically to reset.
      // This is a common security pattern.
    };

    const globalReset = () => {
       if (!showWarning) resetTimer();
    };

    events.forEach(event => window.addEventListener(event, globalReset));
    
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, globalReset));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    };
  }, [resetTimer, showWarning]);

  return { showWarning, resetTimer };
}
