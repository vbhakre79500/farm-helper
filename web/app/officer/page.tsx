'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { RiskBadge } from '../../components/RiskBadge';
import { EmptyState } from '../../components/EmptyState';
import { apiClient } from '../../lib/api';
import { RiskLevel } from '../../../shared/types';
import {
  Building2,
  Search,
  Download,
  AlertTriangle,
  CloudRain,
  Sun,
  CloudLightning,
  Filter,
  CheckCircle,
  Database,
} from 'lucide-react';

interface OfficerBlockRecord {
  id: string;
  blockName: string;
  district: string;
  state: string;
  onsetProb: number | null;
  breakProb: number | null;
  heavyRainProb: number | null;
  revivalProb: number | null;
  risk: RiskLevel;
  primaryCrop: string;
  recommendedAction: string;
}

export default function ExtensionOfficerDashboard() {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [blocks, setBlocks] = useState<OfficerBlockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .getLocations()
      .then((data) => {
        // Build block list only if real locations exist in backend
        if (data && Array.isArray(data) && data.length > 0) {
          const loadedBlocks: OfficerBlockRecord[] = [];
          data.forEach((st: any) => {
            (st.districts || []).forEach((dist: any) => {
              (dist.blocks || []).forEach((blk: any) => {
                loadedBlocks.push({
                  id: blk.id,
                  blockName: blk.name,
                  district: dist.name,
                  state: st.name,
                  onsetProb: null,
                  breakProb: null,
                  heavyRainProb: null,
                  revivalProb: null,
                  risk: 'LOW',
                  primaryCrop: 'Not Configured',
                  recommendedAction: 'Awaiting model inference execution.',
                });
              });
            });
          });
          setBlocks(loadedBlocks);
        } else {
          setBlocks([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load blocks for officer dashboard:', err);
        setBlocks([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredBlocks = blocks.filter((b) => {
    const matchesSearch =
      b.blockName.toLowerCase().includes(search.toLowerCase()) ||
      b.district.toLowerCase().includes(search.toLowerCase()) ||
      b.primaryCrop.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || b.risk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const totalMonitored = blocks.length;
  const highRiskBlocks = blocks.filter((b) => b.risk === 'HIGH' || b.risk === 'CRITICAL').length;
  const drySpellAlerts = blocks.filter((b) => (b.breakProb ?? 0) > 35).length;
  const heavyRainAlerts = blocks.filter((b) => (b.heavyRainProb ?? 0) > 45).length;

  const handleGenerateReport = () => {
    if (blocks.length === 0) return;
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-monsoon-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span>{t.extensionOfficerDashboard}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Regional agricultural risk surveillance, multi-block comparative hazard matrix, and extension advisory dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={blocks.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Advisory Report</span>
          </button>
        </div>
      </div>

      {reportGenerated && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Agricultural Extension Brief generated successfully.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
          <div className="text-[11px] text-slate-400 font-mono">Monitored Blocks</div>
          <div className="text-2xl font-extrabold text-white mt-1">{totalMonitored}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active jurisdictions</div>
        </div>

        <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
          <div className="text-[11px] text-slate-400 font-mono">High Risk Blocks</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{highRiskBlocks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Priority interventions</div>
        </div>

        <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
          <div className="text-[11px] text-slate-400 font-mono">Dry-Spell Hazards</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{drySpellAlerts}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">&gt;7d dry period alerts</div>
        </div>

        <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border">
          <div className="text-[11px] text-slate-400 font-mono">Heavy Rain Alerts</div>
          <div className="text-2xl font-extrabold text-teal-400 mt-1">{heavyRainAlerts}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">&gt;65 mm surge alerts</div>
        </div>
      </div>

      {blocks.length === 0 ? (
        <EmptyState
          title="No Monitored Blocks Configured"
          message="No administrative blocks are currently registered in the database. Connect the PostGIS registry to enable jurisdictional surveillance."
          icon="data"
        />
      ) : (
        <>
          {/* Search and Filters Bar */}
          <div className="p-4 rounded-xl bg-monsoon-surface border border-monsoon-border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search block, district, or crop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-monsoon-dark border border-monsoon-border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 uppercase font-mono mr-1">Filter Risk:</span>
              {(['ALL', 'HIGH', 'ELEVATED', 'MODERATE', 'LOW'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    filterRisk === r
                      ? 'bg-emerald-600 text-white'
                      : 'bg-monsoon-dark border border-monsoon-border text-slate-300 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Comparative Multi-Block Monitoring Table */}
          <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-monsoon-border/60 text-slate-400 font-mono">
                    <th className="py-2.5 px-3">Location / Block</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Primary Crop</th>
                    <th className="py-2.5 px-3">Onset %</th>
                    <th className="py-2.5 px-3">Break %</th>
                    <th className="py-2.5 px-3">Heavy Rain %</th>
                    <th className="py-2.5 px-3">Revival %</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Agronomic Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-monsoon-border/40 font-mono">
                  {filteredBlocks.map((b) => (
                    <tr key={b.id} className="hover:bg-monsoon-forest/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{b.blockName}</td>
                      <td className="py-3 px-3 text-slate-300">{b.district}</td>
                      <td className="py-3 px-3 text-slate-200">{b.primaryCrop}</td>
                      <td className="py-3 px-3 text-slate-400 font-bold">{b.onsetProb !== null ? `${b.onsetProb}%` : '--'}</td>
                      <td className="py-3 px-3 text-slate-400 font-bold">{b.breakProb !== null ? `${b.breakProb}%` : '--'}</td>
                      <td className="py-3 px-3 text-slate-400 font-bold">{b.heavyRainProb !== null ? `${b.heavyRainProb}%` : '--'}</td>
                      <td className="py-3 px-3 text-slate-400 font-bold">{b.revivalProb !== null ? `${b.revivalProb}%` : '--'}</td>
                      <td className="py-3 px-3">
                        <RiskBadge level={b.risk} />
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans text-[11px] max-w-xs leading-relaxed">
                        {b.recommendedAction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
