'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS, RISK_LABELS } from '../../../shared/translations';
import { LocationSelector } from '../../components/LocationSelector';
import { ForecastHorizonSelector } from '../../components/ForecastHorizonSelector';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Layers, Info, Compass } from 'lucide-react';

const DynamicMap = dynamic(
  () => import('../../components/LeafletMap').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => <LoadingSkeleton rows={8} heightClass="h-14" />,
  }
);

type ActiveLayer = 'overall' | 'onset' | 'break' | 'heavyRain' | 'revival';

export default function RiskMapPage() {
  const { language, selectedHorizon } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('overall');

  const layers: { id: ActiveLayer; label: string; description: string }[] = [
    { id: 'overall', label: 'Composite Risk', description: 'Integrated crop & rainfall hazard index' },
    { id: 'onset', label: t.onsetProbability, description: 'Spatial progression of monsoon trough front' },
    { id: 'break', label: t.breakProbability, description: 'Probability of &gt;7 consecutive dry days' },
    { id: 'heavyRain', label: t.heavyRainProbability, description: 'Excess precipitation hazard (&gt;65 mm)' },
    { id: 'revival', label: t.revivalProbability, description: 'Monsoon revival and active surge likelihood' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-monsoon-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            <span>{t.navRiskMap}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono font-normal">
              PostGIS 0.05° Grid
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial block-level probability distribution & hazard overlays.
          </p>
        </div>

        <ForecastHorizonSelector />
      </div>

      {/* Centralized Location Selector */}
      <LocationSelector />

      {/* Layer Selection Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Active Layer:</span>
        </div>
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === l.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-monsoon-surface border border-monsoon-border text-slate-300 hover:text-white hover:bg-monsoon-forest'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Map Display */}
      <div className="relative">
        <DynamicMap activeLayer={activeLayer} horizonDays={selectedHorizon} />
      </div>

      {/* Explicit Accessible Legend Required in Section 8 & 33 */}
      <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hazard Classification Standard</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Probability thresholds calibrated with Brier Score optimization against 1979–2025 IMD gridded series.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-600/40">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
            <div>
              <div className="text-[11px] font-bold text-emerald-400">{RISK_LABELS[language].LOW}</div>
              <div className="text-[9px] text-slate-400">&lt; 30% Probability</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
            <div>
              <div className="text-[11px] font-bold text-amber-400">{RISK_LABELS[language].MODERATE}</div>
              <div className="text-[9px] text-slate-400">30%–55% Probability</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-950/60 border border-orange-600/40">
            <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>
            <div>
              <div className="text-[11px] font-bold text-orange-400">{RISK_LABELS[language].ELEVATED}</div>
              <div className="text-[9px] text-slate-400">55%–75% Probability</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-600/40">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
            <div>
              <div className="text-[11px] font-bold text-rose-400">{RISK_LABELS[language].HIGH}</div>
              <div className="text-[9px] text-slate-400">&gt; 75% Probability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
