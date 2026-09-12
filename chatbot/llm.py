# chatbot/llm.py

import json
import urllib.request
import urllib.error

try:
    from .config import (
        LLM_API_KEY,
        LLM_MODEL,
        LLM_TIMEOUT,
        LLM_ENABLED,
        LLM_PROVIDER,
    )
except (ImportError, ValueError):
    from config import (
        LLM_API_KEY,
        LLM_MODEL,
        LLM_TIMEOUT,
        LLM_ENABLED,
        LLM_PROVIDER,
    )


# =========================================================
# DEFAULT NLU RESULT
# =========================================================

def default_nlu_result():
    return {
        "success": False,
        "language": "unknown",
        "confidence": 0.0,
        "intent": "unknown",
        "procurement_id": None,
        "supplier": None,
        "item": None,
        "is_follow_up": False,
        "follow_up_target": None,
        "reason": None,
    }


# =========================================================
# SYSTEM PROMPT
# =========================================================

SYSTEM_PROMPT = """
You are the Natural Language Understanding engine for ProcureAI,
an intelligent procurement scheduling assistant.

Your job is ONLY to understand the user's message.

You MUST NOT answer the user's procurement question.

You MUST NOT calculate procurement values.

You MUST NOT invent suppliers, orders, costs, delays, dates,
quantities, risks, or any other procurement facts.

The actual procurement database is the source of truth.

Return ONLY valid JSON.

=========================================================
LANGUAGE DETECTION
=========================================================

Identify the language/style of the CURRENT user message.

Allowed values:

english
hindi
marathi
hinglish
marathi_english
unknown

Definitions:

english:
Normal English.

Example:
"Which supplier has the most delays?"

hindi:
Hindi written in Devanagari.

Example:
"किस supplier को सबसे ज्यादा delay है?"

marathi:
Marathi written in Devanagari.

Example:
"कोणत्या supplier ला सर्वात जास्त delay आहे?"

hinglish:
Hindi written using Roman/English letters.

Example:
"kis supplier ko sabse zyada delay hai?"

marathi_english:
Marathi written using Roman/English letters, often mixed
with English procurement terminology.

Example:
"kontya supplier la saglyat jast delay aahe?"

IMPORTANT:

The CURRENT message language has priority.

Do NOT use previous conversation language to classify
a clear current message.

For example:

Previous message:
"kontya supplier la delay aahe?"

Current message:
"Which supplier has the most delays?"

Current language MUST be:
english

=========================================================
INTENTS
=========================================================

Use one of these intents:

procurement_details
delays
supplier_delays
total_cost
supplier_cost
average_cost
upcoming_deliveries
materials
supplier_summary
orders
dashboard
risk
urgency
critical
most_expensive
supplier_details
supplier_risk
supplier_recommendation
compare
recommendations
action_plan
contextual_details
greeting
help
thanks
unknown

Examples:

"Which supplier has the most delays?"
-> supplier_delays

"kis supplier ko sabse zyada delay hai?"
-> supplier_delays

"किस supplier को सबसे ज्यादा delay है?"
-> supplier_delays

"कोणत्या supplier ला सर्वात जास्त delay आहे?"
-> supplier_delays

"kontya supplier la saglyat jast delay aahe?"
-> supplier_delays

"How many orders are delayed?"
-> delays

"What is the total procurement cost?"
-> total_cost

"Show upcoming deliveries"
-> upcoming_deliveries

"How many suppliers are there?"
-> supplier_summary

"Show me all orders"
-> orders

"dashboard"
-> dashboard

=========================================================
FOLLOW-UP
=========================================================

Identify whether the current message is a follow-up.

Examples:

"risk?"
"is ka risk?"
"aur risk?"
"aani risk?"

These can refer to the previous procurement context.

If the message is a follow-up:

is_follow_up = true

and identify the target:

risk
delays
details
etc.

If it is not a follow-up:

is_follow_up = false

=========================================================
ENTITY EXTRACTION
=========================================================

Extract these only when explicitly present:

procurement_id
supplier
item

Never invent them.

If not present, use null.

=========================================================
OUTPUT
=========================================================

Return exactly this structure:

{
    "success": true,
    "language": "english",
    "confidence": 0.99,
    "intent": "supplier_delays",
    "procurement_id": null,
    "supplier": null,
    "item": null,
    "is_follow_up": false,
    "follow_up_target": null,
    "reason": null
}
"""


# =========================================================
# JSON EXTRACTION
# =========================================================

def extract_json(text):
    """
    Safely extract JSON from an LLM response.
    """

    if not text:
        return None

    text = text.strip()

    # Direct JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # JSON inside markdown/code
    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:
        candidate = text[start:end + 1]

        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            return None

    return None


# =========================================================
# NORMALIZE RESULT
# =========================================================

def normalize_result(data):
    result = default_nlu_result()

    if not isinstance(data, dict):
        return result

    result["success"] = bool(
        data.get("success", True)
    )

    result["language"] = str(
        data.get("language", "unknown")
    ).strip().lower()

    result["confidence"] = data.get(
        "confidence",
        0.0,
    )

    try:
        result["confidence"] = float(
            result["confidence"]
        )
    except (TypeError, ValueError):
        result["confidence"] = 0.0

    result["intent"] = str(
        data.get("intent", "unknown")
    ).strip().lower()

    result["procurement_id"] = (
        data.get("procurement_id")
        or None
    )

    result["supplier"] = (
        data.get("supplier")
        or None
    )

    result["item"] = (
        data.get("item")
        or None
    )

    result["is_follow_up"] = bool(
        data.get("is_follow_up", False)
    )

    result["follow_up_target"] = (
        data.get("follow_up_target")
        or None
    )

    result["reason"] = (
        data.get("reason")
        or None
    )

    valid_languages = {
        "english",
        "hindi",
        "marathi",
        "hinglish",
        "marathi_english",
        "unknown",
    }

    if result["language"] not in valid_languages:
        result["language"] = "unknown"

    return result


# =========================================================
# OPENAI-COMPATIBLE REQUEST
# =========================================================

def _call_llm(message):
    """
    Calls an OpenAI-compatible chat completion API.

    The LLM is used ONLY for NLU.
    """

    if not LLM_ENABLED:
        return default_nlu_result()

    if not LLM_API_KEY:
        return default_nlu_result()

    provider = str(
        LLM_PROVIDER or "openai"
    ).lower()

    # Currently configured for OpenAI-compatible API.
    if provider != "openai":
        return default_nlu_result()

    payload = {
        "model": LLM_MODEL,
        "temperature": 0,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": message,
            },
        ],
        "response_format": {
            "type": "json_object"
        },
    }

    body = json.dumps(
        payload
    ).encode("utf-8")

    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LLM_API_KEY}",
        },
        method="POST",
    )

    try:

        with urllib.request.urlopen(
            request,
            timeout=LLM_TIMEOUT,
        ) as response:

            raw = response.read().decode(
                "utf-8"
            )

            data = json.loads(raw)

        choices = data.get(
            "choices",
            []
        )

        if not choices:
            return default_nlu_result()

        message_data = choices[0].get(
            "message",
            {}
        )

        content = message_data.get(
            "content",
            ""
        )

        parsed = extract_json(
            content
        )

        if parsed is None:
            return default_nlu_result()

        result = normalize_result(
            parsed
        )

        result["success"] = True

        return result

    except urllib.error.HTTPError as exc:

        try:
            error_body = exc.read().decode(
                "utf-8"
            )
        except Exception:
            error_body = ""

        result = default_nlu_result()

        result["reason"] = (
            f"LLM HTTP error {exc.code}: "
            f"{error_body[:300]}"
        )

        return result

    except urllib.error.URLError as exc:

        result = default_nlu_result()

        result["reason"] = (
            f"LLM connection error: {exc}"
        )

        return result

    except TimeoutError:

        result = default_nlu_result()

        result["reason"] = (
            "LLM request timed out."
        )

        return result

    except Exception as exc:

        result = default_nlu_result()

        result["reason"] = (
            f"LLM error: {type(exc).__name__}: {exc}"
        )

        return result


# =========================================================
# PUBLIC FUNCTION
# =========================================================

def get_llm_result(
    message,
    memory=None,
):
    """
    Public NLU function used by assistant.py.

    IMPORTANT:
    Procurement answers are NOT generated here.
    """

    if not message:
        return default_nlu_result()

    return _call_llm(
        str(message).strip()
    )


# =========================================================
# BACKWARD-COMPATIBILITY ALIASES
# =========================================================

def understand(
    message,
    memory=None,
):
    return get_llm_result(
        message,
        memory,
    )


def analyze_message(
    message,
    memory=None,
):
    return get_llm_result(
        message,
        memory,
    )


# =========================================================
# TEST MODE
# =========================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("ProcureAI LLM NLU Test")
    print("=" * 60)
    print()

    while True:

        try:
            text = input("You: ").strip()

        except (KeyboardInterrupt, EOFError):
            print()
            break

        if text.lower() in {
            "exit",
            "quit",
        }:
            break

        result = get_llm_result(
            text
        )

        print(
            json.dumps(
                result,
                indent=4,
                ensure_ascii=False,
            )
        )
        print()