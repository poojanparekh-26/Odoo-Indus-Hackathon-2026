'use client';
import { useSession } from 'next-auth/react';
import React from 'react';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  tooltip?: string;
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  tooltip = "Manager access required" 
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <>{children}</>;
  
  const role = (session?.user as any)?.role || "staff";
  const hasAccess = allowedRoles.includes(role);
  
  if (!hasAccess) {
    return (
      <div 
        className="relative group cursor-not-allowed"
        title={tooltip}
      >
        <div className="pointer-events-none opacity-40 select-none">
          {children}
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
          hidden group-hover:block bg-gray-800 text-white text-xs 
          rounded-lg px-3 py-1.5 whitespace-nowrap z-50 shadow-lg">
          {tooltip}
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
