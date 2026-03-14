'use client';

import React, { useEffect, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  storageKey: string;
  onViewChange: (view: 'list' | 'kanban') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ storageKey, onViewChange }) => {
  const [view, setView] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    const savedView = localStorage.getItem(storageKey) as 'list' | 'kanban';
    if (savedView) {
      setView(savedView);
      onViewChange(savedView);
    }
  }, [storageKey, onViewChange]);

  const handleToggle = (newView: 'list' | 'kanban') => {
    setView(newView);
    localStorage.setItem(storageKey, newView);
    onViewChange(newView);
  };

  return (
    <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border)] w-fit">
      <button
        onClick={() => handleToggle('list')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          view === 'list'
            ? 'bg-white shadow-sm text-[var(--brand-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <List className="h-4 w-4" />
        <span>List</span>
      </button>
      <button
        onClick={() => handleToggle('kanban')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          view === 'kanban'
            ? 'bg-white shadow-sm text-[var(--brand-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Kanban</span>
      </button>
    </div>
  );
};

export default ViewToggle;
