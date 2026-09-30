'use client';

import React from 'react';
import { useAppStore } from '../store/locationStore';
import { ForecastHorizon } from '../../shared/types';
import { Calendar } from 'lucide-react';

const HORIZONS: { label: string; days: ForecastHorizon; subtext: string }[] = [
  { label: '7 Days', days: 7, subtext: 'Short-range outlook' },
  { label: '14 Days', days: 14, subtext: 'Medium-range outlook' },
  { label: '21 Days', days: 21, subtext: 'Extended outlook' },
  { label: '30 Days', days: 30, subtext: 'Sub-seasonal outlook' },
];

export const ForecastHorizonSelector: React.FC = () => {
  const { selectedHorizon, setSelectedHorizon } = useAppStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-1">
        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
        <span>Lead Horizon:</span>
      </div>
      <div className="inline-flex rounded-lg bg-monsoon-dark/80 p-1 border border-monsoon-border/60">
        {HORIZONS.map((h) => {
          const isActive = selectedHorizon === h.days;
          return (
            <button
              key={h.days}
              type="button"
              onClick={() => setSelectedHorizon(h.days)}
              aria-pressed={isActive}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-monsoon-forest/60'
              }`}
            >
              {h.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
