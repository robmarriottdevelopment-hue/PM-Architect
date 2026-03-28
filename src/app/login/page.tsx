'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-900" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-[400px] z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 mb-6">
            <Layout className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-400 font-medium tracking-wide">Enter your credentials to manage your builds</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all transform active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Initialize Session'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400 font-bold">
            Don't have an account?{' '}
            <Link href="/signup" className="text-slate-900 hover:underline decoration-2 underline-offset-4">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
