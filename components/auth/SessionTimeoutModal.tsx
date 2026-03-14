'use client';

import React, { useState, useEffect } from 'react';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { signOut } from 'next-auth/react';
import { Clock, AlertCircle, LogOut, ArrowRight } from 'lucide-react';

const SessionTimeoutModal = () => {
  const { showWarning, resetTimer } = useSessionTimer(25, 30);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showWarning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            signOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(300);
    }

    return () => clearInterval(interval);
  }, [showWarning]);

  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border-4 border-amber-100 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Inactivity Warning</h2>
            <p className="text-[var(--text-secondary)] text-sm px-4">
              Your session is about to expire due to inactivity. You will be logged out automatically for security.
            </p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border)]">
            <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest mb-1">Logging out in</p>
            <p className="text-4xl font-black text-[var(--brand-primary)] tabular-nums">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={resetTimer}
              className="w-full py-4 bg-[var(--brand-primary)] text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              Extend Session
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => signOut()}
              className="w-full py-3 text-[var(--text-secondary)] font-bold hover:text-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
