'use client';

import React from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import {
  Radio,
  Database,
  Cpu,
  MapPin,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowDown,
} from 'lucide-react';

export default function HowItWorksPage() {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const pipelineStages = [
    {
      step: '01',
      title: 'Global Climate Signals',
      icon: Radio,
      items: [
        'ENSO Oceanic Niño Index (Niño 3.4 SST anomalies)',
        'Indian Ocean Dipole (Dipole Mode Index - DMI)',
        'Madden–Julian Oscillation (RMM Phase 1–8 & Amplitude)',
      ],
      description:
        'Captures planetary ocean-atmosphere energy exchanges and convective envelopes that dictate sub-seasonal active and break phases.',
    },
    {
      step: '02',
      title: 'Multi-Source Regional & Satellite Data',
      icon: Database,
      items: [
        'IMD 0.25° gridded daily precipitation & temperature',
        'Copernicus ERA5-Land reanalysis (surface moisture, 850hPa wind shear)',
        'SRTM 30m Digital Elevation Model (DEM) and terrain aspect',
      ],
      description:
        'Fuses satellite soil moisture, orographic barriers, and atmospheric dynamics into spatially consistent temporal grids.',
    },
    {
      step: '03',
      title: 'Hybrid ML & Statistical Downscaling',
      icon: Cpu,
      items: [
        'Extreme Gradient Boosting (XGBoost) for non-linear precipitation hazards',
        'LightGBM Onset Isochrone progression tracker',
        'Kernel SHAP explainability attributing individual physical feature weights',
      ],
      description:
        'Calibrates probabilistic hazard estimates against 46 years of gridded ground truth with continuous Brier score minimization.',
    },
    {
      step: '04',
      title: 'Hyperlocal Block & Panchayat Predictions',
      icon: MapPin,
      items: [
        '7-to-30 day probabilistic onset, dry spell, and heavy rainfall outlooks',
        'Spatial downscaling to 0.05° (~5 km) resolution',
        'Confidence interval bounds and ensemble agreement scoring',
      ],
      description:
        'Resolves localized intra-district microclimates where neighboring blocks experience divergent rainfall trajectories.',
    },
    {
      step: '05',
      title: 'Deterministic Agronomic Advisory Engine',
      icon: Sprout,
      items: [
        'Crop-stage specific physiological thresholds (Soybean, Cotton, Rice, etc.)',
        'Actionable guidance: Sowing windows, emergency drainage, supplemental irrigation',
        'Multi-lingual translation in English, Hindi, and Marathi',
      ],
      description:
        'Converts complex meteorological probabilities into plain-language, transparent agricultural action recommendations.',
    },
  ];

  const challenges = [
    {
      challenge: 'Sub-Seasonal Forecast Uncertainty',
      mitigation:
        'Probabilistic formulation rather than binary predictions, accompanied by explicit ensemble confidence scores and Brier calibration.',
    },
    {
      challenge: 'Regional Data Latency & Gaps',
      mitigation:
        'Multi-source data fusion combining near-real-time satellite reanalysis (ERA5) with IMD automated surface telemetry.',
    },
    {
      challenge: 'High Spatial Variability & Microclimates',
      mitigation:
        'Topographically aware downscaling using elevation models, slope, and historical local rainfall analogues.',
    },
    {
      challenge: 'Climate Non-Stationarity & Warming Trends',
      mitigation:
        'Coupling macro-scale ocean teleconnections (ENSO/IOD) with continuous re-training against recent decadal climate shifts.',
    },
    {
      challenge: 'Grassroots Usability for Smallholder Farmers',
      mitigation:
        'Simplified local-language agronomic directives (Hindi/Marathi) paired with multi-channel broadcast adapters (SMS/WhatsApp).',
    },
  ];

  return (
    <div className="space-y-12 pb-10">
      {/* Header */}
      <div className="pb-2 border-b border-monsoon-border/60">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-emerald-400" />
          <span>Scientific Methodology & Architecture</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          How MONSOON-SENSE bridges planetary teleconnections, regional downscaling, and village-scale agronomy.
        </p>
      </div>

      {/* 5-STAGE PROCESSING PIPELINE */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <span>End-to-End Processing Chain</span>
        </div>

        <div className="space-y-4">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="p-5 rounded-2xl bg-monsoon-surface border border-monsoon-border hover:border-emerald-500/50 transition-all flex flex-col md:flex-row gap-5"
              >
                <div className="flex md:flex-col items-center justify-between md:justify-center md:w-28 shrink-0 pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-monsoon-border/60">
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {stage.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-monsoon-forest flex items-center justify-center text-emerald-300 md:mt-2">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h2 className="text-base font-bold text-white">{stage.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{stage.description}</p>
                  <div className="grid sm:grid-cols-3 gap-2 pt-2">
                    {stage.items.map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-monsoon-dark/80 border border-monsoon-border/60 text-[11px] text-slate-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEASIBILITY & TECHNICAL PILLARS */}
      <section className="p-6 rounded-2xl bg-monsoon-forest/30 border border-monsoon-border space-y-4">
        <h2 className="text-lg font-bold text-white">System Feasibility & Scalability</h2>
        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border/70 space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase">Software-First Deployment</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Does not require costly physical IoT sensor deployment in every village. Leverages high-resolution satellite constellations and gridded meteorological reanalysis.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border/70 space-y-2">
            <h3 className="text-xs font-bold text-teal-400 uppercase">PostGIS Spatial Scaling</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Spatial indexing allows rapid polygon queries across hundreds of districts and tens of thousands of Gram Panchayats with sub-100ms API latency.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border/70 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase">Modular Machine Learning</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Model pipelines are containerized and decouple statistical inference from frontend rendering, enabling continuous algorithmic improvements without UI changes.
            </p>
          </div>
        </div>
      </section>

      {/* CHALLENGES & MITIGATIONS Required in Section 28 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Challenges & Engineered Mitigations</span>
        </div>
        <h2 className="text-lg font-bold text-white">Rigorous Technical Risk Management</h2>

        <div className="space-y-2.5 pt-2">
          {challenges.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="font-semibold text-rose-300 sm:w-1/3 shrink-0">
                {c.challenge}
              </div>
              <div className="text-slate-300 sm:w-2/3 leading-relaxed">
                <span className="font-semibold text-emerald-400">Mitigation: </span>
                {c.mitigation}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
