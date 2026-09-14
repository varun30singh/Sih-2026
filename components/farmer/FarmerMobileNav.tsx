'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  QrCode, 
  Users, 
  CreditCard 
} from 'lucide-react';

export const FarmerMobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/farmer/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/farmer/book-slot', label: 'Book Slot', icon: CalendarPlus },
    { href: '/farmer/token', label: 'My Token', icon: QrCode },
    { href: '/farmer/queue', label: 'Queue', icon: Users },
    { href: '/farmer/payment', label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
