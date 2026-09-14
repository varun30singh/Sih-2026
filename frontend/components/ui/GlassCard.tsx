import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'gradient';
  hoverEffect?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'light',
  hoverEffect = false,
  className,
  ...props
}) => {
  const variantStyles = {
    light: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    dark: 'bg-slate-900/85 backdrop-blur-lg border border-slate-800/80 text-white shadow-[0_8px_32px_rgba(0,0,0,0.37)]',
    gradient: 'bg-gradient-to-br from-emerald-900/90 via-slate-900/90 to-slate-950/95 backdrop-blur-xl border border-emerald-500/20 text-white shadow-xl',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variantStyles[variant],
        hoverEffect && 'hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/40 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
