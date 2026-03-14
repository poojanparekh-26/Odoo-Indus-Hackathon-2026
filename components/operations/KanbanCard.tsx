import React from 'react';
import Link from 'next/link';
import { Layers, Calendar, User } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { format } from 'date-fns';

export interface KanbanItem {
  id: string;
  reference: string;
  partyName: string;
  date: string | Date;
  lineCount: number;
  status: string;
}

interface KanbanCardProps {
  item: KanbanItem;
  entityPath: string;
  index: number;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ item, entityPath, index }) => {
  return (
    <Link 
      href={`/${entityPath}/${item.id}`}
      className="block group transition-all duration-200 hover:scale-[1.01] kanban-card"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
            {item.reference}
          </span>
          <StatusBadge status={item.status as any} />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">{item.partyName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(item.date), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <Layers className="h-3 w-3" />
            <span>{item.lineCount} items</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default KanbanCard;
