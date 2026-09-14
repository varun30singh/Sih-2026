'use client';

import React from 'react';
import { useLanguage } from '@/components/common/LanguageContext';
import { Eye } from 'lucide-react';

export const AccessibilityControls: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { fontSize, setFontSize, highContrast, setHighContrast } = useLanguage();

  return (
    <div className={`hidden sm:flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 ${className}`}>
      <span className="text-[10px] uppercase font-semibold text-slate-400">Text:</span>
      <button
        onClick={() => setFontSize('normal')}
        title="Standard Font Size"
        className={`px-1.5 py-0.5 rounded font-semibold ${fontSize === 'normal' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'hover:text-emerald-600'}`}
      >
        A
      </button>
      <button
        onClick={() => setFontSize('large')}
        title="Large Font Size"
        className={`px-1.5 py-0.5 rounded font-bold text-sm leading-none ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'hover:text-emerald-600'}`}
      >
        A+
      </button>
      <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-600 mx-0.5" />
      <button
        onClick={() => setHighContrast(!highContrast)}
        title="Toggle High Contrast"
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
          highContrast ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-emerald-600'
        }`}
      >
        <Eye className="w-3 h-3" />
        <span>Contrast</span>
      </button>
    </div>
  );
};
