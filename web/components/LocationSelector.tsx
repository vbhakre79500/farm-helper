'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/locationStore';
import { TRANSLATIONS } from '../../shared/translations';
import { apiClient } from '../lib/api';
import { MapPin, Mountain, Compass, Database, RefreshCw, AlertCircle } from 'lucide-react';

interface LocationSelectorProps {
  compact?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ compact = false }) => {
  const {
    language,
    states,
    setStates,
    selectedState,
    selectedDistrict,
    selectedBlock,
    selectedPanchayat,
    setStateById,
    setDistrictById,
    setBlockById,
    setPanchayatById,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getLocations();
      if (data && Array.isArray(data) && data.length > 0) {
        setStates(data);
        setError(null);
      } else if (data && Array.isArray(data) && data.length === 0) {
        setError('No administrative locations returned by registry.');
      } else {
        setError('Failed to load administrative locations from API.');
      }
    } catch (err: any) {
      console.error('Failed to load administrative locations:', err);
      setError(err?.message || 'Network error connecting to administrative location registry.');
    } finally {
      setLoading(false);
    }
  }, [setStates]);

  useEffect(() => {
    if (states.length === 0) {
      loadLocations();
    }
  }, [states.length, loadLocations]);

  const currentDistricts = selectedState ? selectedState.districts : [];
  const currentBlocks = selectedDistrict ? selectedDistrict.blocks : [];
  const currentPanchayats = selectedBlock ? selectedBlock.panchayats : [];

  if (loading) {
    return (
      <div className="bg-monsoon-forest/50 border border-monsoon-border/60 rounded-xl p-3.5 flex items-center gap-2 text-xs text-slate-300">
        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
        <span>Loading configured administrative locations from registry...</span>
      </div>
    );
  }

  if (error && states.length === 0) {
    return (
      <div className="bg-monsoon-forest/40 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Location Registry Error: {error}</span>
        </div>
        <button
          onClick={() => loadLocations()}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 rounded-lg text-[11px] font-medium text-amber-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  if (states.length === 0) {
    return (
      <div className="bg-monsoon-forest/40 border border-monsoon-border/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          <span>Geographic Registry: No administrative locations currently configured in database.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-monsoon-forest/70 border border-monsoon-border/60 rounded-xl p-3.5 backdrop-blur-sm shadow-md">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-monsoon-border/40">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>{t.selectLocation}</span>
        </div>
        {selectedPanchayat && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              {selectedPanchayat.latitude.toFixed(3)}°N, {selectedPanchayat.longitude.toFixed(3)}°E
            </span>
            <span className="flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-slate-500" />
              {selectedPanchayat.elevationMeters ?? 360}m MSL
            </span>
          </div>
        )}
      </div>

      <div className={`grid gap-2.5 ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* State */}
        <div>
          <label htmlFor="state-select" className="block text-[11px] font-medium text-slate-300 mb-1">
            {t.state}
          </label>
          <select
            id="state-select"
            value={selectedState?.id || ''}
            onChange={(e) => setStateById(e.target.value)}
            className="w-full bg-monsoon-dark/90 border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label htmlFor="district-select" className="block text-[11px] font-medium text-slate-300 mb-1">
            {t.district}
          </label>
          <select
            id="district-select"
            value={selectedDistrict?.id || ''}
            onChange={(e) => setDistrictById(e.target.value)}
            className="w-full bg-monsoon-dark/90 border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {currentDistricts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Block */}
        <div>
          <label htmlFor="block-select" className="block text-[11px] font-medium text-slate-300 mb-1">
            {t.block}
          </label>
          <select
            id="block-select"
            value={selectedBlock?.id || ''}
            onChange={(e) => setBlockById(e.target.value)}
            className="w-full bg-monsoon-dark/90 border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {currentBlocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Panchayat */}
        <div>
          <label htmlFor="panchayat-select" className="block text-[11px] font-medium text-slate-300 mb-1">
            {t.panchayat}
          </label>
          <select
            id="panchayat-select"
            value={selectedPanchayat?.id || ''}
            onChange={(e) => setPanchayatById(e.target.value)}
            className="w-full bg-monsoon-dark/90 border border-monsoon-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {currentPanchayats.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
