'use client';

import React, { createContext, useContext } from 'react';
import { Toaster, toast, ToastOptions } from 'react-hot-toast';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const defaultOptions: ToastOptions = {
  duration: 4000,
  style: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const success = (message: string) => {
    toast.success(message, {
      ...defaultOptions,
      iconTheme: {
        primary: 'var(--badge-done-bg)',
        secondary: 'var(--badge-done-text)',
      },
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      ...defaultOptions,
      iconTheme: {
        primary: 'var(--badge-critical-bg)',
        secondary: 'var(--badge-critical-text)',
      },
    });
  };

  const warning = (message: string) => {
    toast(message, {
      ...defaultOptions,
      icon: '⚠️',
      style: {
        ...defaultOptions.style,
        border: '1px solid var(--badge-waiting-bg)',
      },
    });
  };

  const info = (message: string) => {
    toast(message, {
      ...defaultOptions,
      icon: 'ℹ️',
      style: {
        ...defaultOptions.style,
        border: '1px solid var(--badge-draft-bg)',
      },
    });
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <Toaster position="top-right" />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
