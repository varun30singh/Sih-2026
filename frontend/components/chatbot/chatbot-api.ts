/**
 * MandiSetu Chatbot API Client
 * Connects the frontend to the NestJS chatbot backend.
 */

export interface ChatHealthStatus {
  isOnline: boolean;
  status: string;
  database?: string;
  chatbot?: string;
  endpoint?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  response: string;
  language: string;
  suggestedQuestions: string[];
}

// Next.js rewrite proxies this to:
// http://localhost:4000/api/chatbot
const CHATBOT_BASE_URL = '/api/chatbot';

let activeApiBase = CHATBOT_BASE_URL;

/**
 * Check whether the NestJS chatbot backend is online.
 */
export async function checkChatbotHealth(): Promise<ChatHealthStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${CHATBOT_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Health check failed: HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.status === 'healthy' || data.status === 'online') {
      activeApiBase = CHATBOT_BASE_URL;

      return {
        isOnline: true,
        status: data.status,
        database: data.database || 'connected',
        chatbot: data.chatbot || 'connected',
        endpoint: CHATBOT_BASE_URL,
      };
    }

    return {
      isOnline: false,
      status: 'offline',
      endpoint: CHATBOT_BASE_URL,
    };
  } catch (error) {
    console.error('Chatbot health check failed:', error);

    return {
      isOnline: false,
      status: 'offline',
      endpoint: CHATBOT_BASE_URL,
    };
  }
}

/**
 * Send a message to the NestJS chatbot.
 */
export async function sendChatbotMessage(
  message: string,
  language: 'english' | 'hindi' | 'marathi' = 'english',
  contextToken?: string
): Promise<ChatResponse> {
  // Make sure the backend is reachable.
  const health = await checkChatbotHealth();

  if (!health.isOnline) {
    const errorMsg =
      language === 'hindi'
        ? 'क्षमा करें, MandiSetu सहायक सर्वर अभी उपलब्ध नहीं है। कृपया कुछ क्षणों बाद पुनः प्रयास करें।'
        : language === 'marathi'
        ? 'माफ करा, MandiSetu सहाय्यक सर्व्हर सध्या उपलब्ध नाही. कृपया काही वेळानंतर पुन्हा प्रयत्न करा.'
        : 'I’m unable to connect to the MandiSetu assistant right now. Please try again in a moment.';

    return {
      success: false,
      message,
      response: errorMsg,
      language,
      suggestedQuestions: getDefaultSuggestions(language),
    };
  }

  let outgoingMessage = message.trim();

  // Add token context when appropriate.
  if (contextToken && !outgoingMessage.includes(contextToken)) {
    const isTokenQuestion =
      /token|wait|queue|turn|status|समय|टोकन|कतार|वेळ|रांग/i.test(
        outgoingMessage
      );

    if (isTokenQuestion) {
      outgoingMessage = `${outgoingMessage} (Context: Token ${contextToken})`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${activeApiBase}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message: outgoingMessage,
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(
        `Chatbot returned HTTP ${res.status}${errorText ? `: ${errorText}` : ''}`
      );
    }

    const data = await res.json();

    return {
      success: data.success !== false,
      message,
      response:
        data.response ||
        data.message ||
        'Sorry, I could not generate a response.',
      language: data.language || language,
      suggestedQuestions:
        Array.isArray(data.suggested_questions) &&
        data.suggested_questions.length > 0
          ? data.suggested_questions
          : Array.isArray(data.suggestedQuestions) &&
            data.suggestedQuestions.length > 0
          ? data.suggestedQuestions
          : getDefaultSuggestions(language),
    };
  } catch (error) {
    console.error('MandiSetu Chatbot Request Error:', error);

    const fallbackMsg =
      language === 'hindi'
        ? 'नेटवर्क त्रुटि के कारण आपका संदेश संसाधित नहीं हो सका। कृपया पुनः प्रयास करें।'
        : language === 'marathi'
        ? 'नेटवर्क त्रुटीमुळे तुमचा संदेश पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.'
        : 'Sorry, I couldn’t process that request right now. Please try again.';

    return {
      success: false,
      message,
      response: fallbackMsg,
      language,
      suggestedQuestions: getDefaultSuggestions(language),
    };
  }
}

/**
 * Default suggested questions.
 */
export function getDefaultSuggestions(
  language: 'english' | 'hindi' | 'marathi' = 'english'
): string[] {
  switch (language) {
    case 'hindi':
      return [
        'विलंबित प्रोक्योरमेंट दिखाएं',
        'मेरा टोकन M-142 कहाँ है?',
        'कतार में कितना समय लगेगा?',
        'सबसे कम प्रतीक्षा वाला केंद्र कौन सा है?',
        'प्रोक्योरमेंट का सारांश बताएं',
      ];

    case 'marathi':
      return [
        'विलंबित खरेदी दाखवा',
        'माझा टोकन M-142 कुठे आहे?',
        'रांगेत किती वेळ लागेल?',
        'सर्वात कमी प्रतीक्षा असलेले केंद्र कोणते?',
        'खरेदीचा सारांश द्या',
      ];

    case 'english':
    default:
      return [
        'Show me delayed procurements',
        'Where is my token M-142?',
        'How long is the waiting time?',
        'Which procurement centre has less waiting?',
        'Give me a procurement summary',
      ];
  }
}