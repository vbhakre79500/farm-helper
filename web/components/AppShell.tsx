'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { PublicNavbar } from './PublicNavbar';
import { useAppStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../../shared/types';
import { ShieldAlert, Shield, Loader2, Lock } from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, setUserRole } = useAppStore();
  const { restoreSession, user, isAuthenticated, isLoading } = useAuthStore();

  const isAuthStandalonePage = pathname === '/login' || pathname === '/signup';
  const isPublicContentPage = pathname === '/' || pathname === '/about' || pathname === '/how-it-works';
  const isPublicRoute = isAuthStandalonePage || isPublicContentPage;

  const isOfficerRoute = pathname?.startsWith('/officer');
  const isAdminRoute = pathname?.startsWith('/admin');

  // Only restore session and synchronize on protected routes
  useEffect(() => {
    if (!isPublicRoute) {
      restoreSession();
    }
  }, [restoreSession, isPublicRoute]);

  // Synchronize authenticated user role as authoritative
  useEffect(() => {
    if (user?.role && user.role !== userRole) {
      setUserRole(user.role);
    }
  }, [user?.role, userRole, setUserRole]);

  // Enforce unauthenticated redirect on client for protected routes
  useEffect(() => {
    if (!isPublicRoute && !isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isPublicRoute, pathname, router]);

  // 1. Completely standalone public pages (/login, /signup)
  // Public pages must NOT render AppShell, Sidebar, Navbar, authenticated user information, role information, or protected navigation.
  if (isAuthStandalonePage) {
    return (
      <div className="min-h-screen bg-monsoon-dark text-slate-100 flex flex-col justify-center items-center p-4">
        {children}
      </div>
    );
  }

  // 2. Public content pages (/, /about, /how-it-works)
  // Render clean PublicNavbar and public container with NO Sidebar, NO authenticated user info, NO role info, NO protected nav.
  if (isPublicContentPage) {
    return (
      <div className="min-h-screen flex flex-col bg-monsoon-dark text-slate-100">
        <PublicNavbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  const effectiveRole = user?.role ? (user.role.toLowerCase() as UserRole) : null;
  const isOfficerForbidden = isOfficerRoute && effectiveRole !== 'officer' && effectiveRole !== 'admin';
  const isAdminForbidden = isAdminRoute && effectiveRole !== 'admin';

  // 4. Authenticated Protected Route: Render full AppShell with Navbar and Sidebar
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
