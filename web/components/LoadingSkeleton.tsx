import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; heightClass?: string }> = ({
  rows = 3,
  heightClass = 'h-6',
}) => {
  return (
    <div className="space-y-3 animate-pulse p-4 rounded-xl bg-monsoon-forest/20 border border-monsoon-border/30">
      <div className="h-4 bg-monsoon-surface rounded w-1/3"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${heightClass} bg-monsoon-pine/40 rounded w-full`}></div>
      ))}
      <div className="h-3 bg-monsoon-surface/60 rounded w-1/2"></div>
    </div>
  );
};
