import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '1rem', 
  className = '', 
  rounded = true 
}) => {
  return (
    <div
      className={`animate-shimmer ${rounded ? 'rounded' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
