'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Clock, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sprout,
  ChevronDown,
  Building2
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const AdminNavbar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-18 bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white">
                Mandi<span className="text-emerald-400">Setu</span>
              </span>
              <span className="text-[9px] uppercase font-extrabold bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">
                Ops Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">Mandi Administration & Control Desk</p>
          </div>
        </Link>

        {/* Centre Quick Switcher */}
        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Active Mandi:</span>
          <select className="bg-slate-800 text-white text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer">
            <option value="centre-14">Centre #14 — Hapur Central (Congested 🟡)</option>
            <option value="centre-12">Centre #12 — Modinagar Agri Hub (Optimal 🟢)</option>
            <option value="centre-18">Centre #18 — Meerut North (Critical 🔴)</option>
            <option value="centre-07">Centre #07 — Bulandshahr (Optimal 🟢)</option>
            <option value="centre-21">Centre #21 — Pilkhuwa (Moderate 🟡)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-xl text-xs font-mono text-emerald-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time || '10:32:15 AM'}</span>
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Counter Chime Active' : 'Sound Muted'}
          className={`p-2 rounded-xl text-xs transition-colors border ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Delayed Alert Bell */}
        <Link href="/admin/dynamic-slots" className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] font-bold rounded-full flex items-center justify-center text-white ring-2 ring-slate-900 animate-pulse">
            1
          </span>
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
            DO
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-white block">Dr. A. Sharma</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">District Mandi In-Charge</span>
          </div>
        </div>
      </div>
    </header>
  );
};
