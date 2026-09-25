import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '../lib/api';
import { getStoredToken, getStoredUser } from '../lib/auth';

type ChatLanguage = 'english' | 'hindi' | 'marathi';

interface ChatResponse {
  success?: boolean;
  response?: string;
  message?: string;
  language?: string;
  suggested_questions?: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  language?: ChatLanguage;
  isError?: boolean;
}

const CHAT_MESSAGES_KEY = 'mandisetu_chat_messages';
const CHAT_LANGUAGE_KEY = 'mandisetu_chat_language';

const WELCOME_MESSAGES: Record<ChatLanguage, string> = {
  english:
    'Hello! I am Krish AI, your MandiSetu procurement assistant. How can I help you today?',
  hindi:
    'नमस्कार! मैं Krish AI हूँ, आपका मंडीसेतु प्रोक्योरमेंट सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?',
  marathi:
    'नमस्कार! मी Krish AI आहे, तुमचा मंडीसेतु खरेदी सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?',
};

const DEFAULT_SUGGESTIONS: Record<ChatLanguage, string[]> = {
  english: [
    'Show me delayed procurements',
    'How long is the waiting time?',
    'Which procurement centre has less waiting?',
    'Give me a procurement summary',
  ],
  hindi: [
    'विलंबित प्रोक्योरमेंट दिखाएं',
    'कतार में कितना समय लगेगा?',
    'सबसे कम प्रतीक्षा वाला केंद्र कौन सा है?',
    'प्रोक्योरमेंट का सारांश बताएं',
  ],
  marathi: [
    'विलंबित खरेदी दाखवा',
    'रांगेत किती वेळ लागेल?',
    'सर्वात कमी प्रतीक्षा असलेले केंद्र कोणते?',
    'खरेदीचा सारांश द्या',
  ],
};

function resolveLanguage(language?: string): ChatLanguage {
  if (language === 'hi' || language === 'hindi') return 'hindi';
  if (language === 'mr' || language === 'marathi') return 'marathi';
  return 'english';
}

export default function ChatbotScreen() {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<ChatLanguage>('english');
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS.english);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const hasLoadedSession = React.useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: WELCOME_MESSAGES.english,
      language: 'english',
    },
  ]);

  React.useEffect(() => {
    async function loadSession() {
      const [savedMessages, savedLanguage, user] = await Promise.all([
        AsyncStorage.getItem(CHAT_MESSAGES_KEY),
        AsyncStorage.getItem(CHAT_LANGUAGE_KEY),
        getStoredUser(),
      ]);
      const language = resolveLanguage(savedLanguage || user?.preferred_language);
      setCurrentLanguage(language);
      setSuggestions(DEFAULT_SUGGESTIONS[language]);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages) as ChatMessage[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            hasLoadedSession.current = true;
            return;
          }
        } catch {
          // Start with the language-specific welcome message.
        }
      }
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: WELCOME_MESSAGES[language],
          language,
        },
      ]);
      hasLoadedSession.current = true;
    }

    loadSession().catch((error) => {
      console.warn('Could not load chatbot session:', error);
    });
  }, []);

  React.useEffect(() => {
    if (!hasLoadedSession.current) {
      return;
    }
    AsyncStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages)).catch(
      (error) => console.warn('Could not save chatbot session:', error),
    );
  }, [messages]);

  React.useEffect(() => {
    requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({ animated: true }));
  }, [messages, sending]);

  function changeLanguage(language: ChatLanguage) {
    setCurrentLanguage(language);
    setSuggestions(DEFAULT_SUGGESTIONS[language]);
    AsyncStorage.setItem(CHAT_LANGUAGE_KEY, language).catch((error) =>
      console.warn('Could not save chatbot language:', error),
    );
  }

  async function sendMessage(messageOverride?: string) {
    const message = (messageOverride || input).trim();

    if (!message || sending) {
      return;
    }

    try {
      setSending(true);
      setInput('');

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: message,
      };

      setMessages((current) => [
        ...current,
        userMessage,
      ]);

      const token = await getStoredToken();

      if (!token) {
        router.replace('/');
        return;
      }

      const health = await api.get<{ status?: string }>('/chatbot/health', token);
      if (health.status !== 'healthy' && health.status !== 'online') {
        throw new Error('Krish AI server is currently unavailable. Please try again.');
      }

      const response = await api.post<ChatResponse>(
        '/chatbot/chat',
        { message, language: currentLanguage },
        token,
      );

      const assistantText =
        response.response ||
        response.message ||
        'I could not find an answer right now. Please try again.';

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: assistantText,
          language: resolveLanguage(response.language || currentLanguage),
          isError: response.success === false,
        },
      ]);
      setSuggestions(
        response.suggested_questions?.length
          ? response.suggested_questions
          : DEFAULT_SUGGESTIONS[currentLanguage],
      );
    } catch (error) {
      console.error('Chatbot error:', error);

      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text:
            error instanceof Error
              ? error.message
              : 'Unable to connect to Krish AI.',
          isError: true,
        },
      ]);
      setSuggestions(DEFAULT_SUGGESTIONS[currentLanguage]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
      keyboardVerticalOffset={10}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerMain}>
          <Text style={styles.title}>
            Krish AI
          </Text>

          <Text style={styles.subtitle}>
            Procurement & farming support
          </Text>
        </View>

        <Text style={styles.botIcon}>🤖</Text>
      </View>

      <View style={styles.languageBar}>
        {(['english', 'hindi', 'marathi'] as ChatLanguage[]).map((language) => (
          <Pressable
            key={language}
            onPress={() => changeLanguage(language)}
            style={[
              styles.languageButton,
              currentLanguage === language && styles.activeLanguageButton,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                currentLanguage === language && styles.activeLanguageText,
              ]}
            >
              {language === 'english' ? 'English' : language === 'hindi' ? 'हिन्दी' : 'मराठी'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        contentContainerStyle={styles.messageContainer}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user'
                ? styles.userBubble
                : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === 'user' &&
                  styles.userText,
                message.isError && styles.errorText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}

        {sending && (
          <View
            style={[
              styles.messageBubble,
              styles.assistantBubble,
            ]}
          >
            <ActivityIndicator />
          </View>
        )}

        {!sending && suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                style={styles.suggestionButton}
                onPress={() => sendMessage(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask Krish AI..."
          placeholderTextColor="#89928B"
          multiline
          style={styles.input}
          editable={!sending}
        />

        <Pressable
          style={[
            styles.sendButton,
            (!input.trim() || sending) &&
              styles.disabledButton,
          ]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendText}>
            →
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBE8',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  backText: {
    fontSize: 31,
    color: '#1F6B45',
  },

  headerMain: {
    flex: 1,
  },

  languageBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBE8',
    gap: 8,
  },

  languageButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F5F7F4',
  },

  activeLanguageButton: {
    backgroundColor: '#DDEFE4',
  },

  languageText: {
    fontSize: 11,
    color: '#68736B',
  },

  activeLanguageText: {
    color: '#1F6B45',
    fontWeight: '700',
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 11,
    color: '#68736B',
    marginTop: 3,
  },

  botIcon: {
    fontSize: 28,
  },

  messages: {
    flex: 1,
  },

  messageContainer: {
    padding: 18,
    paddingBottom: 25,
  },

  messageBubble: {
    maxWidth: '84%',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 16,
    marginBottom: 10,
  },

  assistantBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },

  userBubble: {
    backgroundColor: '#1F6B45',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },

  messageText: {
    color: '#263129',
    fontSize: 14,
    lineHeight: 20,
  },

  userText: {
    color: '#FFFFFF',
  },

  errorText: {
    color: '#A33A32',
  },

  suggestions: {
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
    gap: 6,
  },

  suggestionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E5DA',
  },

  suggestionText: {
    color: '#1F6B45',
    fontSize: 12,
  },

  inputArea: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E7EBE8',
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: '#F5F7F4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#202720',
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1F6B45',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  disabledButton: {
    opacity: 0.45,
  },

  sendText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
});
