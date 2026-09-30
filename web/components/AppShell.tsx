'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../../shared/types';
import { ShieldAlert, Shield, Loader2, Lock } from 'lucide-react';

const PUBLIC_PREFIXES = ['/', '/login', '/signup', '/about', '/how-it-works'];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, setUserRole } = useAppStore();
  const { restoreSession, user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Synchronize authenticated user role as authoritative
  useEffect(() => {
    if (user?.role && user.role !== userRole) {
      setUserRole(user.role);
    }
  }, [user?.role, userRole, setUserRole]);

  const isPublicRoute = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
  const isOfficerRoute = pathname?.startsWith('/officer');
  const isAdminRoute = pathname?.startsWith('/admin');

  // Enforce unauthenticated redirect on client while middleware handles edge
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isPublicRoute, pathname, router]);

  // Show loading spinner while authenticating on protected routes
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-monsoon-dark text-slate-100">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-monsoon-surface border border-monsoon-border">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Verifying Supabase authentication session...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated and on protected route, block content rendering until redirect completes
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-monsoon-dark text-slate-100">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-monsoon-surface border border-monsoon-border text-center max-w-sm">
          <Lock className="w-8 h-8 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  const effectiveRole = user?.role ? (user.role.toLowerCase() as UserRole) : null;
  const isOfficerForbidden = isOfficerRoute && effectiveRole !== 'officer' && effectiveRole !== 'admin';
  const isAdminForbidden = isAdminRoute && effectiveRole !== 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-monsoon-dark text-slate-100">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {isOfficerForbidden ? (
            <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-monsoon-surface border border-rose-500/40 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/50 mx-auto flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">403 — Access Restricted</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The Agricultural Extension Officer Console is restricted to verified Officer or Administrator accounts.
                Your current account role is <strong className="text-rose-400 capitalize">{effectiveRole}</strong>.
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-lg bg-monsoon-dark border border-monsoon-border text-xs font-semibold text-slate-200 hover:text-white"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : isAdminForbidden ? (
            <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-monsoon-surface border border-rose-500/40 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/50 mx-auto flex items-center justify-center text-rose-400">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">403 — Administrator Required</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The System Administration & Telemetry Console requires System Administrator credentials.
                Your current account role is <strong className="text-rose-400 capitalize">{effectiveRole}</strong>.
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-lg bg-monsoon-dark border border-monsoon-border text-xs font-semibold text-slate-200 hover:text-white"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
