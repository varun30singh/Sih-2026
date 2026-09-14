'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { 
  Sprout, 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  Lock, 
  Phone, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

type Role = 'farmer' | 'admin' | 'assisted';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('farmer');
  const [identifier, setIdentifier] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'farmer') {
      setIdentifier('+91 98765 43210');
    } else if (newRole === 'admin') {
      setIdentifier('officer.hapur@mandisetu.gov.in');
    } else {
      setIdentifier('csc.bhatiyana.vle@csc.gov.in');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'farmer') {
        router.push('/farmer/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/assisted-booking');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-emerald-600/30">
                <Sprout className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                MandiSetu Portal Login
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Select your role to access your dedicated dashboard
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleRoleChange('farmer')}
                className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  role === 'farmer'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mandi Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('assisted')}
                className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  role === 'assisted'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>CSC / VLE</span>
              </button>
            </div>

            {/* Demo Credential Notice */}
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Pre-filled mock credentials. Click proceed to enter prototype.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {role === 'farmer' ? 'Mobile Number / Farmer ID' : 'Official Govt. ID / Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {role === 'farmer' ? 'One Time Password (OTP)' : 'Security PIN / Password'}
                  </label>
                  <span className="text-[11px] text-emerald-600 font-semibold cursor-pointer">
                    Resend Code
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to {role === 'farmer' ? 'Farmer Portal' : role === 'admin' ? 'Admin Dashboard' : 'CSC Operator Desk'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              New farmer?{' '}
              <Link href="/farmer/register" className="font-bold text-emerald-600 hover:underline">
                Register here in 4 simple steps →
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
