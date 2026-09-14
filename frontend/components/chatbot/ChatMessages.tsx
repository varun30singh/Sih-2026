'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';
import { useChatbot } from './ChatbotContext';
import { TypingIndicator } from './TypingIndicator';

export const ChatMessages: React.FC = () => {
  const { messages, isTyping } = useChatbot();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Simple markdown renderer for bold text, bullet points, and clean linebreaks
  const formatText = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, i) => {
      // Bold formatter
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-bold text-emerald-800 dark:text-emerald-300">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={i} className="flex items-start gap-1.5 my-0.5 ml-1">
            <span className="text-emerald-500 font-bold">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={i} className="h-1.5" />;
      }

      return (
        <p key={i} className="my-0.5 leading-relaxed">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-950/60">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[88%] ${
              isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
            } animate-in fade-in slide-in-from-bottom-2 duration-150`}
          >
            {/* Sender Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ${
                isUser
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="flex flex-col">
              <div
                className={`px-3.5 py-2.5 rounded-2xl shadow-xs transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 rounded-tl-xs'
                    : 'bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                {msg.isError && (
                  <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Connection Warning</span>
                  </div>
                )}
                <div>{formatText(msg.text)}</div>
              </div>

              {/* Timestamp */}
              <span
                className={`text-[10px] text-slate-400 mt-1 px-1 ${
                  isUser ? 'text-right' : 'text-left'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        );
      })}

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
};
