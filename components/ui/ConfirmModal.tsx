'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  isLoading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const okButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and accessibility
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Tab') {
          const focusable = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) {
            const first = focusable[0] as HTMLElement;
            const last = focusable[focusable.length - 1] as HTMLElement;
            if (e.shiftKey && document.activeElement === first) {
              last.focus();
              e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      okButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 id="modal-title" className="text-xl font-bold text-[var(--text-primary)]">
              {title}
            </h3>
            <button 
              onClick={onCancel}
              className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex gap-4 mb-8">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              danger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            }`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed pt-1">
              {message}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-bold hover:bg-[var(--bg-secondary)] transition-all disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              ref={okButtonRef}
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
                danger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-[var(--brand-primary)] hover:shadow-blue-500/20'
              }`}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

/**
 * useConfirmModal hook for easier state management
 */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
  }, []);
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return { isOpen, isLoading, open, close, startLoading, stopLoading };
}
