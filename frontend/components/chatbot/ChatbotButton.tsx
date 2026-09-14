'use client';

import React from 'react';
import { Bot, MessageSquare, X } from 'lucide-react';
import { useChatbot } from './ChatbotContext';

export const ChatbotButton: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    isOnline,
    toggleChat,
    showHelpBubble,
    dismissHelpBubble,
    openChat,
  } = useChatbot();

  // If chat is open and not minimized, button is hidden (header has controls)
  if (isOpen && !isMinimized) {
    return null;
  }

  return (
    <div
      className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 flex flex-col items-end pointer-events-auto select-none"
      style={{ isolation: 'isolate' }}
    >
      {/* Friendly "Any help? 💬" speech bubble */}
      {showHelpBubble && (
        <div className="relative mb-3 animate-bounce-subtle">
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold cursor-pointer hover:border-emerald-500 transition-all">
            <span onClick={openChat} className="flex items-center gap-1.5">
              <span>Any help?</span>
              <span className="text-emerald-600 dark:text-emerald-400">💬</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissHelpBubble();
              }}
              aria-label="Dismiss help prompt"
              className="p-0.5 ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Bubble pointer caret */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-emerald-500/30 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={toggleChat}
        aria-label="Open ProcureAI assistant"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-[0_8px_25px_rgba(16,185,129,0.38)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.52)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        {/* Soft pulse glow when online */}
        {isOnline && (
          <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none opacity-75" />
        )}

        {/* Live Status indicator dot on the button */}
        <span
          className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
            isOnline ? 'bg-emerald-400' : 'bg-rose-500'
          }`}
          title={isOnline ? 'ProcureAI Online' : 'ProcureAI Offline'}
        />

        {/* Floating Button Icon */}
        <div className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
          <Bot className="w-7 h-7" />
        </div>
      </button>
    </div>
  );
};
