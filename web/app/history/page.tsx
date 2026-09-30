'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { LocationSelector } from '../../components/LocationSelector';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { apiClient } from '../../lib/api';
import { HistoricalRainfallRecord } from '../../../shared/types';
import {
  History,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function HistoryPage() {
  const { language, getActiveLocationId } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [history, setHistory] = useState<HistoricalRainfallRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locationId = getActiveLocationId();

  const loadHistory = async () => {
    if (!locationId) {
      setHistory(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient.getHistorical(locationId);
      setHistory(data);
    } catch (e) {
      console.warn('Failed to load history:', e);
      setHistory(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [locationId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-monsoon-border/60">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-teal-400" />
          <span>{t.navHistory}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Long-term climatological rainfall series, onset variability, and historical dry-spell return periods.
        </p>
      </div>

      {/* Location Selector */}
      <LocationSelector />

      {isLoading ? (
        <LoadingSkeleton rows={5} heightClass="h-16" />
      ) : !history || history.length === 0 ? (
        <EmptyState
          title={t.historicalDataUnavailable}
          message="No historical rainfall data is currently available."
          actionText="Retry Historical Database"
          onAction={loadHistory}
        />
      ) : (
        <div className="space-y-6">
          {/* Yearly Historical Rainfall Anomaly Table */}
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-monsoon-border/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Monsoon Seasons (Historical Records)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Verified Archive</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-monsoon-border/60 text-slate-400 font-mono">
                    <th className="py-2 px-3">Year</th>
                    <th className="py-2 px-3">Onset Date</th>
                    <th className="py-2 px-3">Total Rainfall (mm)</th>
                    <th className="py-2 px-3">Normal (mm)</th>
                    <th className="py-2 px-3">Anomaly %</th>
                    <th className="py-2 px-3">Dry Episodes</th>
                    <th className="py-2 px-3">Max Dry Days</th>
                    <th className="py-2 px-3">Surge Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monsoon-border/40 font-mono">
                  {history.map((row) => {
                    const isPositive = row.departurePercentage >= 0;
                    return (
                      <tr key={row.year} className="hover:bg-monsoon-forest/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">{row.year}</td>
                        <td className="py-2.5 px-3 text-slate-300">{row.monsoonOnsetDate}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {row.totalSeasonalRainfallMm.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {row.normalSeasonalRainfallMm.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {row.departurePercentage > 0 ? '+' : ''}{row.departurePercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-amber-400">{row.drySpellEpisodes}</td>
                        <td className="py-2.5 px-3 text-amber-300">{row.maxConsecutiveDryDays}d</td>
                        <td className="py-2.5 px-3 text-rose-300">{row.heavyRainfallDays}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
