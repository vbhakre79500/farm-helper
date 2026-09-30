import React from 'react';
import { RiskLevel } from '../../shared/types';
import { RISK_LABELS } from '../../shared/translations';
import { useAppStore } from '../store/locationStore';
import { cn, getRiskColorClass } from '../lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className, showIcon = true }) => {
  const language = useAppStore((s) => s.language);
  const label = RISK_LABELS[language]?.[level] || level;

  const renderIcon = () => {
    switch (level) {
      case 'LOW':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />;
      case 'MODERATE':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />;
      case 'ELEVATED':
      case 'HIGH':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />;
      case 'CRITICAL':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
        getRiskColorClass(level),
        className
      )}
      role="status"
      aria-label={`Risk level: ${level}`}
    >
      {showIcon && renderIcon()}
      <span>{label}</span>
    </span>
  );
};
