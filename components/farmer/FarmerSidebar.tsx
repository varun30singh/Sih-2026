'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  CalendarPlus, 
  Compass, 
  QrCode, 
  Users, 
  PackageCheck, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut,
  Sprout
} from 'lucide-react';

export const FarmerSidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/farmer/book-slot', label: 'Book Slot', icon: CalendarPlus },
    { href: '/farmer/smart-centres', label: 'Smart Mandis', icon: Compass, badge: 'AI' },
    { href: '/farmer/token', label: 'My Token', icon: QrCode, badge: 'M-142' },
    { href: '/farmer/queue', label: 'Live Queue', icon: Users },
    { href: '/farmer/procurement', label: 'Procurement Status', icon: PackageCheck },
    { href: '/farmer/payment', label: 'Payment Status', icon: CreditCard },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4">
      {/* Farmer Profile Mini Card */}
      <div className="p-3.5 mb-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
          RS
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">Ramesh Singh</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Bhatiyana, Hapur (UP)</p>
          <p className="text-[10px] text-slate-500 truncate">ID: UP-FARM-2026-8921</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="space-y-1.5 flex-1">
        <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
          Farmer Portal Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link
          href="/farmer/register"
          className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl"
        >
          <User className="w-4 h-4" />
          <span>My Profile / Land Info</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};
