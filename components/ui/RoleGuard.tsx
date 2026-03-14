'use client';

import React, { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface RoleGuardProps {
  allowedRoles: string[];
  tooltip?: string;
  children: ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  tooltip = "Manager access required", 
  children 
}) => {
  const { data: session } = useSession();

  const userRole = (session?.user as { role: string })?.role;
  const isAllowed = userRole && allowedRoles.includes(userRole);

  if (!isAllowed) {
    return (
      <div 
        className="opacity-50 pointer-events-none cursor-not-allowed filter grayscale-[0.5]" 
        title={tooltip}
      >
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
