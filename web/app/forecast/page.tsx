'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { LocationSelector } from '../../components/LocationSelector';
import { ForecastHorizonSelector } from '../../components/ForecastHorizonSelector';
import { RiskBadge } from '../../components/RiskBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { apiClient } from '../../lib/api';
import { HyperlocalForecast } from '../../../shared/types';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles,
  Info,
  Droplets,
  CloudRain,
  Sun,
  CloudLightning,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function ForecastPage() {
  const { language, selectedHorizon, getActiveLocationId } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [forecast, setForecast] = useState<HyperlocalForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locationId = getActiveLocationId();

  const loadForecast = async () => {
    if (!locationId) {
      setForecast(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient.getForecast(locationId, selectedHorizon);
      setForecast(data);
    } catch (e) {
      console.warn('Forecast fetch failed:', e);
      setForecast(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [locationId, selectedHorizon]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-monsoon-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>7–30 Day Monsoon Outlook</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono font-normal">
              Sub-Seasonal
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Probabilistic rainfall trajectories, dry spell hazards, and physical feature attribution.
          </p>
        </div>

        <ForecastHorizonSelector />
      </div>

      {/* Location Selector */}
      <LocationSelector />

      {isLoading ? (
        <LoadingSkeleton rows={6} heightClass="h-12" />
      ) : !forecast ? (
        <EmptyState
          title={selectedHorizon > 14 ? "Extended prediction unavailable" : t.noForecastAvailable}
          message={
            selectedHorizon > 14
              ? "Extended 21/30-day sub-seasonal weather prediction is currently unavailable without a long-range coupled ocean-atmosphere dynamical model. Please select 7 or 14 day horizon for operational numerical forecasts."
              : t.dataUnavailable
          }
          actionText={selectedHorizon > 14 ? "Switch to 14-Day Forecast" : "Retry Forecast Engine"}
          onAction={loadForecast}
        />
      ) : (
        <div className="space-y-6">
          {/* Metadata Banner Required in Section 9 */}
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400">Forecast Horizon: </span>
                <strong className="text-emerald-400">{forecast.horizonDays} Days</strong>
              </div>
              <div className="hidden sm:block text-slate-600">|</div>
              <div>
                <span className="text-slate-400">Model: </span>
                <span className="text-slate-200">{forecast.modelIdentifier}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Run: {forecast.dataTimestamp}</span>
              </div>
              <RiskBadge level={forecast.overallRisk} />
            </div>
          </div>

          {/* Probability Progression Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-monsoon-forest/40 border border-monsoon-border">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold">{t.onsetProbability}</span>
                <CloudRain className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {forecast.metrics.onsetProbability.value}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {forecast.metrics.onsetProbability.description}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-monsoon-forest/40 border border-monsoon-border">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold">{t.breakProbability}</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-2">
                {forecast.metrics.breakProbability.value}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {forecast.metrics.breakProbability.description}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-monsoon-forest/40 border border-monsoon-border">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold">{t.heavyRainProbability}</span>
                <CloudLightning className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-2">
                {forecast.metrics.heavyRainProbability.value}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {forecast.metrics.heavyRainProbability.description}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-monsoon-forest/40 border border-monsoon-border">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold">{t.revivalProbability}</span>
                <RefreshCw className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-teal-400 mt-2">
                {forecast.metrics.revivalProbability.value}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {forecast.metrics.revivalProbability.description}
              </div>
            </div>
          </div>

          {/* Daily Precipitation & Phase Timeline */}
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Quantitative Daily Precipitation Timeline ({forecast.horizonDays} Days)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Total: {forecast.rainfallOutlook.expectedMm} mm
              </span>
            </div>

            {/* Clean SVG/CSS Bar Chart with Actual Daily Outlook Records */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 text-center">
                {forecast.dailyTimeline.slice(0, forecast.horizonDays).map((day, idx) => {
                  const maxMm = 40;
                  const barHeightPct = Math.min(100, Math.max(10, (day.rainfallMm / maxMm) * 100));

                  return (
                    <div
                      key={day.dayIndex}
                      className="p-2 rounded-lg bg-monsoon-dark/80 border border-monsoon-border/60 flex flex-col justify-between items-center h-32 hover:border-emerald-500/60 transition-colors"
                      title={`${day.date}: ${day.rainfallMm} mm, PoP: ${day.probabilityOfPrecipitation}%, Phase: ${day.monsoonPhase}`}
                    >
                      <div className="text-[10px] text-slate-400 font-mono">
                        D+{day.dayIndex}
                      </div>

                      {/* Bar */}
                      <div className="w-full flex items-end justify-center h-16 my-1">
                        <div
                          className={`w-4 rounded-t transition-all ${
                            day.rainfallMm > 20
                              ? 'bg-rose-500'
                              : day.rainfallMm > 5
                              ? 'bg-emerald-500'
                              : day.rainfallMm > 0
                              ? 'bg-teal-600'
                              : 'bg-slate-700'
                          }`}
                          style={{ height: `${barHeightPct}%` }}
                        />
                      </div>

                      <div className="text-[10px] font-mono font-bold text-slate-200">
                        {day.rainfallMm.toFixed(1)}m
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-mono">
                        {day.monsoonPhase.slice(0, 4)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* EXPLAINABLE PREDICTION / SHAP PANEL Required in Section 10 & 17 */}
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.whyThisPrediction}
                </h2>
                <p className="text-xs text-slate-400">
                  SHAP (SHapley Additive exPlanations) attribution weights quantifying physical driver impact on this forecast.
                </p>
              </div>
            </div>

            {forecast.contributingFactors.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Prediction explanation unavailable.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3 pt-2">
                {forecast.contributingFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-monsoon-dark/80 border border-monsoon-border/70 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">{factor.factor}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          factor.impact === 'positive'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : factor.impact === 'negative'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        SHAP: {factor.shapValue > 0 ? '+' : ''}{factor.shapValue.toFixed(2)} ({factor.weightPct}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {factor.explanation}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-monsoon-border/40 uppercase">
                      Category: {factor.category.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
