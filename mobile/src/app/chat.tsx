import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../lib/api';
import { getStoredToken, getStoredUser } from '../lib/auth';

type Language = 'english' | 'hindi' | 'marathi';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  isError?: boolean;
}

interface ChatbotApiResponse {
  success?: boolean;
  message?: string;
  response?: string;
  language?: string;
  suggested_questions?: string[];
  suggestedQuestions?: string[];
  error?: string;
}

const DEFAULT_SUGGESTIONS: Record<Language, string[]> = {
  english: [
    'What is my current token status?',
    'Which procurement centre has less waiting?',
    'How long is the current waiting time?',
    'What are today’s available slots?',
  ],
  hindi: [
    'मेरे टोकन की स्थिति क्या है?',
    'किस खरीद केंद्र पर कम इंतजार है?',
    'अभी कितना इंतजार करना पड़ेगा?',
    'आज कौन से स्लॉट उपलब्ध हैं?',
  ],
  marathi: [
    'माझा टोकन कुठे आहे?',
    'कोणत्या खरेदी केंद्रावर कमी प्रतीक्षा आहे?',
    'रांगेत किती वेळ लागेल?',
    'आज कोणते स्लॉट उपलब्ध आहेत?',
  ],
};

const WELCOME_MESSAGES: Record<Language, string> = {
  english:
    'Hello! I am Krish AI. How can I help you today with procurement, live queues, slots, or farming advice?',
  hindi:
    'नमस्ते! मैं Krish AI हूँ। खरीद, लाइव कतार, स्लॉट या खेती की जानकारी के लिए मैं आपकी क्या मदद कर सकता हूँ?',
  marathi:
    'नमस्कार! मी Krish AI आहे. खरेदी, थेट रांग, स्लॉट किंवा शेतीविषयक माहितीसाठी मी आपली काय मदत करू शकतो?',
};

export default function ChatScreen() {
  const [language, setLanguage] = useState<Language>('english');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Initialize conversation with preferred language
  useEffect(() => {
    async function initUserContext() {
      const user = await getStoredUser();
      let preferredLang: Language = 'english';

      if (user?.preferred_language) {
        const langCode = user.preferred_language.toLowerCase();
        if (langCode === 'hi' || langCode === 'hindi') {
          preferredLang = 'hindi';
        } else if (langCode === 'mr' || langCode === 'marathi') {
          preferredLang = 'marathi';
        }
      }

      setLanguage(preferredLang);
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          text: WELCOME_MESSAGES[preferredLang],
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          suggestedQuestions: DEFAULT_SUGGESTIONS[preferredLang],
        },
      ]);
    }

    initUserContext();
  }, []);

  function handleLanguageChange(newLang: Language) {
    if (newLang === language) return;
    setLanguage(newLang);

    // Add a system welcome note for the newly selected language
    setMessages((prev) => [
      ...prev,
      {
        id: `lang-switch-${Date.now()}`,
        sender: 'bot',
        text: WELCOME_MESSAGES[newLang],
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedQuestions: DEFAULT_SUGGESTIONS[newLang],
      },
    ]);
  }

  async function handleSendMessage(textToSend?: string) {
    const rawText = textToSend !== undefined ? textToSend : inputText;
    const cleanText = rawText.trim();
    if (!cleanText || isTyping) return;

    setInputText('');
    setLastFailedMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = await getStoredToken();

      // Call the existing NestJS backend chatbot endpoint
      const response = await api.post<ChatbotApiResponse>(
        '/chatbot/chat',
        {
          message: cleanText,
          language,
        },
        token,
      );

      const replyText =
        response.response ||
        response.message ||
        (language === 'hindi'
          ? 'उत्तर प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।'
          : language === 'marathi'
          ? 'उत्तर मिळवणे शक्य नाही. कृपया पुन्हा प्रयत्न करा.'
          : 'Could not generate an answer right now.');

      const suggestions =
        (Array.isArray(response.suggested_questions) &&
          response.suggested_questions.length > 0 &&
          response.suggested_questions) ||
        (Array.isArray(response.suggestedQuestions) &&
          response.suggestedQuestions.length > 0 &&
          response.suggestedQuestions) ||
        DEFAULT_SUGGESTIONS[language];

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedQuestions: suggestions,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot message send error:', error);
      setLastFailedMessage(cleanText);

      const errorText =
        language === 'hindi'
          ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।'
          : language === 'marathi'
          ? 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.'
          : 'Failed to connect to Krish AI. Please check your network and retry.';

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleRetry() {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.botMessageRow,
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        )}

        <View style={styles.bubbleWrapper}>
          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.botBubble,
              item.isError && styles.errorBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.botMessageText,
                item.isError && styles.errorText,
              ]}
            >
              {item.text}
            </Text>

            <Text
              style={[
                styles.timestamp,
                isUser ? styles.userTimestamp : styles.botTimestamp,
              ]}
            >
              {item.timestamp}
            </Text>
          </View>

          {/* RETRY BUTTON FOR ERROR */}
          {item.isError && lastFailedMessage && (
            <Pressable
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>🔄 Retry</Text>
            </Pressable>
          )}

          {/* SUGGESTED QUESTION CHIPS */}
          {!isUser &&
            item.suggestedQuestions &&
            item.suggestedQuestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {item.suggestedQuestions.map((q, idx) => (
                  <Pressable
                    key={`${item.id}-q-${idx}`}
                    style={styles.suggestionChip}
                    onPress={() => handleSendMessage(q)}
                    disabled={isTyping}
                  >
                    <Text style={styles.suggestionText}>{q}</Text>
                  </Pressable>
                ))}
              </View>
            )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      {/* LANGUAGE SELECTOR PILLS */}
      <View style={styles.languageBar}>
        <Text style={styles.languageLabel}>Language:</Text>
        {(['english', 'hindi', 'marathi'] as Language[]).map((lang) => (
          <Pressable
            key={lang}
            style={[
              styles.langPill,
              language === lang && styles.activeLangPill,
            ]}
            onPress={() => handleLanguageChange(lang)}
          >
            <Text
              style={[
                styles.langPillText,
                language === lang && styles.activeLangPillText,
              ]}
            >
              {lang === 'english'
                ? 'English'
                : lang === 'hindi'
                ? 'हिंदी'
                : 'मराठी'}
            </Text>
          </Pressable>
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* MESSAGE LIST */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* TYPING INDICATOR */}
        {isTyping && (
          <View style={styles.typingIndicatorContainer}>
            <View style={styles.botAvatarSmall}>
              <Text style={styles.botAvatarTextSmall}>🤖</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#1F6B45" />
              <Text style={styles.typingText}>
                {language === 'hindi'
                  ? 'Krish AI सोच रहा है...'
                  : language === 'marathi'
                  ? 'Krish AI विचार करत आहे...'
                  : 'Krish AI is typing...'}
              </Text>
            </View>
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              language === 'hindi'
                ? 'अपना प्रश्न यहाँ लिखें...'
                : language === 'marathi'
                ? 'आपला प्रश्न येथे लिहा...'
                : 'Ask about queues, slots, mandi rates...'
            }
            placeholderTextColor="#8A938D"
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={() => handleSendMessage()}
            editable={!isTyping}
          />

          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },

  keyboardContainer: {
    flex: 1,
  },

  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAE6',
  },

  languageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#68736B',
    marginRight: 10,
  },

  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F0F2EE',
    marginRight: 8,
  },

  activeLangPill: {
    backgroundColor: '#1F6B45',
  },

  langPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },

  activeLangPillText: {
    color: '#FFFFFF',
  },

  listContent: {
    padding: 16,
    paddingBottom: 20,
  },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  userMessageRow: {
    justifyContent: 'flex-end',
  },

  botMessageRow: {
    justifyContent: 'flex-start',
  },

  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCEDE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },

  botAvatarText: {
    fontSize: 18,
  },

  bubbleWrapper: {
    maxWidth: '82%',
  },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  userBubble: {
    backgroundColor: '#1F6B45',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },

  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E6EAE6',
  },

  errorBubble: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  userMessageText: {
    color: '#FFFFFF',
  },

  botMessageText: {
    color: '#111111',
  },

  errorText: {
    color: '#C62828',
  },

  timestamp: {
    fontSize: 10,
    marginTop: 6,
  },

  userTimestamp: {
    color: '#D4E8DC',
    textAlign: 'right',
  },

  botTimestamp: {
    color: '#8A938D',
    textAlign: 'left',
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C62828',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 6,
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C62828',
  },

  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B9D5C4',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 6,
    marginBottom: 6,
  },

  suggestionText: {
    fontSize: 12,
    color: '#1F6B45',
    fontWeight: '600',
  },

  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  botAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCEDE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  botAvatarTextSmall: {
    fontSize: 14,
  },

  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EAE6',
  },

  typingText: {
    fontSize: 13,
    color: '#68736B',
    marginLeft: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EAE6',
  },

  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F5F7F4',
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#111111',
    borderWidth: 1,
    borderColor: '#E0E5DF',
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F6B45',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  sendButtonDisabled: {
    backgroundColor: '#A8C3B3',
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 2,
  },

  buttonPressed: {
    opacity: 0.8,
  },
});
