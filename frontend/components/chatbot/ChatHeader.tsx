'use client';

import React, { useState } from 'react';
import { Bot, Minus, X, RotateCcw, Globe } from 'lucide-react';
import { useChatbot, ChatLanguage } from './ChatbotContext';

export const ChatHeader: React.FC = () => {
  const {
    isOnline,
    closeChat,
    minimizeChat,
    currentLanguage,
    setChatLanguage,
    clearChat,
  } = useChatbot();

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: ChatLanguage; label: string; flag: string }[] = [
    { code: 'english', label: 'English', flag: '🇬🇧' },
    { code: 'hindi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'marathi', label: 'मराठी', flag: '🇲🇭' },
  ];

  return (
    <header className="relative px-4 py-3 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-t-2xl shadow-md flex items-center justify-between z-20">
      {/* Left Avatar & Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-inner">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 leading-tight">
            <h3 className="font-bold text-sm tracking-wide text-white">ProcureAI</h3>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-white/20 text-emerald-100">
              SIH26032
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-100/90 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            <span className="text-emerald-200/60">•</span>
            <span className="text-emerald-100 text-[10px]">MandiSetu Assistant</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        {/* Language Selector Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-label="Change response language"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition-colors"
          >
            <span>{languages.find((l) => l.code === currentLanguage)?.flag}</span>
            <span className="text-[11px] hidden sm:inline">
              {languages.find((l) => l.code === currentLanguage)?.label}
            </span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1 text-slate-800 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Language
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setChatLanguage(lang.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors ${
                    currentLanguage === lang.code ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Chat Button */}
        <button
          type="button"
          onClick={clearChat}
          aria-label="Reset conversation"
          title="New Chat"
          className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Minimize Button */}
        <button
          type="button"
          onClick={minimizeChat}
          aria-label="Minimize assistant"
          title="Minimize"
          className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={closeChat}
          aria-label="Close assistant"
          title="Close"
          className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
