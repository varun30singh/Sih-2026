'use client';

import React from 'react';
import { useChatbot } from './ChatbotContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { SuggestedQuestions } from './SuggestedQuestions';
import { ChatInput } from './ChatInput';

export const ChatbotPanel: React.FC = () => {
  const { isOpen, isMinimized } = useChatbot();

  if (!isOpen || isMinimized) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Krish AI"
      aria-modal="false"
      className="fixed z-50 flex flex-col pointer-events-auto transition-all duration-300
        /* Desktop */
        md:right-6 md:bottom-6 md:w-[400px] md:h-[620px] md:max-h-[85vh]
        /* Mobile */
        right-3 left-3 bottom-3 top-14 sm:top-20 md:top-auto md:left-auto
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90
        rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]
        overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-250"
      style={{ isolation: 'isolate' }}
    >
      {/* Header */}
      <ChatHeader />

      {/* Messages */}
      <ChatMessages />

      {/* Suggested Questions */}
      <SuggestedQuestions />

      {/* Input */}
      <ChatInput />
    </div>
  );
};
