'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { apiClient } from '../../lib/api';
import { ClimateSignalData } from '../../../shared/types';
import {
  Radio,
  TrendingUp,
  Activity,
  Calendar,
  Database,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function ClimateSignalsPage() {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [signals, setSignals] = useState<ClimateSignalData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSignals = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getClimateSignals();
      setSignals(data);
    } catch (e) {
      console.error('Failed to load climate signals:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-monsoon-border/60">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Radio className="w-6 h-6 text-amber-400" />
          <span>{t.navClimateSignals}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 font-mono font-normal">
            Planetary Teleconnections
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time tracking of coupled planetary ocean-atmosphere modes governing South Asian monsoon circulation.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} heightClass="h-20" />
      ) : !signals || signals.length === 0 ? (
        <EmptyState
          title={t.climateSignalUnavailable}
          message={t.dataUnavailable}
          actionText="Query Climate Providers"
          onAction={loadSignals}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {signals.map((sig) => {
              const isFavorable = sig.influenceRating === 'favorable';
              const isNeutral = sig.influenceRating === 'neutral';

              return (
                <div
                  key={sig.signalType}
                  className="p-5 rounded-2xl bg-monsoon-surface border border-monsoon-border hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-md"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-monsoon-border/50">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {sig.signalType}
                        </span>
                        <h2 className="text-sm font-bold text-white mt-0.5">{sig.name}</h2>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          sig.status === 'unavailable'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : isFavorable
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : isNeutral
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {sig.status === 'unavailable' ? 'Unavailable' : sig.influenceRating}
                      </span>
                    </div>

                    {/* Numerical Value & Phase */}
                    <div className="mt-3">
                      <div className="text-[11px] text-slate-400">Observed Value / Phase</div>
                      <div className="text-xl font-bold text-white tracking-tight mt-0.5">
                        {sig.currentValue || 'Current data unavailable'}
                      </div>
                      {sig.phaseOrState && (
                        <div className="text-xs font-medium text-emerald-400 mt-1">
                          State: {sig.phaseOrState}
                        </div>
                      )}
                    </div>

                    {/* Trend & Influence */}
                    <div className="mt-4 p-3 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/60 space-y-2">
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-slate-200">Monsoon Influence: </span>
                        {sig.monsoonInfluence || 'Awaiting telemetry feed from configured climate center.'}
                      </div>
                      {sig.trend && (
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Trend: <strong className="text-slate-200 capitalize">{sig.trend}</strong></span>
                          {sig.historicalBaseline && <span>Baseline: {sig.historicalBaseline}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-2 border-t border-monsoon-border/40 text-[10px] text-slate-400 font-mono space-y-1">
                    <div className="flex justify-between">
                      <span>Source: {sig.dataSource}</span>
                      <span>{sig.dataFreshness || 'Feed unconfigured'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Observation: {sig.observationDate || 'No record'}</span>
                      <span className={sig.status === 'unavailable' ? 'text-amber-400' : 'text-emerald-400'}>
                        ● {sig.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scientific Mechanics Box */}
          <div className="p-5 rounded-2xl bg-monsoon-forest/40 border border-monsoon-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Info className="w-4 h-4" />
              <span>Coupled Meteorological Mechanics</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Global teleconnections act as the macroscopic boundaries within which local atmospheric instabilities develop. While ENSO (Niño 3.4 SST) sets the seasonal thermodynamic background and IOD modulates the cross-equatorial Somali jet, the sub-seasonal Madden–Julian Oscillation (MJO) modulates 30–60 day active-break cycles. When MJO passes through Phases 2, 3, or 4 over the Indian Ocean with amplitude &gt; 1.0, deep convective clouds are energized, drastically reducing break-monsoon probabilities across central agricultural corridors.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
