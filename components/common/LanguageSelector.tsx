'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 text-xs shadow-sm ${className}`}>
      <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
          language === 'en'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
          language === 'hi'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
        }`}
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => setLanguage('mr')}
        className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
          language === 'mr'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
        }`}
      >
        मराठी
      </button>
    </div>
  );
};
