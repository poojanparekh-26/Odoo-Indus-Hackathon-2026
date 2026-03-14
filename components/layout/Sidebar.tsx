'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileInput, 
  Truck, 
  ArrowLeftRight, 
  AlertTriangle, 
  Settings2, 
  Brain, 
  ScrollText, 
  Settings,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/receipts', label: 'Receipts', icon: FileInput },
  { href: '/deliveries', label: 'Deliveries', icon: Truck },
  { href: '/move-history', label: 'Move History', icon: ArrowLeftRight },
  { href: '/damage-reports', label: 'Damage Reports', icon: AlertTriangle },
  { href: '/reorder-rules', label: 'Reorder Rules', icon: Settings2 },
  { href: '/ai-insights', label: 'AI Insights', icon: Brain },
  { href: '/audit-log', label: 'Audit Log', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold">
                I
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Invo<span className="text-[var(--brand-primary)]">Track</span>
              </span>
            </div>
            <button 
              className="lg:hidden text-[var(--text-secondary)]" 
              onClick={onClose}
              aria-label="Close Sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] font-semibold shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--brand-primary)]' : ''}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Summary (Optional Footer) */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs text-white font-bold">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">Admin User</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">warehouse-manager</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
