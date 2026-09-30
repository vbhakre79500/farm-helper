import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskLevel } from '../../shared/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMm(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '-- mm';
  return `${val.toFixed(1)} mm`;
}

export function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '--%';
  return `${Math.round(val)}%`;
}

export function getRiskColorClass(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return 'text-emerald-400 bg-emerald-950/60 border-emerald-600/40';
    case 'MODERATE':
      return 'text-amber-400 bg-amber-950/60 border-amber-600/40';
    case 'ELEVATED':
      return 'text-orange-400 bg-orange-950/60 border-orange-600/40';
    case 'HIGH':
      return 'text-rose-400 bg-rose-950/60 border-rose-600/40';
    case 'CRITICAL':
      return 'text-red-300 bg-red-950/90 border-red-500 font-bold';
    default:
      return 'text-slate-400 bg-slate-900 border-slate-700';
  }
}

export function getRiskHexColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return '#16a34a';
    case 'MODERATE':
      return '#ca8a04';
    case 'ELEVATED':
      return '#ea580c';
    case 'HIGH':
      return '#dc2626';
    case 'CRITICAL':
      return '#991b1b';
    default:
      return '#64748b';
  }
}
