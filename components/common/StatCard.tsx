import React from 'react';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
  variant?: 'light' | 'dark';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
  variant = 'light',
}) => {
  return (
    <GlassCard
      variant={variant}
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-md',
        highlight && 'border-emerald-500/50 ring-1 ring-emerald-500/20'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium">
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded',
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                )}
              >
                {trend.value}
              </span>
              <span className="text-slate-400">vs yesterday</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
          {icon}
        </div>
      </div>
    </GlassCard>
  );
};
