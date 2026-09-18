"""
ProcureAI Configuration
Hybrid LLM + Python + SQLite Architecture
"""

import os
from dotenv import load_dotenv

load_dotenv()


# ============================================================
# PROJECT PATHS
# ============================================================

CHATBOT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(CHATBOT_DIR)

DATABASE_DIR = os.path.join(PROJECT_DIR, "database")
DATABASE_PATH = os.path.join(DATABASE_DIR, "procurement.db")


# ============================================================
# LLM CONFIGURATION
# ============================================================

# LLM_PROVIDER can later be changed depending on the provider.
# Examples:
#   openai
#   gemini
#   ollama
#
# For now, keep this as "openai".
LLM_PROVIDER = os.getenv("PROCUREAI_LLM_PROVIDER", "openai")


# API key should NEVER be written directly into Python code.
LLM_API_KEY = os.getenv("PROCUREAI_LLM_API_KEY", "").strip()


# Model name can be changed without modifying llm.py.
LLM_MODEL = os.getenv(
    "PROCUREAI_LLM_MODEL",
    "gpt-5-mini"
)


# Maximum time allowed for an LLM request.
LLM_TIMEOUT = int(
    os.getenv("PROCUREAI_LLM_TIMEOUT", "30")
)


# Enable/disable LLM completely.
#
# If disabled:
#     ProcureAI uses the local Python/rule-based engine.
#
# If enabled:
#     ProcureAI tries the LLM first and falls back
#     to the local engine if the LLM fails.
LLM_ENABLED = os.getenv(
    "PROCUREAI_LLM_ENABLED",
    "true"
).lower() in ("1", "true", "yes", "on")


# ============================================================
# GEMINI CONFIGURATION (AGRICULTURAL INTELLIGENCE)
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Default to current stable flash model (gemini-3.8-flash)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
if not GEMINI_MODEL or GEMINI_MODEL in ["gemini-2.5-flash", "gemini-2.0-flash"]:
    GEMINI_MODEL = "gemini-3.8-flash"


GEMINI_TIMEOUT = int(os.getenv("GEMINI_TIMEOUT", "30"))

GEMINI_ENABLED = os.getenv(
    "GEMINI_ENABLED",
    "true"
).lower() in ("1", "true", "yes", "on") and bool(GEMINI_API_KEY)


# ============================================================
# WEB SEARCH CONFIGURATION
# ============================================================

WEB_SEARCH_API_KEY = os.getenv("WEB_SEARCH_API_KEY", "").strip()
WEB_SEARCH_PROVIDER = os.getenv("WEB_SEARCH_PROVIDER", "tavily").strip().lower()
WEB_SEARCH_TIMEOUT = int(os.getenv("WEB_SEARCH_TIMEOUT", "15"))


# ============================================================
# ASSISTANT CONFIGURATION
# ============================================================

BOT_NAME = "ProcureAI"

DEBUG_MODE = os.getenv(
    "PROCUREAI_DEBUG",
    "0"
).lower() in ("1", "true", "yes", "on")


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DATABASE_TIMEOUT = int(
    os.getenv("PROCUREAI_DATABASE_TIMEOUT", "10")
)


# ============================================================
# SAFETY CONFIGURATION
# ============================================================

# The LLM is NEVER allowed to invent procurement values.
#
# All factual procurement information must come from:
#
#       SQLite → Python → verified result
#
# The LLM is only responsible for understanding and
# communicating the result.

LLM_MUST_USE_DATABASE_FACTS = True


# ============================================================
# FALLBACK CONFIGURATION
# ============================================================

# If the LLM is unavailable, ProcureAI automatically
# falls back to the local assistant engine.

ENABLE_LOCAL_FALLBACK = True


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_config():
    """
    Return the current ProcureAI configuration.
    Useful for debugging.
    """

    return {
        "bot_name": BOT_NAME,
        "llm_provider": LLM_PROVIDER,
        "llm_enabled": LLM_ENABLED,
        "llm_model": LLM_MODEL,
        "llm_api_key_configured": bool(LLM_API_KEY),
        "gemini_configured": bool(GEMINI_API_KEY),
        "gemini_model": GEMINI_MODEL,
        "gemini_enabled": GEMINI_ENABLED,
        "database_path": DATABASE_PATH,
        "database_exists": os.path.exists(DATABASE_PATH),
        "debug_mode": DEBUG_MODE,
        "fallback_enabled": ENABLE_LOCAL_FALLBACK,
    }


def print_config():
    """
    Print safe configuration information.

    API keys are intentionally never displayed.
    """

    config = get_config()

    print("=" * 65)
    print("⚙️  PROCUREAI CONFIGURATION")
    print("=" * 65)

    for key, value in config.items():
        print(f"{key}: {value}")

    print("=" * 65)