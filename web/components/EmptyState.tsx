import React from 'react';
import { Database, AlertCircle, RefreshCw, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'data' | 'alert' | 'query';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message,
  actionText,
  onAction,
  icon = 'data',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-monsoon-forest/30 border border-monsoon-border/40 my-3">
      <div className="w-12 h-12 rounded-full bg-monsoon-surface border border-monsoon-border flex items-center justify-center mb-3 text-slate-400">
        {icon === 'data' && <Database className="w-6 h-6 text-emerald-400/80" />}
        {icon === 'alert' && <AlertCircle className="w-6 h-6 text-amber-400/80" />}
        {icon === 'query' && <FileQuestion className="w-6 h-6 text-slate-400" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-monsoon-surface hover:bg-monsoon-pine border border-monsoon-border text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
