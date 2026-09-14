'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  AlertOctagon, 
  Boxes, 
  Building2, 
  Scale, 
  CalendarRange, 
  UserCheck, 
  QrCode, 
  PackageCheck, 
  CreditCard, 
  BarChart3, 
  LogOut,
  Sprout,
  ShieldAlert
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const coreSections = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/queue', label: 'Live Counter Queue', icon: Users },
    { href: '/admin/smart-queue', label: 'Smart Queue Engine', icon: Cpu, badge: 'AI' },
    { href: '/admin/dynamic-slots', label: 'Dynamic Slots Alert', icon: AlertOctagon, badge: 'Delay' },
    { href: '/admin/digital-twin', label: 'Digital Twin Mandi', icon: Boxes, badge: '3D Live' },
    { href: '/admin/centres', label: 'Multi-Centre Monitor', icon: Building2 },
    { href: '/admin/fairness', label: 'Fairness Engine', icon: Scale, badge: 'Score 91' },
  ];

  const registrySections = [
    { href: '/admin/slots', label: 'Slot Capacities', icon: CalendarRange },
    { href: '/admin/farmers', label: 'Farmer Registry', icon: UserCheck },
    { href: '/admin/tokens', label: 'Token Ledger', icon: QrCode },
    { href: '/admin/procurement', label: 'Procurement Records', icon: PackageCheck },
    { href: '/admin/payments', label: 'DBT Payment Clearance', icon: CreditCard },
    { href: '/admin/analytics', label: 'Mandi Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 border-r border-slate-800 min-h-[calc(100vh-4.5rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Mandi Centre Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Centre #14
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">Hapur Central Mandi</h4>
            <p className="text-[11px] text-slate-400">UP-HPR-014 • District Ops</p>
          </div>
        </div>

        {/* SIH Core Differentiator Nav */}
        <div>
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-2">
            Core SIH Engines
          </p>
          <nav className="space-y-1">
            {coreSections.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-emerald-800 text-white'
                          : item.badge === 'Delay'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-emerald-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Administration & Registry */}
        <div>
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-2">
            Registry & Ledgers
          </p>
          <nav className="space-y-1">
            {registrySections.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer logout */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          href="/login"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Ops Mode</span>
        </Link>
      </div>
    </aside>
  );
};
