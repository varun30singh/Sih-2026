'use client';

import React from 'react';
import { Sparkles, CornerDownLeft } from 'lucide-react';
import { useChatbot } from './ChatbotContext';

export const SuggestedQuestions: React.FC = () => {
  const { suggestedQuestions, sendMessage, isTyping } = useChatbot();

  if (!suggestedQuestions || suggestedQuestions.length === 0 || isTyping) {
    return null;
  }

  return (
    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-emerald-500" />
        <span>Suggested Questions</span>
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(q)}
            disabled={isTyping}
            className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium shadow-2xs hover:border-emerald-500/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all text-left"
          >
            <span>{q}</span>
            <CornerDownLeft className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400" />
          </button>
        ))}
      </div>
    </div>
  );
};
