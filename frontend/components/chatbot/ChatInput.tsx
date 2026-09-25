'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChatbot } from './ChatbotContext';

export const ChatInput: React.FC = () => {
  const { sendMessage, isTyping, currentLanguage, activeToken } = useChatbot();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const placeholders = {
    english: 'Ask anything about procurement...',
    hindi: 'संदेश टाइप करें... (Type a message...)',
    marathi: 'संदेश टाइप करा... (Type a message...)',
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isTyping) return;
    sendMessage(text);
    setText('');
  };

  return (
    <footer className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-b-2xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder={placeholders[currentLanguage] || placeholders.english}
            className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isTyping}
          aria-label="Send message"
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Subtext with Context Pill */}
      <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
        <span>Krish AI may make mistakes. Verify critical data.</span>
        {activeToken && (
          <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{activeToken}</span>
          </span>
        )}
      </div>
    </footer>
  );
};
