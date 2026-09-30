'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { CROPS_REGISTRY } from '../../../shared/constants';
import { LocationSelector } from '../../components/LocationSelector';
import { ForecastHorizonSelector } from '../../components/ForecastHorizonSelector';
import { RiskBadge } from '../../components/RiskBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { apiClient, CurrentWeather } from '../../lib/api';
import { HyperlocalForecast, AgriculturalAdvisory, MonsoonAlert } from '../../../shared/types';
import {
  CloudRain,
  Sun,
  CloudLightning,
  RefreshCw,
  Gauge,
  Droplets,
  Wind,
  Compass,
  Layers,
  Sprout,
  ArrowRight,
  Sparkles,
  Thermometer,
  Clock,
  Database,
} from 'lucide-react';

export default function FarmerDashboard() {
  const {
    language,
    selectedHorizon,
    selectedCrop,
    setSelectedCropById,
    selectedCropStage,
    setSelectedCropStage,
    getActiveLocationId,
    getActiveLocationName,
    activeCoords,
  } = useAppStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<HyperlocalForecast | null>(null);
  const [advisories, setAdvisories] = useState<AgriculturalAdvisory[] | null>(null);
  const [alerts, setAlerts] = useState<MonsoonAlert[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locationId = getActiveLocationId();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [weatherData, forecastData, advisoryData, alertData] = await Promise.all([
        apiClient.getWeatherCurrent({
          lat: activeCoords?.latitude,
          lon: activeCoords?.longitude,
          locationId,
        }),
        apiClient.getForecast(locationId, selectedHorizon),
        apiClient.getAdvisories(locationId, selectedCrop.id, selectedCropStage),
        apiClient.getAlerts(locationId),
      ]);
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setAdvisories(advisoryData);
      setAlerts(alertData);
    } catch (err) {
      console.warn('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [locationId, selectedHorizon, selectedCrop.id, selectedCropStage, activeCoords?.latitude, activeCoords?.longitude]);

  return (
    <div className="space-y-6">
      {/* Header & Horizon Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-monsoon-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t.farmerDashboard}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {getActiveLocationName()} • Live Meteorological Feed & Outlook
          </p>
        </div>

        <ForecastHorizonSelector />
      </div>

      {/* 4-Level Location Selector */}
      <LocationSelector />

      {/* SECTION: REAL OPERATIONAL CURRENT WEATHER */}
      {currentWeather && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-monsoon-surface to-monsoon-forest/30 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-monsoon-border/50">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Current Ground Weather Observations
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Source: {currentWeather.source}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Updated: {currentWeather.lastUpdated}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Metric: Temperature */}
            <div className="p-3.5 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Temperature</span>
                <Thermometer className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {currentWeather.temperatureCelsius}°C
              </div>
              <div className="text-[10px] text-slate-400 mt-1 capitalize">
                {currentWeather.weatherCondition}
              </div>
            </div>

            {/* Metric: Rainfall */}
            <div className="p-3.5 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Precipitation</span>
                <CloudRain className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">
                {currentWeather.rainfallMm} mm
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Current ground accumulation
              </div>
            </div>

            {/* Metric: Relative Humidity */}
            <div className="p-3.5 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Humidity</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {currentWeather.humidityPct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Surface relative humidity
              </div>
            </div>

            {/* Metric: Wind */}
            <div className="p-3.5 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Wind Speed</span>
                <Wind className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {currentWeather.windSpeedKmph} km/h
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Dir: {currentWeather.windDirectionDeg}°
              </div>
            </div>

            {/* Metric: Surface Pressure */}
            <div className="p-3.5 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Pressure</span>
                <Gauge className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {currentWeather.surfacePressureHpa} hPa
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Barometric surface pressure
              </div>
            </div>

            {/* Metric: Soil Moisture */}
            <div className="p-3.5 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Soil Moisture</span>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">
                {currentWeather.soilMoisture0to7cmPct !== undefined ? `${(currentWeather.soilMoisture0to7cmPct * 100).toFixed(0)}%` : 'Available'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Depth: 0–7 cm rootzone
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PROBABILISTIC FORECAST OUTLOOK */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} rows={2} />
          ))}
        </div>
      ) : !forecast ? (
        <EmptyState
          title={t.noForecastAvailable}
          message="Operational forecast for this specific horizon is currently unavailable. Please select 7 or 14 day horizon."
          actionText="Retry Forecast Query"
          onAction={loadData}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 1: Onset Probability */}
            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold">{t.onsetProbability}</span>
                  <CloudRain className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {forecast.metrics.onsetProbability.value}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Confidence: {forecast.metrics.onsetProbability.confidence}%
                </div>
              </div>
              <div className="pt-3 border-t border-monsoon-border/50 mt-3 flex items-center justify-between">
                <RiskBadge level={forecast.metrics.onsetProbability.risk} />
                <span className="text-[10px] text-slate-400 font-mono">
                  {forecast.metrics.onsetProbability.trend}
                </span>
              </div>
            </div>

            {/* Card 2: Break-Monsoon Probability */}
            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold">{t.breakProbability}</span>
                  <Sun className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {forecast.metrics.breakProbability.value}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Dry Spell Hazard (&gt;5d)
                </div>
              </div>
              <div className="pt-3 border-t border-monsoon-border/50 mt-3 flex items-center justify-between">
                <RiskBadge level={forecast.metrics.breakProbability.risk} />
                <span className="text-[10px] text-slate-400 font-mono">
                  {forecast.metrics.breakProbability.trend}
                </span>
              </div>
            </div>

            {/* Card 3: Heavy Rainfall Probability */}
            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border hover:border-rose-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold">{t.heavyRainProbability}</span>
                  <CloudLightning className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {forecast.metrics.heavyRainProbability.value}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Surge (&gt;64.5 mm / 24h)
                </div>
              </div>
              <div className="pt-3 border-t border-monsoon-border/50 mt-3 flex items-center justify-between">
                <RiskBadge level={forecast.metrics.heavyRainProbability.risk} />
                <span className="text-[10px] text-slate-400 font-mono">
                  {forecast.metrics.heavyRainProbability.trend}
                </span>
              </div>
            </div>

            {/* Card 4: Revival Probability */}
            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border hover:border-teal-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold">{t.revivalProbability}</span>
                  <RefreshCw className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {forecast.metrics.revivalProbability.value}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Post-Break Recovery
                </div>
              </div>
              <div className="pt-3 border-t border-monsoon-border/50 mt-3 flex items-center justify-between">
                <RiskBadge level={forecast.metrics.revivalProbability.risk} />
                <span className="text-[10px] text-slate-400 font-mono">
                  {forecast.metrics.revivalProbability.trend}
                </span>
              </div>
            </div>

            {/* Card 5: Overall Confidence */}
            <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold">{t.forecastConfidence}</span>
                  <Gauge className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                  {forecast.confidenceScore}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Ensemble Agreement
                </div>
              </div>
              <div className="pt-3 border-t border-monsoon-border/50 mt-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-300">Composite Risk</span>
                <RiskBadge level={forecast.overallRisk} />
              </div>
            </div>
          </div>

          {/* RAINFALL OUTLOOK BANNER */}
          <div className="p-5 rounded-xl bg-monsoon-forest/40 border border-monsoon-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-monsoon-surface border border-monsoon-border flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs uppercase font-mono text-emerald-400 font-semibold">
                  {selectedHorizon}-Day Quantitative Outlook
                </div>
                <div className="text-lg font-bold text-white mt-0.5">
                  Expected Cumulative Rainfall: {forecast.rainfallOutlook.expectedMm} mm
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Historical Normal: {forecast.rainfallOutlook.normalMm} mm (Anomaly: {forecast.rainfallOutlook.anomalyPercentage > 0 ? '+' : ''}{forecast.rainfallOutlook.anomalyPercentage}%)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs border-t md:border-t-0 md:border-l border-monsoon-border/60 pt-3 md:pt-0 md:pl-6">
              <div>
                <div className="text-slate-400 text-[10px] uppercase">Rainy Days</div>
                <div className="text-base font-bold text-emerald-400">{forecast.rainfallOutlook.rainyDaysExpected} days</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase">Max Dry Days</div>
                <div className="text-base font-bold text-amber-400">{forecast.rainfallOutlook.consecutiveDryDaysExpected} days</div>
              </div>
            </div>
          </div>

          {/* CROP ADVISORY QUICK SECTION */}
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-monsoon-border/60">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Field Decision Support for {selectedCrop.name}
                </h2>
              </div>

              {/* Crop & Stage Dropdowns */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCrop.id}
                  onChange={(e) => setSelectedCropById(e.target.value)}
                  className="bg-monsoon-dark border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  {CROPS_REGISTRY.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCropStage}
                  onChange={(e) => setSelectedCropStage(e.target.value as any)}
                  className="bg-monsoon-dark border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  {selectedCrop.stages.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advisory Cards */}
            {!advisories || advisories.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">{t.noActiveAdvisories}</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {advisories.slice(0, 2).map((adv) => (
                  <div
                    key={adv.id}
                    className="p-4 rounded-lg bg-monsoon-dark/80 border border-monsoon-border/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase font-semibold text-emerald-400">
                        {adv.category}
                      </span>
                      <RiskBadge level={adv.riskLevel} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{adv.recommendedAction}</div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {adv.scientificReason}
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-monsoon-border/40 flex justify-between">
                      <span>Window: {adv.forecastPeriod}</span>
                      <span>Ref: {adv.ruleReference}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Link
                href="/advisories"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1.5"
              >
                <span>View Complete Agricultural Advisory Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* EXPLAINABILITY PEEK */}
          <div className="p-4 rounded-xl bg-monsoon-surface/60 border border-monsoon-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">{t.whyThisPrediction}</div>
                <div className="text-[11px] text-slate-400">
                  SHAP feature attribution: Coupled equatorial MJO convective pulse & low-level moisture convergence.
                </div>
              </div>
            </div>
            <Link
              href="/forecast"
              className="text-xs px-3 py-1.5 rounded-lg bg-monsoon-surface border border-monsoon-border text-slate-300 hover:text-white font-medium self-start sm:self-auto shrink-0"
            >
              Examine Full Model Attribution
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
