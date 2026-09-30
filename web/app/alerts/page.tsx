'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { LocationSelector } from '../../components/LocationSelector';
import { RiskBadge } from '../../components/RiskBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { apiClient } from '../../lib/api';
import { MonsoonAlert, RiskLevel } from '../../../shared/types';
import {
  AlertTriangle,
  Send,
  MessageSquare,
  Smartphone,
  Bell,
  CheckCircle,
  Filter,
} from 'lucide-react';

export default function AlertsPage() {
  const { language, getActiveLocationId } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [alerts, setAlerts] = useState<MonsoonAlert[] | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<RiskLevel | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [disseminationNotice, setDisseminationNotice] = useState<string | null>(null);

  const locationId = getActiveLocationId();

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAlerts(locationId || undefined);
      setAlerts(data);
    } catch (e) {
      console.warn('Failed to load alerts:', e);
      setAlerts(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [locationId]);

  const handleSimulateDissemination = (alert: MonsoonAlert, channel: string) => {
    setDisseminationNotice(
      `Dissemination adapter triggered for "${alert.title}" via ${channel}. Message queued for block-registered recipients.`
    );
    setTimeout(() => {
      setDisseminationNotice(null);
    }, 4500);
  };

  const filteredAlerts = alerts?.filter(
    (a) => selectedSeverity === 'ALL' || a.severity === selectedSeverity
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-monsoon-border/60">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <span>{t.navAlerts}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 font-mono font-normal">
            Multi-Channel Dissemination
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time hydrological and meteorological hazard warnings formatted for field broadcast.
        </p>
      </div>

      {/* Location Selector */}
      <LocationSelector />

      {/* Dissemination Toast / Notice */}
      {disseminationNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{disseminationNotice}</span>
        </div>
      )}

      {/* Severity Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Severity:</span>
        </div>
        {(['ALL', 'CRITICAL', 'HIGH', 'ELEVATED', 'MODERATE', 'LOW'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all ${
              selectedSeverity === sev
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-monsoon-surface border border-monsoon-border text-slate-300 hover:text-white'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} heightClass="h-20" />
      ) : !filteredAlerts || filteredAlerts.length === 0 ? (
        <EmptyState
          title={t.noAlerts}
          message="No active high-hazard meteorological or agronomic alerts for this jurisdiction."
          actionText="Refresh Alert Pipeline"
          onAction={loadAlerts}
        />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-monsoon-surface border border-monsoon-border hover:border-emerald-500/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-monsoon-border/50">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                    {alert.category}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300">{alert.locationName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    Issued: {alert.createdAt}
                  </span>
                  <RiskBadge level={alert.severity} />
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-white leading-snug">{alert.title}</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {alert.eventDescription}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-monsoon-forest/50 border border-monsoon-border/60">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase font-mono">
                  {t.recommendedAction}
                </div>
                <p className="text-xs text-slate-200 mt-0.5">{alert.recommendedAction}</p>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Effective Window: {alert.forecastPeriod}
                </div>
              </div>

              {/* Broadcast Actions Adapter */}
              <div className="pt-2 border-t border-monsoon-border/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>Supported Dissemination Channels:</span>
                  <div className="flex gap-1.5 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-monsoon-dark border border-monsoon-border">
                      SMS
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-monsoon-dark border border-monsoon-border">
                      WhatsApp
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-monsoon-dark border border-monsoon-border">
                      In-app
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateDissemination(alert, 'SMS Gateway')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-monsoon-dark hover:bg-monsoon-pine border border-monsoon-border text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Send SMS</span>
                  </button>
                  <button
                    onClick={() => handleSimulateDissemination(alert, 'WhatsApp Business API')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-monsoon-dark hover:bg-monsoon-pine border border-monsoon-border text-slate-200 text-xs font-medium transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
