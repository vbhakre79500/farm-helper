'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/locationStore';
import { useAuthStore } from '../../store/authStore';
import { TRANSLATIONS } from '../../../shared/translations';
import { CloudSunRain, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { language, setUserRole, getActiveLocationId } = useAppStore();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'officer' | 'admin'>('farmer');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const locationId = getActiveLocationId();
    const res = await signUp({
      email,
      password,
      fullName: name,
      role,
      phone,
      locationId,
    });

    if (res.success) {
      const userRole = res.user?.role || role;
      setUserRole(userRole);
      if (userRole === 'officer') router.push('/officer');
      else if (userRole === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-monsoon-surface border border-monsoon-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-700/80 border border-emerald-500/50 mx-auto flex items-center justify-center text-white">
            <CloudSunRain className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create MONSOON-SENSE Account</h1>
          <p className="text-xs text-slate-400">
            Register to receive customized hyperlocal advisories and block warnings.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Your Operational Role
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rameshwar Patil"
                className="w-full pl-9 pr-3 py-2 bg-monsoon-dark border border-monsoon-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 bg-monsoon-dark border border-monsoon-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-monsoon-dark border border-monsoon-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password (Min 6 Characters)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
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
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-monsoon-border/50 text-xs text-slate-400 space-y-2">
          <div>
            <span>Already registered? </span>
            <Link href="/login" className="text-emerald-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
          <div>
            <Link href="/" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              ← Return to MONSOON-SENSE Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
