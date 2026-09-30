'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';
import { TRANSLATIONS } from '../../shared/translations';
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Radio,
  FileCheck2,
  History,
  AlertTriangle,
  Building2,
  ServerCog,
  HelpCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { language, userRole } = useAppStore();
  const { user } = useAuthStore();
  const activeRole = user?.role || userRole;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const navItems = [
    { label: t.navDashboard, href: '/dashboard', icon: LayoutDashboard, role: 'all' },
    { label: t.navRiskMap, href: '/risk-map', icon: Map, role: 'all' },
    { label: t.navForecast, href: '/forecast', icon: TrendingUp, role: 'all' },
    { label: t.navClimateSignals, href: '/climate-signals', icon: Radio, role: 'all' },
    { label: t.navAdvisories, href: '/advisories', icon: FileCheck2, role: 'all' },
    { label: t.navHistory, href: '/history', icon: History, role: 'all' },
    { label: t.navAlerts, href: '/alerts', icon: AlertTriangle, role: 'all' },
    {
      label: t.extensionOfficerDashboard,
      href: '/officer',
      icon: Building2,
      role: 'officer',
      badge: 'Officer',
    },
    {
      label: t.systemAdmin,
      href: '/admin',
      icon: ServerCog,
      role: 'admin',
      badge: 'Admin',
    },
    { label: t.navHowItWorks, href: '/how-it-works', icon: HelpCircle, role: 'all' },
    { label: t.navSettings, href: '/settings', icon: Settings, role: 'all' },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.role === 'all') return true;
    if (item.role === 'officer' && (activeRole === 'officer' || activeRole === 'admin')) return true;
    if (item.role === 'admin' && activeRole === 'admin') return true;
    return false;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-monsoon-surface/95 border-r border-monsoon-border/70 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Modules
          </div>

          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-800/40 text-emerald-300 border border-emerald-600/40 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-monsoon-forest/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-monsoon-dark text-slate-400 border border-monsoon-border">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400 ml-1 shrink-0" />}
              </Link>
            );
          })}
        </div>

        {/* Scientific Downscaling Indicator in Footer */}
        <div className="p-3 border-t border-monsoon-border/40 bg-monsoon-dark/50">
          <div className="text-[11px] font-mono text-slate-400">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span>Resolution:</span>
              <span className="text-emerald-400">0.05° (~5 km)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>ML Engine:</span>
              <span>XGBoost + SHAP</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
