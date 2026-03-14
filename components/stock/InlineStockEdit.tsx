'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InlineStockEditProps {
  productId: string;
  currentValue: number;
  onUpdated: (newValue: number) => void;
}

const InlineStockEdit: React.FC<InlineStockEditProps> = ({ productId, currentValue, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue.toString());
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const newValue = parseInt(value);
    if (isNaN(newValue) || newValue < 0) {
      toast.error("Invalid stock quantity");
      return;
    }

    if (newValue === currentValue) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stock/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustment: newValue - currentValue,
          reason: "Manual adjustment"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update stock");
      }

      onUpdated(newValue);
      setIsEditing(false);
      toast.success("Stock updated successfully");
    } catch (error: any) {
      toast.error(error.message);
      setValue(currentValue.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setValue(currentValue.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-20 px-2 py-1 text-sm border border-[var(--brand-primary)] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 shadow-inner"
        />
        <div className="flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-primary)]" />
          ) : (
            <>
              <button 
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setValue(currentValue.toString()); setIsEditing(false); }}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-2 cursor-pointer py-1 px-2 -mx-2 rounded hover:bg-[var(--bg-secondary)] transition-colors"
    >
      <span className="font-mono text-sm font-bold">{currentValue}</span>
      <Pencil className="w-3 h-3 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default InlineStockEdit;
