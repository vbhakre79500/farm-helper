'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CloudSunRain, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-monsoon-dark/95 border-b border-monsoon-border/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16 max-w-7xl mx-auto w-full">
        {/* Brand identity */}
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
                Public Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block leading-none">
              Hyperlocal Sub-Seasonal Climate Intelligence
            </p>
          </div>
        </Link>

        {/* Public Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                      : 'text-slate-300 hover:text-white hover:bg-monsoon-forest/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-monsoon-border bg-monsoon-surface hover:bg-monsoon-forest text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
