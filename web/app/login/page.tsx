'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/locationStore';
import { useAuthStore } from '../../store/authStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { CloudSunRain, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { language, setUserRole } = useAppStore();
  const { signIn, resetPassword, isLoading, error, clearError } = useAuthStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'officer' | 'admin'>('farmer');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResetMessage(null);

    const res = await signIn(email, password, role);
    if (res.success && res.user) {
      const authenticatedRole = res.user.role;
      setUserRole(authenticatedRole);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect && !redirect.startsWith('/login') && !redirect.startsWith('/signup')) {
          if (redirect.startsWith('/admin') && authenticatedRole !== 'admin') {
            router.push('/dashboard');
            return;
          }
          if (redirect.startsWith('/officer') && authenticatedRole === 'farmer') {
            router.push('/dashboard');
            return;
          }
          router.push(redirect);
          return;
        }
      }

      if (authenticatedRole === 'admin') router.push('/admin');
      else if (authenticatedRole === 'officer') router.push('/officer');
      else router.push('/dashboard');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your registered email address first.');
      return;
    }
    const res = await resetPassword(email);
    setResetMessage(res.message);
  };

  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-monsoon-surface border border-monsoon-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-700/80 border border-emerald-500/50 mx-auto flex items-center justify-center text-white">
            <CloudSunRain className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">MONSOON-SENSE</h1>
          <p className="text-xs text-slate-400">
            Sign In to Hyperlocal Climate Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resetMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Operational Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['farmer', 'officer', 'admin'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-1.5 px-2 rounded-lg text-xs capitalize font-semibold transition-all border ${
                    role === r
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-monsoon-dark text-slate-300 border-monsoon-border hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agri.gov.in or user@domain.com"
                className="w-full pl-9 pr-3 py-2 bg-monsoon-dark border border-monsoon-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-monsoon-dark border border-monsoon-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-monsoon-border/50 text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link href="/signup" className="text-emerald-400 hover:underline font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
