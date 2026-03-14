import React from 'react';
import KanbanCard, { KanbanItem } from './KanbanCard';

interface KanbanBoardProps {
  columns: string[];
  items: KanbanItem[];
  entityPath: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, items, entityPath }) => {
  const getHeaderColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400';
      case 'READY': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'DONE': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]';
    }
  };

  const getItemsByStatus = (status: string) => {
    return items.filter(item => item.status.toLowerCase() === status.toLowerCase());
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-[var(--border)]">
      {columns.map((column) => {
        const columnItems = getItemsByStatus(column);
        return (
          <div key={column} className="flex-shrink-0 w-80 flex flex-col h-full">
            <div className={`flex items-center justify-between p-3 rounded-t-xl border-t border-x border-[var(--border)] font-bold text-xs uppercase tracking-widest ${getHeaderColor(column)}`}>
              <span>{column}</span>
              <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-[10px]">
                {columnItems.length}
              </span>
            </div>
            
            <div className="flex-1 bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-b-xl p-4 space-y-4 min-h-[500px]">
              {columnItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-xs py-10">
                  No items in {column}
                </div>
              ) : (
                columnItems.map((item, index) => (
                  <KanbanCard key={item.id} item={item} entityPath={entityPath} index={index} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
