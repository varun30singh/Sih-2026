// =========================================================
// PROCUREAI FRONTEND
// SIH26032 - Multilingual Procurement Assistant
// =========================================================

// =========================================================
// API CONFIGURATION
// =========================================================

// Determine API base URL dynamically:
// - Empty string when served from Flask on port 5000 (uses relative path)
// - http://127.0.0.1:5000 when opened via file:// or Live Server
const API_BASE = (
    window.location.protocol.startsWith("http") &&
    (window.location.port === "5000" || window.location.port === "")
) ? "" : `http://${window.location.hostname || "127.0.0.1"}:5000`;


// =========================================================
// LOCALIZATION DATA
// =========================================================

const SUPPORTED_LANGUAGES = {
    english: {
        code: "english",
        name: "English",
        flag: "🇬🇧",
        placeholder: "Ask anything about procurement..."
    },
    hindi: {
        code: "hindi",
        name: "हिन्दी",
        flag: "🇮🇳",
        placeholder: "संदेश टाइप करें... (Type a message...)"
    },
    marathi: {
        code: "marathi",
        name: "मराठी",
        flag: "🇲🇭",
        placeholder: "संदेश टाइप करा... (Type a message...)"
    }
};

const WELCOME_MESSAGES = {
    english: {
        title: "Hello! I’m ProcureAI.",
        description: "I can help you analyze your procurement data and identify risks, delays, supplier performance, and financial exposure.\n\nWhat would you like to know?"
    },
    hindi: {
        title: "नमस्कार! मैं ProcureAI हूँ।",
        description: "मैं आपके procurement data का विश्लेषण करने और risks, delays, supplier performance और financial exposure को समझने में आपकी मदद कर सकता हूँ।\n\nआप क्या जानना चाहते हैं?"
    },
    marathi: {
        title: "नमस्कार! मी ProcureAI आहे.",
        description: "मी तुमच्या procurement डेटाचे विश्लेषण करून risks, delays, supplier performance आणि financial exposure समजून घेण्यास मदत करू शकतो.\n\nतुम्हाला काय जाणून घ्यायचे आहे?"
    }
};

const SUGGESTIONS_HEADER_LABELS = {
    english: "Suggested questions",
    hindi: "सुझाए गए सवाल",
    hinglish: "Suggested questions",
    marathi: "सुचवलेले प्रश्न",
    marathi_english: "Suggested questions"
};

const SUGGESTED_QUESTIONS = {
    english: {
        header: "💡 Suggested questions",
        questions: [
            "What is the procurement score?",
            "Which supplier has the most delays?",
            "What is the total procurement value?",
            "Which supplier is performing best?"
        ]
    },
    hindi: {
        header: "💡 सुझाए गए सवाल",
        questions: [
            "हमारा प्रोक्योरमेंट हेल्थ स्कोर क्या है?",
            "सबसे ज्यादा देरी किस supplier की है?",
            "कुल प्रोक्योरमेंट खर्च कितना है?",
            "सबसे अच्छा प्रदर्शन किस supplier का है?"
        ]
    },
    hinglish: {
        header: "💡 Suggested questions",
        questions: [
            "Humara procurement health score kya hai?",
            "Sabse zyada delays kis supplier ke hain?",
            "Total procurement cost kitna hai?",
            "Sabse achha performance kis supplier ka hai?"
        ]
    },
    marathi: {
        header: "💡 सुचवलेले प्रश्न",
        questions: [
            "आमचा प्रोक्योरमेंट हेल्थ स्कोअर किती आहे?",
            "सर्वाधिक विलंब कोणत्या supplier चा आहे?",
            "एकूण खरेदी खर्च किती आहे?",
            "सर्वोत्तम कामगिरी कोणत्या supplier ची आहे?"
        ]
    },
    marathi_english: {
        header: "💡 Suggested questions",
        questions: [
            "Aamcha procurement health score kiti aahe?",
            "Saglyat jast delays konache aahet?",
            "Total procurement cost kiti aahe?",
            "Saglyat changla supplier konta aahe?"
        ]
    }
};

function getFallbackSuggestions(lang) {
    const fallbacks = {
        english: [
            "What is our procurement health score?",
            "Which supplier has the most delays?",
            "Which supplier is performing best?",
            "Which orders are critical?"
        ],
        hindi: [
            "हमारा प्रोक्योरमेंट हेल्थ स्कोर क्या है?",
            "सबसे ज्यादा देरी किस supplier की है?",
            "सबसे अच्छा प्रदर्शन किस supplier का है?",
            "कौनसे orders critical हैं?"
        ],
        hinglish: [
            "Humara procurement health score kya hai?",
            "Sabse zyada delays kis supplier ke hain?",
            "Sabse achha performance kis supplier ka hai?",
            "Kaunse orders critical hain?"
        ],
        marathi: [
            "आमचा प्रोक्योरमेंट हेल्थ स्कोअर किती आहे?",
            "सर्वाधिक विलंब कोणत्या supplier चा आहे?",
            "सर्वोत्तम कामगिरी कोणत्या supplier ची आहे?",
            "कोणते orders critical आहेत?"
        ],
        marathi_english: [
            "Aamcha procurement health score kiti aahe?",
            "Saglyat jast delays konache aahet?",
            "Saglyat changla supplier konta aahe?",
            "Kontya orders critical aahet?"
        ]
    };
    return fallbacks[lang] || fallbacks.english;
}


// =========================================================
// APPLICATION STATE
// =========================================================

let currentLanguage = null;
let conversationStarted = false;
let isProcessing = false;


// =========================================================
// DOM ELEMENTS
// =========================================================

const languageScreen = document.getElementById("languageScreen");
const chatScreen = document.getElementById("chatScreen");

const chatArea = document.getElementById("chatArea");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const welcome = document.getElementById("welcome");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeDescription = document.getElementById("welcomeDescription");

const suggestionsWrapper = document.getElementById("suggestionsWrapper");
const suggestionsHeader = document.getElementById("suggestionsHeader");
const suggestionsContainer = document.getElementById("suggestions");

const headerLangWrapper = document.getElementById("headerLangWrapper");
const headerLangBtn = document.getElementById("headerLangBtn");
const headerLangFlag = document.getElementById("headerLangFlag");
const headerLangText = document.getElementById("headerLangText");
const headerLangDropdown = document.getElementById("headerLangDropdown");

const sidebarStatus = document.getElementById("sidebarStatus");
const sidebarStatusText = document.getElementById("sidebarStatusText");
const headerStatus = document.getElementById("headerStatus");
const headerStatusText = document.getElementById("headerStatusText");


// =========================================================
// LANGUAGE SELECTION & SESSION MANAGEMENT
// =========================================================

/**
 * Switch session language when user clicks an option on the language-selection screen.
 */
function selectLanguage(lang) {
    if (!SUPPORTED_LANGUAGES[lang]) {
        lang = "english";
    }

    currentLanguage = lang;
    sessionStorage.setItem("procureai_language", lang);

    // Update Header Language Badge
    updateHeaderLanguageDisplay(lang);

    // Render Localized Welcome & Suggestions
    renderWelcomeContent(lang);
    renderSuggestions(lang);

    // Update Placeholder
    if (messageInput && SUPPORTED_LANGUAGES[lang]) {
        messageInput.placeholder = SUPPORTED_LANGUAGES[lang].placeholder;
    }

    // Smooth transition from Language Selection Screen to Chat Screen
    if (languageScreen) {
        languageScreen.style.display = "none";
    }

    if (chatScreen) {
        chatScreen.style.display = "flex";
    }

    if (messageInput) {
        messageInput.focus();
    }
}

/**
 * Switch language mid-session from the header dropdown without clearing history.
 */
function changeSessionLanguage(lang) {
    if (!SUPPORTED_LANGUAGES[lang]) return;

    currentLanguage = lang;
    sessionStorage.setItem("procureai_language", lang);

    updateHeaderLanguageDisplay(lang);

    // Close Dropdown
    closeLanguageDropdown();

    // If chat hasn't started yet, refresh welcome & suggested questions
    if (!conversationStarted) {
        renderWelcomeContent(lang);
        renderSuggestions(lang);
    }

    // Update Placeholder
    if (messageInput && SUPPORTED_LANGUAGES[lang]) {
        messageInput.placeholder = SUPPORTED_LANGUAGES[lang].placeholder;
    }

    if (messageInput) {
        messageInput.focus();
    }
}

/**
 * Update Header language button & active checkmark in the dropdown.
 */
function updateHeaderLanguageDisplay(lang) {
    const langObj = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.english;

    if (headerLangFlag) headerLangFlag.textContent = langObj.flag;
    if (headerLangText) headerLangText.textContent = langObj.name;

    // Update Checkmarks in dropdown menu
    ["english", "hindi", "marathi"].forEach(l => {
        const checkEl = document.getElementById(`check-${l}`);
        const itemEl = document.getElementById(`menu-lang-${l}`);

        if (checkEl) {
            checkEl.textContent = (l === lang) ? "✓" : "";
        }
        if (itemEl) {
            if (l === lang) {
                itemEl.classList.add("active");
            } else {
                itemEl.classList.remove("active");
            }
        }
    });
}

/**
 * Render localized welcome message.
 */
function renderWelcomeContent(lang) {
    const msg = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.english;

    if (welcomeTitle) {
        welcomeTitle.textContent = msg.title;
    }

    if (welcomeDescription) {
        welcomeDescription.textContent = msg.description;
    }
}

/**
 * Render clickable suggested questions for the selected language.
 */
function renderSuggestions(lang) {
    const data = SUGGESTED_QUESTIONS[lang] || SUGGESTED_QUESTIONS.english;

    if (suggestionsHeader) {
        suggestionsHeader.textContent = data.header;
    }

    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = "";

        data.questions.forEach((q, index) => {
            const button = document.createElement("button");
            button.className = "suggestion-card";
            button.type = "button";
            button.setAttribute("aria-label", q);

            // Escape HTML characters safely
            const safeText = document.createTextNode(q);

            const numSpan = document.createElement("span");
            numSpan.className = "suggestion-num";
            numSpan.textContent = (index + 1).toString();

            const textSpan = document.createElement("span");
            textSpan.className = "suggestion-label";
            textSpan.appendChild(safeText);

            button.appendChild(numSpan);
            button.appendChild(textSpan);

            button.addEventListener("click", () => {
                sendSuggestion(q);
            });

            suggestionsContainer.appendChild(button);
        });
    }
}

/**
 * Show the language selection screen.
 * @param {boolean} resetChat - If true, resets conversation.
 */
function showLanguageSelection(resetChat = false) {
    if (resetChat) {
        // Clear all conversation messages
        const messages = chatArea.querySelectorAll(".chat-message");
        messages.forEach(m => m.remove());

        // Restore welcome and suggestions
        if (welcome) welcome.style.display = "";
        if (suggestionsWrapper) suggestionsWrapper.style.display = "";

        // Reset conversation state
        conversationStarted = false;
        currentLanguage = null;
        sessionStorage.removeItem("procureai_language");

        if (messageInput) {
            messageInput.value = "";
            messageInput.style.height = "auto";
        }
    }

    if (chatScreen) chatScreen.style.display = "none";
    if (languageScreen) languageScreen.style.display = "flex";
}

/**
 * Open Assistant view from sidebar.
 */
function openAssistantView() {
    if (currentLanguage) {
        if (languageScreen) languageScreen.style.display = "none";
        if (chatScreen) chatScreen.style.display = "flex";
        if (messageInput) messageInput.focus();
    } else {
        showLanguageSelection(false);
    }
}


// =========================================================
// HEADER DROPDOWN TOGGLING
// =========================================================

function toggleLanguageDropdown(event) {
    if (event) {
        event.stopPropagation();
    }

    if (!headerLangDropdown) return;

    const isOpen = headerLangDropdown.classList.contains("open");
    if (isOpen) {
        closeLanguageDropdown();
    } else {
        openLanguageDropdown();
    }
}

function openLanguageDropdown() {
    if (headerLangDropdown) {
        headerLangDropdown.classList.add("open");
    }
    if (headerLangBtn) {
        headerLangBtn.classList.add("open");
        headerLangBtn.setAttribute("aria-expanded", "true");
    }
}

function closeLanguageDropdown() {
    if (headerLangDropdown) {
        headerLangDropdown.classList.remove("open");
    }
    if (headerLangBtn) {
        headerLangBtn.classList.remove("open");
        headerLangBtn.setAttribute("aria-expanded", "false");
    }
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (headerLangWrapper && !headerLangWrapper.contains(e.target)) {
        closeLanguageDropdown();
    }
});

// Close dropdown on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeLanguageDropdown();
    }
});


// =========================================================
// SYSTEM HEALTH CHECK
// =========================================================

async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === "healthy") {
                setSystemStatus(true);
                return;
            }
        }
        setSystemStatus(false);
    } catch (error) {
        setSystemStatus(false);
    }
}

function setSystemStatus(isOnline) {
    if (sidebarStatus) {
        if (isOnline) {
            sidebarStatus.classList.remove("offline");
            if (sidebarStatusText) sidebarStatusText.textContent = "System Online";
        } else {
            sidebarStatus.classList.add("offline");
            if (sidebarStatusText) sidebarStatusText.textContent = "System Offline";
        }
    }

    if (headerStatus) {
        if (isOnline) {
            headerStatus.classList.remove("offline");
            if (headerStatusText) headerStatusText.textContent = "Online";
        } else {
            headerStatus.classList.add("offline");
            if (headerStatusText) headerStatusText.textContent = "Offline";
        }
    }
}

checkBackendHealth();
setInterval(checkBackendHealth, 10000);


// =========================================================
// SEND MESSAGE & BACKEND COMMUNICATION
// =========================================================

async function sendMessage(message = null) {
    // Prevent duplicate simultaneous requests
    if (isProcessing) {
        return;
    }

    if (message === null) {
        message = messageInput ? messageInput.value.trim() : "";
    } else {
        message = String(message).trim();
    }

    // Ignore empty messages
    if (!message) {
        return;
    }

    // Ensure we are in chat view
    if (languageScreen && languageScreen.style.display !== "none") {
        languageScreen.style.display = "none";
    }
    if (chatScreen && chatScreen.style.display === "none") {
        chatScreen.style.display = "flex";
    }

    // Default language to english if somehow not set
    if (!currentLanguage) {
        currentLanguage = "english";
        updateHeaderLanguageDisplay(currentLanguage);
    }

    // Hide welcome message & suggestions on first question
    if (welcome) welcome.style.display = "none";
    if (suggestionsWrapper) suggestionsWrapper.style.display = "none";
    conversationStarted = true;

    // Render user message bubble
    addMessage(message, "user");

    // Clear input
    if (messageInput) {
        messageInput.value = "";
        messageInput.style.height = "auto";
    }

    // Disable send button while waiting
    // Disable any previous inline suggestion chips to prevent duplicate actions
    document.querySelectorAll(".inline-suggestions-container .suggestion-chip").forEach(chip => {
        chip.disabled = true;
        chip.classList.add("disabled");
    });

    // Disable send button while waiting
    isProcessing = true;
    if (sendButton) {
        sendButton.disabled = true;
    }

    // Show typing indicator
    showTyping();

    try {
        // Send message + selected response language to Flask backend
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                language: currentLanguage
            })
        });

        const data = await response.json();

        removeTyping();

        if (response.ok && data.success) {
            setSystemStatus(true);
            if (data.language && data.language !== currentLanguage) {
                currentLanguage = data.language;
            }
            addMessage(data.response, "bot", data.suggested_questions);
        } else {
            // Clean friendly error message - NEVER expose raw internal stack traces
            addMessage(
                "Sorry, I couldn’t process that request right now. Please try again.",
                "bot",
                getFallbackSuggestions(currentLanguage)
            );
        }

    } catch (error) {
        console.error("ProcureAI Request Error:", error);
        setSystemStatus(false);
        removeTyping();

        // Safe user-facing error message
        addMessage(
            "Sorry, I couldn’t process that request right now. Please check if the ProcureAI backend is running and try again.",
            "bot",
            getFallbackSuggestions(currentLanguage)
        );
    } finally {
        isProcessing = false;
        if (sendButton) {
            sendButton.disabled = false;
        }
        if (messageInput) {
            messageInput.focus();
        }
    }
}


// =========================================================
// MESSAGE DISPLAY & SANITIZATION
// =========================================================

function addMessage(message, sender, suggestedQuestions = null) {
    if (!chatArea) return;

    // Deactivate previous suggestion chips so only the latest answer's suggestions are interactive
    document.querySelectorAll(".inline-suggestions-container .suggestion-chip").forEach(chip => {
        chip.disabled = true;
        chip.classList.add("disabled");
    });

    const messageContainer = document.createElement("div");
    messageContainer.classList.add("chat-message", "message", sender);

    const messageBubble = document.createElement("div");
    messageBubble.classList.add("message-bubble", "message-content");

    // Safe text node assignment to prevent XSS / unsafe HTML injection
    messageBubble.textContent = message;

    messageContainer.appendChild(messageBubble);
    chatArea.appendChild(messageContainer);

    // ONLY AFTER the answer has finished rendering, display new suggested questions
    if (sender === "bot" && Array.isArray(suggestedQuestions) && suggestedQuestions.length > 0) {
        const suggestionsBox = document.createElement("div");
        suggestionsBox.classList.add("inline-suggestions-container");

        const header = document.createElement("div");
        header.classList.add("inline-suggestions-header");
        const headerText = SUGGESTIONS_HEADER_LABELS[currentLanguage] || "Suggested questions";
        header.innerHTML = `<span class="sparkle-icon">💡</span> <span>${headerText}</span>`;
        suggestionsBox.appendChild(header);

        const chipsList = document.createElement("div");
        chipsList.classList.add("inline-suggestions-chips");

        suggestedQuestions.forEach(q => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.classList.add("suggestion-chip");
            chip.textContent = q;
            chip.setAttribute("aria-label", q);

            chip.addEventListener("click", () => {
                // Immediately disable chips in this box to prevent multiple rapid clicks
                chipsList.querySelectorAll(".suggestion-chip").forEach(btn => {
                    btn.disabled = true;
                    btn.classList.add("disabled");
                });
                sendSuggestion(q);
            });

            chipsList.appendChild(chip);
        });

        suggestionsBox.appendChild(chipsList);
        messageContainer.appendChild(suggestionsBox);
    }

    scrollToBottom();
}


// =========================================================
// TYPING INDICATOR
// =========================================================

function showTyping() {
    if (document.getElementById("typingIndicator") || !chatArea) {
        return;
    }

    const typing = document.createElement("div");
    typing.id = "typingIndicator";
    typing.classList.add("chat-message", "message", "bot");

    typing.innerHTML = `
        <div class="message-bubble message-content typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatArea.appendChild(typing);
    scrollToBottom();
}

function removeTyping() {
    const typing = document.getElementById("typingIndicator");
    if (typing) {
        typing.remove();
    }
}

function scrollToBottom() {
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}


// =========================================================
// SUGGESTIONS & QUICK ACTIONS
// =========================================================

function sendSuggestion(message) {
    sendMessage(message);
}

function handleQuickAction(message) {
    if (!currentLanguage) {
        // If user hasn't selected language yet, default to English
        currentLanguage = "english";
        sessionStorage.setItem("procureai_language", currentLanguage);
        updateHeaderLanguageDisplay(currentLanguage);
    }
    sendMessage(message);
}


// =========================================================
// NEW CHAT
// =========================================================

function newChat() {
    showLanguageSelection(true);
}


// =========================================================
// EVENT LISTENERS
// =========================================================

if (sendButton) {
    sendButton.addEventListener("click", () => {
        sendMessage();
    });
}

if (messageInput) {
    messageInput.addEventListener("keydown", (event) => {
        // ENTER = SEND, SHIFT + ENTER = NEW LINE
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 140) + "px";
    });
}


// =========================================================
// INITIALIZATION ON PAGE LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    // Check if session has a previously selected language
    const savedLang = sessionStorage.getItem("procureai_language");

    if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
        // Resume session with saved language
        selectLanguage(savedLang);
    } else {
        // First time / fresh session: show Language Selection Screen
        showLanguageSelection(false);
    }
});


// =========================================================
// GLOBAL API HELPER FOR DEBUGGING / SIH DEMO
// =========================================================

window.ProcureAPI = {
    apiBase: API_BASE,
    checkHealth: checkBackendHealth,
    getLanguage: () => currentLanguage,
    setLanguage: (l) => changeSessionLanguage(l),
    showLanguageScreen: () => showLanguageSelection(false),
    newChat: () => newChat(),
    async getProcurements() {
        const res = await fetch(`${API_BASE}/api/procurements`);
        return res.json();
    },
    async getDelayed() {
        const res = await fetch(`${API_BASE}/api/procurements/delayed`);
        return res.json();
    },
    async getUrgent() {
        const res = await fetch(`${API_BASE}/api/procurements/urgent`);
        return res.json();
    },
    async getUpcoming() {
        const res = await fetch(`${API_BASE}/api/procurements/upcoming`);
        return res.json();
    },
    async getSummary() {
        const res = await fetch(`${API_BASE}/api/summary`);
        return res.json();
    },
    async sendChatMessage(msg) {
        return sendMessage(msg);
    }
};