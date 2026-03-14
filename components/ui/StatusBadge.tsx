import React from 'react';

export type StatusBadgeVariant = 
  | "Draft" 
  | "Waiting" 
  | "Ready" 
  | "Done" 
  | "Cancelled" 
  | "Damaged" 
  | "Critical"
  | "At Risk"
  | "OK";

interface StatusBadgeProps {
  status: StatusBadgeVariant;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = (variant: StatusBadgeVariant) => {
    const key = variant.toLowerCase();
    return {
      backgroundColor: `var(--badge-${key}-bg)`,
      color: `var(--badge-${key}-text)`,
    };
  };

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors"
      style={getStyles(status)}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
