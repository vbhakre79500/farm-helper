'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { CROPS_REGISTRY } from '../../../shared/constants';
import { LocationSelector } from '../../components/LocationSelector';
import { ForecastHorizonSelector } from '../../components/ForecastHorizonSelector';
import { RiskBadge } from '../../components/RiskBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { apiClient } from '../../lib/api';
import { AgriculturalAdvisory, CropStage, AdvisoryCategory } from '../../../shared/types';
import {
  FileCheck2,
  Sprout,
  Filter,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';

export default function AdvisoriesPage() {
  const {
    language,
    getActiveLocationId,
    selectedCrop,
    setSelectedCropById,
    selectedCropStage,
    setSelectedCropStage,
    selectedHorizon,
  } = useAppStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [advisories, setAdvisories] = useState<AgriculturalAdvisory[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AdvisoryCategory | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const locationId = getActiveLocationId();

  const loadAdvisories = async () => {
    if (!locationId) {
      setAdvisories(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient.getAdvisories(locationId, selectedCrop.id, selectedCropStage);
      setAdvisories(data);
    } catch (e) {
      console.warn('Failed to load advisories:', e);
      setAdvisories(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisories();
  }, [locationId, selectedCrop.id, selectedCropStage, selectedHorizon]);

  const categories: AdvisoryCategory[] = [
    'Sowing',
    'Irrigation',
    'Fertilizer',
    'Drainage',
    'Crop Protection',
    'Harvest Planning',
    'Dry-Spell Preparedness',
    'Heavy-Rain Preparedness',
  ];

  const filteredAdvisories = advisories?.filter(
    (a) => selectedCategory === 'ALL' || a.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-monsoon-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            <span>{t.navAdvisories}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono font-normal">
              Agronomic Rules Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic agricultural decision support linking sub-seasonal monsoon hazard with crop phenology.
          </p>
        </div>

        <ForecastHorizonSelector />
      </div>

      {/* Location Selector */}
      <LocationSelector />

      {/* Crop & Growth Stage Filter Panel */}
      <div className="p-4 rounded-xl bg-monsoon-forest/60 border border-monsoon-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <label htmlFor="crop-select" className="text-xs font-semibold text-slate-200">
              Target Crop:
            </label>
            <select
              id="crop-select"
              value={selectedCrop.id}
              onChange={(e) => setSelectedCropById(e.target.value)}
              className="bg-monsoon-dark border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {CROPS_REGISTRY.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.season})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="stage-select" className="text-xs font-semibold text-slate-200">
              Crop Stage:
            </label>
            <select
              id="stage-select"
              value={selectedCropStage}
              onChange={(e) => setSelectedCropStage(e.target.value as CropStage)}
              className="bg-monsoon-dark border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {selectedCrop.stages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
          <span>Waterlogging: <strong className="text-slate-200">{selectedCrop.waterloggingSensitivity}</strong></span>
          <span>Max Dry Days: <strong className="text-amber-400">{selectedCrop.criticalDrySpellToleranceDays}d</strong></span>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-emerald-600 text-white'
              : 'bg-monsoon-surface border border-monsoon-border text-slate-300 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-monsoon-surface border border-monsoon-border text-slate-300 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Advisory Cards Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={4} heightClass="h-24" />
      ) : !filteredAdvisories || filteredAdvisories.length === 0 ? (
        <EmptyState
          title={t.noActiveAdvisories}
          message="No active warnings or specific agronomic interventions required for the selected crop stage under currently predicted moisture regimes."
          actionText="Reload Agronomic Engine"
          onAction={loadAdvisories}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAdvisories.map((adv) => (
            <div
              key={adv.id}
              className="p-5 rounded-2xl bg-monsoon-surface border border-monsoon-border hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-monsoon-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      {adv.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {adv.cropName} ({adv.cropStage})
                    </span>
                  </div>
                  <RiskBadge level={adv.riskLevel} />
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {t.recommendedAction}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5 leading-snug">
                    {adv.recommendedAction}
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-monsoon-dark/80 border border-monsoon-border/60">
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase font-mono">
                    {t.scientificReason}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {adv.scientificReason}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-monsoon-border/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Window: <strong className="text-slate-200">{adv.forecastPeriod}</strong></span>
                <span>Rule: <strong className="text-slate-300">{adv.ruleReference}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
