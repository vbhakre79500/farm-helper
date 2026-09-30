'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';
import { TRANSLATIONS } from '../../shared/translations';
import { Language } from '../../shared/types';
import {
  CloudSunRain,
  Globe2,
  UserCheck,
  Shield,
  Sprout,
  Menu,
  X,
  Bell,
  Activity,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { language, setLanguage, userRole } = useAppStore();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const activeRole = user?.role || userRole;

  return (
    <header className="sticky top-0 z-40 w-full bg-monsoon-dark/95 border-b border-monsoon-border/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-monsoon-forest"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-600 transition-colors">
              <CloudSunRain className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base text-white group-hover:text-emerald-400 transition-colors">
                  MONSOON-SENSE
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono font-medium rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Block/Panchayat
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block leading-none">
                Hyperlocal Climate Intelligence & Decision Support
              </p>
            </div>
          </Link>
        </div>

        {/* Global Controls: Role Badge, Language, Alerts, Health, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live pipeline health indicator */}
          <Link
            href="/admin"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-monsoon-surface border border-monsoon-border text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            title="System & Data Pipeline Status"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">{t.operational}</span>
          </Link>

          {/* Authoritative Role Badge (Non-modifiable by client) */}
          <div className="flex items-center gap-1.5 bg-monsoon-forest/60 border border-monsoon-border rounded-lg px-2.5 py-1" title="Authenticated Operational Role">
            {activeRole === 'farmer' && <Sprout className="w-3.5 h-3.5 text-emerald-400" />}
            {activeRole === 'officer' && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
            {activeRole === 'admin' && <Shield className="w-3.5 h-3.5 text-rose-400" />}
            <span className="text-xs font-semibold capitalize font-mono text-slate-200">
              {activeRole}
            </span>
          </div>

          {/* Language Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-monsoon-forest/60 border border-monsoon-border rounded-lg px-2 py-1">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              aria-label="Preferred Language"
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="en" className="bg-monsoon-dark text-slate-200">
                English
              </option>
              <option value="hi" className="bg-monsoon-dark text-slate-200">
                हिंदी (Hindi)
              </option>
              <option value="mr" className="bg-monsoon-dark text-slate-200">
                मराठी (Marathi)
              </option>
            </select>
          </div>

          {/* Quick Alert Bell */}
          <Link
            href="/alerts"
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-monsoon-forest transition-colors"
            aria-label="View Active Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-monsoon-dark"></span>
          </Link>

          {/* Auth Status & Action */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 border-l border-monsoon-border/60 pl-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">{user.fullName}</span>
                <span className="text-[10px] text-emerald-400 font-mono">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
