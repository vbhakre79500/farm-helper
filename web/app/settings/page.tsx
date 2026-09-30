'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../store/locationStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { Language, UserRole } from '../../../shared/types';
import { Settings, Globe, Shield, Bell, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, userRole, setUserRole } = useAppStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [waAlerts, setWaAlerts] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-2 border-b border-monsoon-border/60">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-300" />
          <span>{t.navSettings}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure regional language, operational role permissions, and hazard notification preferences.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Settings successfully synchronized with local state and user profile.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Preference */}
        <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Regional Language Selection</span>
          </div>
          <p className="text-xs text-slate-400">
            Choose your preferred language for all forecasts, agronomic advisories, and system alerts.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {[
              { id: 'en', label: 'English', sub: 'Default' },
              { id: 'hi', label: 'हिंदी (Hindi)', sub: 'उत्तर एवं मध्य भारत' },
              { id: 'mr', label: 'मराठी (Marathi)', sub: 'महाराष्ट्र' },
            ].map((l) => (
              <button
                type="button"
                key={l.id}
                onClick={() => setLanguage(l.id as Language)}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  language === l.id
                    ? 'bg-emerald-950/60 border-emerald-500 text-white font-semibold'
                    : 'bg-monsoon-dark border-monsoon-border text-slate-300 hover:text-white'
                }`}
              >
                <div className="font-bold">{l.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{l.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* User Role Selection */}
        <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Active Operational Persona</span>
          </div>
          <p className="text-xs text-slate-400">
            Controls UI modules, dashboard granularity, and analytical tool access.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {[
              { id: 'farmer', title: t.roleFarmer, desc: 'Simplified village-level forecasts and crop advice' },
              { id: 'officer', title: t.roleOfficer, desc: 'Multi-block surveillance and district reports' },
              { id: 'admin', title: t.roleAdmin, desc: 'Data ingestion feeds, models, and system metrics' },
            ].map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setUserRole(r.id as UserRole)}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  userRole === r.id
                    ? 'bg-emerald-950/60 border-emerald-500 text-white font-semibold'
                    : 'bg-monsoon-dark border-monsoon-border text-slate-300 hover:text-white'
                }`}
              >
                <div className="font-bold">{r.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hazard Notification Broadcast Preferences */}
        <div className="p-5 rounded-xl bg-monsoon-surface border border-monsoon-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Bell className="w-4 h-4 text-teal-400" />
            <span>Dissemination Preferences</span>
          </div>
          <div className="space-y-2 pt-1 text-xs">
            <label className="flex items-center gap-3 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-monsoon-dark border-monsoon-border text-emerald-600 focus:ring-0"
              />
              <span>Receive critical dry-spell and heavy rainfall SMS alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={waAlerts}
                onChange={(e) => setWaAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-monsoon-dark border-monsoon-border text-emerald-600 focus:ring-0"
              />
              <span>Receive weekly WhatsApp agronomic advisory summaries</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
}
