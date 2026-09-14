/**
 * MandiSetu Integrated ProcureAI Chatbot API Client
 * Connects frontend directly to the existing ProcureAI Python Intelligence backend.
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

const CANDIDATE_BASE_URLS = [
  // 1. Direct local Python Flask server
  'http://127.0.0.1:5000/api',
  // 2. Next.js internal rewrite proxy
  '/api/chatbot',
  // 3. Localhost hostname fallback
  'http://localhost:5000/api',
];

let activeApiBase = 'http://127.0.0.1:5000/api';

/**
 * Verifies live connection to the ProcureAI chatbot backend.
 * Dynamically identifies the reachable endpoint and accurately reports online/offline state.
 */
export async function checkChatbotHealth(): Promise<ChatHealthStatus> {
  for (const base of CANDIDATE_BASE_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${base}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'healthy' || data.status === 'online') {
          activeApiBase = base;
          return {
            isOnline: true,
            status: 'healthy',
            database: data.database || 'connected',
            chatbot: data.chatbot || 'connected',
            endpoint: base,
          };
        }
      }
    } catch {
      // Continue to next candidate URL
    }
  }

  return {
    isOnline: false,
    status: 'offline',
    endpoint: activeApiBase,
  };
}

/**
 * Sends a message to the ProcureAI assistant and returns the AI response with follow-up suggestions.
 */
export async function sendChatbotMessage(
  message: string,
  language: 'english' | 'hindi' | 'marathi' = 'english',
  contextToken?: string
): Promise<ChatResponse> {
  // Check health and locate active endpoint
  const health = await checkChatbotHealth();
  if (!health.isOnline) {
    const errorMsg =
      language === 'hindi'
        ? 'क्षमा करें, ProcureAI सहायक सर्वर अभी उपलब्ध नहीं है। कृपया कुछ क्षणों बाद पुनः प्रयास करें।'
        : language === 'marathi'
        ? 'माफ करा, ProcureAI सहाय्यक सर्व्हर सध्या उपलब्ध नाही. कृपया काही वेळानंतर पुन्हा प्रयत्न करा.'
        : 'I’m unable to connect to the ProcureAI server right now. Please check if the backend is running and try again.';

    return {
      success: false,
      message,
      response: errorMsg,
      language,
      suggestedQuestions: getDefaultSuggestions(language),
    };
  }

  // Prepend context hint if token is known and user question is vague
  let outgoingMessage = message.trim();
  if (contextToken && !outgoingMessage.includes(contextToken)) {
    const isTokenQuestion = /token|wait|queue|turn|status|समय|टोकन|कतार|वेळ/i.test(outgoingMessage);
    if (isTokenQuestion) {
      outgoingMessage = `${outgoingMessage} (Context: Token ${contextToken})`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${activeApiBase}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: outgoingMessage,
        language,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      message,
      response: data.response || 'No response generated.',
      language: data.language || language,
      suggestedQuestions: data.suggested_questions && data.suggested_questions.length > 0
        ? data.suggested_questions
        : getDefaultSuggestions(language),
    };
  } catch (err: any) {
    console.error('ProcureAI Message Request Error:', err);
    const fallbackMsg =
      language === 'hindi'
        ? 'नेटवर्क त्रुटि के कारण आपका संदेश संसाधित नहीं हो सका। कृपया पुनः प्रयास करें।'
        : language === 'marathi'
        ? 'नेटवर्क त्रुटीमुळे तुमचा संदेश पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.'
        : 'Sorry, I couldn’t process that request right now. Please verify your connection and try again.';

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
 * Default fallback questions by language.
 */
export function getDefaultSuggestions(language: 'english' | 'hindi' | 'marathi' = 'english'): string[] {
  switch (language) {
    case 'hindi':
      return [
        'विलंबित प्रोक्योरमेंट दिखाएं',
        'मेरा टोकन M-142 कहाँ है?',
        'कतार में कितना समय लगेगा?',
        'सबसे महत्वपूर्ण प्रोक्योरमेंट कौन सा है?',
        'प्रोक्योरमेंट का सारांश बताएं',
      ];
    case 'marathi':
      return [
        'विलंबित खरेदी दाखवा',
        'माझा टोकन M-142 कुठे आहे?',
        'रांगेत किती वेळ लागेल?',
        'सर्वात तातडीची खरेदी कोणती आहे?',
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
