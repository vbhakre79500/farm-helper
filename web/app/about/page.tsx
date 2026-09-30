'use client';

import React from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { CloudSunRain, ShieldCheck, MapPin, Cpu, Database } from 'lucide-react';

export default function AboutPage() {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <div className="pb-2 border-b border-monsoon-border/60">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CloudSunRain className="w-6 h-6 text-emerald-400" />
          <span>About {t.appName}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.appTagline}</p>
      </div>

      <div className="p-6 rounded-2xl bg-monsoon-surface border border-monsoon-border space-y-4">
        <h2 className="text-base font-bold text-white">Platform Mission</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          MONSOON-SENSE is an enterprise-grade climate intelligence and agricultural decision-support platform designed to solve the critical sub-seasonal prediction void (7 to 30 days) across Indian rainfed farming ecosystems.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          By bridging planetary teleconnections (ENSO, IOD, MJO) with high-resolution regional downscaling (0.05° PostGIS spatial grid) and deterministic crop phenology models, the platform delivers actionable foresight directly to farmers and agricultural extension officers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
            <Cpu className="w-4 h-4" />
            <span>Explainable AI Principles</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In compliance with agricultural scientific rigor, all machine learning predictions are coupled with local SHAP feature attributions so agricultural officers can inspect physical atmospheric mechanisms before issuing field advisories.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase">
            <Database className="w-4 h-4" />
            <span>Open Data Integration</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The platform interfaces with IMD gridded reanalysis, NOAA Climate Prediction Center teleconnection indices, Australian BoM DMI monitoring, and Copernicus ECMWF ERA5-Land reanalysis.
          </p>
        </div>
      </div>
    </div>
  );
}
