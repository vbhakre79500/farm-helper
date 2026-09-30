'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '../store/locationStore';
import { TRANSLATIONS } from '../../shared/translations';
import {
  CloudSunRain,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Sprout,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  CheckCircle,
  BarChart3,
  Calendar,
  Compass,
} from 'lucide-react';

export default function LandingPage() {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-monsoon-forest to-monsoon-dark border border-monsoon-border p-6 md:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-medium">
            System Architecture & Decision Support Framework
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Know the Monsoon.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 block">
              Plan Before It Changes.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {t.heroSubheading}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-900/30 transition-all"
            >
              <span>{t.exploreDashboard}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/risk-map"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-monsoon-surface hover:bg-monsoon-pine border border-monsoon-border text-slate-200 hover:text-white font-semibold text-sm transition-all"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{t.viewRiskMap}</span>
            </Link>
          </div>
        </div>

        {/* Hero Data Preview Cards */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-monsoon-surface/90 border border-monsoon-border/70 backdrop-blur-sm">
            <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Spatial Scale</div>
            <div className="text-base font-bold text-emerald-400 mt-1">Block / Panchayat</div>
            <div className="text-[11px] text-slate-400 mt-0.5">~5 km Downscaling Grid</div>
          </div>
          <div className="p-3.5 rounded-xl bg-monsoon-surface/90 border border-monsoon-border/70 backdrop-blur-sm">
            <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Lead Horizon</div>
            <div className="text-base font-bold text-teal-400 mt-1">7 to 30 Days</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Probabilistic Outlook</div>
          </div>
          <div className="p-3.5 rounded-xl bg-monsoon-surface/90 border border-monsoon-border/70 backdrop-blur-sm">
            <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Climate Teleconnections</div>
            <div className="text-base font-bold text-amber-400 mt-1">ENSO • IOD • MJO</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Physical Drivers Coupled</div>
          </div>
          <div className="p-3.5 rounded-xl bg-monsoon-surface/90 border border-monsoon-border/70 backdrop-blur-sm">
            <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Actionability</div>
            <div className="text-base font-bold text-emerald-300 mt-1">Agronomic Rules</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Crop Stage Specific</div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THE PROBLEM */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
          <ShieldAlert className="w-4 h-4" />
          <span>The Agricultural Challenge</span>
        </div>
        <h2 className="text-2xl font-bold text-white">The Sub-Seasonal Monsoon Prediction Gap</h2>
        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border/70">
            <div className="text-rose-400 text-sm font-semibold mb-2">District-Averaged Dilution</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard meteorological advisories provide district-wide rainfall estimates. A single district often spans 8,000+ km² with extreme internal variation where one block suffers an acute 14-day dry spell while an adjacent block experiences waterlogging.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border/70">
            <div className="text-amber-400 text-sm font-semibold mb-2">The 10–25 Day Prediction Void</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Numerical weather prediction (NWP) loses deterministic skill past 5–7 days, while seasonal forecasts are too coarse to guide timely sowing or emergency irrigation decisions. Farmers are left vulnerable during critical crop growth windows.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border/70">
            <div className="text-emerald-400 text-sm font-semibold mb-2">Disconnected Climate Signals</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Global teleconnection signals (such as MJO convective phases or IOD transitions) are rarely translated into block-level soil moisture and rainfall hazard advisories accessible to farmers and extension workers.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3: OUR SOLUTION & HOW IT WORKS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <Cpu className="w-4 h-4" />
          <span>The MONSOON-SENSE Architecture</span>
        </div>
        <h2 className="text-2xl font-bold text-white">From Planetary Teleconnections to Village Fields</h2>
        
        {/* The 5-stage pipeline requested in Section 11 & 26 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-monsoon-forest/50 border border-monsoon-border relative">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 01</span>
            <h3 className="text-xs font-bold text-white mt-1 mb-2">Global Climate Signals</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Real-time integration of ENSO Nino 3.4 SST, BoM Indian Ocean Dipole (DMI), and Wheeler-Hendon MJO Phase 1–8.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-monsoon-forest/50 border border-monsoon-border relative">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 02</span>
            <h3 className="text-xs font-bold text-white mt-1 mb-2">Regional & Satellite Ingestion</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              IMD 0.25° gridded observations, ERA5-Land reanalysis, 850hPa wind vectors, humidity, and elevation topography.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-monsoon-forest/50 border border-monsoon-border relative">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 03</span>
            <h3 className="text-xs font-bold text-white mt-1 mb-2">Hybrid ML & Calibration</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Calibrated XGBoost & LightGBM hazard models combined with historical analogue matching and spatial downscaling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-monsoon-forest/50 border border-monsoon-border relative">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 04</span>
            <h3 className="text-xs font-bold text-white mt-1 mb-2">Block / Village Probabilities</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Probabilistic onset timing, dry spell hazard (&gt;7 consecutive dry days), heavy rainfall surges, and monsoon revival.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-monsoon-forest/50 border border-monsoon-border relative">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 05</span>
            <h3 className="text-xs font-bold text-white mt-1 mb-2">Agronomic Advisory Engine</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Deterministic agronomic rules linking lead-time hazard to sowing, protective irrigation, drainage, and fertilizer decisions.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: CLIMATE INTELLIGENCE & HYPERLOCAL MAPPING */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-monsoon-surface border border-monsoon-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <TrendingUp className="w-4 h-4" />
            <span>Sub-Seasonal Teleconnections</span>
          </div>
          <h3 className="text-lg font-bold text-white">Coupled Planetary Climate Signals</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The South Asian Summer Monsoon is governed by planetary-scale heat sources. Rather than treating local weather as an isolated statistical series, MONSOON-SENSE tracks the Pacific Walker circulation (ENSO), the equatorial Indian Ocean Dipole (IOD), and the eastward-propagating Madden–Julian Oscillation (MJO) convective envelope.
          </p>
          <div className="pt-2">
            <Link
              href="/climate-signals"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Explore Climate Signal Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-monsoon-surface border border-monsoon-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <MapPin className="w-4 h-4" />
            <span>PostGIS Geospatial Grid</span>
          </div>
          <h3 className="text-lg font-bold text-white">Interactive Hyperlocal Risk Map</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Interactive polygon-level exploration across States, Districts, Blocks, and Gram Panchayats. Switch seamlessly between Onset Isochrones, Break-Monsoon hazard zones, Heavy Rainfall alerts, and composite Agricultural Risk indices.
          </p>
          <div className="pt-2">
            <Link
              href="/risk-map"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Open Geospatial Risk Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: CROPS & ADVISORY ENGINE */}
      <section className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-monsoon-forest/60 to-monsoon-surface border border-monsoon-border space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <Sprout className="w-4 h-4" />
          <span>Actionable Agricultural Decision Support</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white">
          Crop-Specific Agronomic Rules Tailored to Monsoon Horizons
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Prediction without agronomic translation leaves farmers uncertain. The MONSOON-SENSE Advisory Engine couples probabilistic precipitation outlooks with growth stages for key rainfed crops: Soybean, Cotton, Rice (Paddy), Maize, Pulses (Arhar), Groundnut, and Wheat.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {['Soybean', 'Cotton', 'Rice (Paddy)', 'Pulses / Arhar'].map((crop) => (
            <div key={crop} className="px-3.5 py-2.5 rounded-lg bg-monsoon-dark/80 border border-monsoon-border/60 text-xs font-medium text-slate-200 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{crop}</span>
            </div>
          ))}
        </div>
        <div className="pt-3">
          <Link
            href="/advisories"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            <span>Explore Crop Advisory Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* SECTION 6: PRODUCT ARCHITECTURE TARGETS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">System Architecture & Technical Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
            <div className="text-xs text-slate-400 font-mono">Spatial Downscaling Target</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">0.05° (~5 km)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Block/Panchayat resolution</div>
          </div>
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
            <div className="text-xs text-slate-400 font-mono">Forecast Horizon</div>
            <div className="text-xl font-bold text-teal-400 mt-1">7–30 Days</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sub-seasonal probabilistic window</div>
          </div>
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
            <div className="text-xs text-slate-400 font-mono">Coupled Signals</div>
            <div className="text-xl font-bold text-amber-400 mt-1">ENSO • IOD • MJO</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Physical teleconnections</div>
          </div>
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
            <div className="text-xs text-slate-400 font-mono">Decision Engine</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">Deterministic Rules</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Crop stage specific logic</div>
          </div>
        </div>
      </section>
    </div>
  );
}
