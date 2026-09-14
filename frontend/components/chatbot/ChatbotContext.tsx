'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/components/common/LanguageContext';
import {
  checkChatbotHealth,
  sendChatbotMessage,
  getDefaultSuggestions,
} from './chatbot-api';

export type ChatLanguage = 'english' | 'hindi' | 'marathi';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: string;
  isError?: boolean;
}

interface ChatbotContextType {
  isOpen: boolean;
  isMinimized: boolean;
  isOnline: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  suggestedQuestions: string[];
  currentLanguage: ChatLanguage;
  showHelpBubble: boolean;
  activeToken: string;
  openChat: () => void;
  closeChat: () => void;
  minimizeChat: () => void;
  toggleChat: () => void;
  sendMessage: (text?: string) => Promise<void>;
  setChatLanguage: (lang: ChatLanguage) => void;
  dismissHelpBubble: () => void;
  clearChat: () => void;
  setActiveToken: (token: string) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

const WELCOME_MESSAGES: Record<ChatLanguage, string> = {
  english:
    "Hello! I’m **ProcureAI**, your MandiSetu procurement assistant. How can I help you today?",
  hindi:
    "नमस्कार! मैं **ProcureAI** हूँ, आपका मंडीसेतु प्रोक्योरमेंट सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?",
  marathi:
    "नमस्कार! मी **ProcureAI** आहे, तुमचा मंडीसेतु खरेदी सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?",
};

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language: siteLang } = useLanguage();

  // Map site language to chat language
  const resolveLang = (lang: string): ChatLanguage => {
    if (lang === 'hi') return 'hindi';
    if (lang === 'mr') return 'marathi';
    return 'english';
  };

  const [currentLanguage, setCurrentLanguage] = useState<ChatLanguage>(() => resolveLang(siteLang));
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const [activeToken, setActiveToken] = useState('M-142');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(() =>
    getDefaultSuggestions(resolveLang(siteLang))
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: WELCOME_MESSAGES[resolveLang(siteLang)],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: resolveLang(siteLang),
    },
  ]);

  const hasLoadedSession = useRef(false);

  // Sync site language changes with chatbot
  useEffect(() => {
    const mapped = resolveLang(siteLang);
    setCurrentLanguage(mapped);
    setSuggestedQuestions(getDefaultSuggestions(mapped));
  }, [siteLang]);

  // Load / Save Session Storage for persistent chat across internal page navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!hasLoadedSession.current) {
      try {
        const savedMessages = sessionStorage.getItem('mandisetu_chat_messages');
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }

        const bubbleDismissed = sessionStorage.getItem('mandisetu_help_bubble_dismissed');
        if (!bubbleDismissed) {
          // Delay presentation of help bubble to be polite & non-intrusive
          const timer = setTimeout(() => {
            setShowHelpBubble(true);
          }, 2500);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.warn('Could not read session storage for chat:', e);
      }
      hasLoadedSession.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasLoadedSession.current) return;
    try {
      sessionStorage.setItem('mandisetu_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat messages to session storage:', e);
    }
  }, [messages]);

  // Periodic live health check for Online/Offline indicator
  const verifyBackendStatus = useCallback(async () => {
    const health = await checkChatbotHealth();
    setIsOnline(health.isOnline);
  }, []);

  useEffect(() => {
    verifyBackendStatus();
    const intervalId = setInterval(verifyBackendStatus, 12000);
    return () => clearInterval(intervalId);
  }, [verifyBackendStatus]);

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    dismissHelpBubble();
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      closeChat();
    } else {
      openChat();
    }
  };

  const dismissHelpBubble = () => {
    setShowHelpBubble(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('mandisetu_help_bubble_dismissed', 'true');
      } catch (_) {}
    }
  };

  const setChatLanguage = (lang: ChatLanguage) => {
    setCurrentLanguage(lang);
    setSuggestedQuestions(getDefaultSuggestions(lang));
  };

  const clearChat = () => {
    const initialWelcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'assistant',
      text: WELCOME_MESSAGES[currentLanguage],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: currentLanguage,
    };
    setMessages([initialWelcome]);
    setSuggestedQuestions(getDefaultSuggestions(currentLanguage));
  };

  const sendMessage = async (rawText?: string) => {
    const text = (rawText || '').trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: currentLanguage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const responseData = await sendChatbotMessage(text, currentLanguage, activeToken);

      const assistantMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: responseData.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: responseData.language as ChatLanguage,
        isError: !responseData.success,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (responseData.suggestedQuestions && responseData.suggestedQuestions.length > 0) {
        setSuggestedQuestions(responseData.suggestedQuestions);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'I’m unable to process your request at this moment. Please check if the ProcureAI server is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        isMinimized,
        isOnline,
        isTyping,
        messages,
        suggestedQuestions,
        currentLanguage,
        showHelpBubble,
        activeToken,
        openChat,
        closeChat,
        minimizeChat,
        toggleChat,
        sendMessage,
        setChatLanguage,
        dismissHelpBubble,
        clearChat,
        setActiveToken,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
