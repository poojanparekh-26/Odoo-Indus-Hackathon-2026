'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, User, ChevronRight } from 'lucide-react';
import GlobalSearch from '../ui/GlobalSearch';
import { useSession } from 'next-auth/react';
import ThemeToggle from '../ui/ThemeToggle';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { href, label };
  });

  if (!isMounted) return null;

  return (
    <header 
      suppressHydrationWarning
      className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-primary)] px-4 md:px-6"
    >
      <button 
        className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] lg:hidden"
        onClick={onMenuClick}
        aria-label="Open Menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-[var(--text-primary)]' : ''}>
              {crumb.label}
            </span>
            {idx < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4" />}
          </React.Fragment>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4 flex-1 justify-end max-w-xl">
        <GlobalSearch />
        
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
          <ThemeToggle />

          <button 
            className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 border-2 border-[var(--bg-primary)]" />
          </button>

          <div className="flex items-center gap-3 ml-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">
                {session?.user?.name || 'Loading...'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {(session?.user as { id: string } | undefined)?.id ? 'Warehouse Manager' : 'Guest'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--brand-primary)]">
              <User className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
