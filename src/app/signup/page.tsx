'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 shadow-xl shadow-emerald-50">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Check your inbox</h1>
        <p className="max-w-[320px] text-sm text-slate-400 font-medium leading-relaxed">
          We've sent a verification link to <span className="text-slate-900 font-bold">{email}</span>. Please click it to activate your account.
        </p>
        <div className="mt-10">
           <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border-b-2 border-slate-50 hover:border-slate-900 pb-1">
             Back to Login
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-900" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-[400px] z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 mb-6 font-black text-white italic">
            CP
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Create Account</h1>
          <p className="text-sm text-slate-400 font-medium tracking-wide text-center">Join the network of structured project managers</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Work Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                placeholder="Suggest a strong password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all transform active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create My Workspace'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400 font-bold">
            Already have an account?{' '}
            <Link href="/login" className="text-slate-900 hover:underline decoration-2 underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
