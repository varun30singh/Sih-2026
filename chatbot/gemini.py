"""
MandiSetu Gemini Agricultural Intelligence Module
Provides deep, scientifically sound, multilingual agricultural intelligence using Google GenAI SDK.
"""

from __future__ import annotations
import os
import re
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# Preferred Gemini models in descending order of availability/stability
CANDIDATE_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip() or "gemini-3.8-flash",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
]

AGRICULTURE_SYSTEM_PROMPT = """You are the specialized Agricultural Expert Intelligence for MandiSetu, India's farmer assistant platform.

YOUR DOMAIN:
- Crop agronomy, planting, spacing, fertilizer schedules (Urea, DAP, NPK, Potash, organic compost).
- Plant pathology, pest management, fungal infections, yellow leaves, curling, wilting, blight.
- Weather advisories, soil health, irrigation practices, harvest timing.
- Government agricultural schemes (PM-Kisan, PM Fasal Bima, KCC, soil health card, subsidies).

CRITICAL SAFETY & QUALITY GUIDELINES:
1. Crop Diseases & Symptoms:
   - Always acknowledge that leaf discoloration, spots, and curling can result from multiple distinct factors (e.g., nutrient deficiency such as nitrogen or iron, sucking pests like whiteflies/aphids/thrips, fungal pathogens, or moisture stress).
   - Use cautious, responsible phrasing: "यह कई कारणों से हो सकता है..." / "हे अनेक कारणांमुळे असू शकते..." / "This can be caused by several factors...".
   - Ask clarifying symptom questions (e.g., "Are the veins still green?", "Are there tiny webs under the leaf?", "Is the soil waterlogged?").
   - NEVER fabricate chemical spray dosages. Always advise reading the product label carefully and consulting the local Krishi Vigyan Kendra (KVK) or Block Agriculture Extension Officer before applying synthetic pesticides.

2. Tone & Conciseness:
   - Direct, practical, farmer-friendly, respectful.
   - Avoid academic jargon; format steps clearly with bullet points.

3. Multilingual Output:
   - Respond strictly in the specified language.
   - If Hindi: Respond in natural, clean Hindi in Devanagari script.
   - If Marathi: Respond in natural, polite Marathi in Devanagari script.
   - If English: Respond in clear, accessible English.
   - If Roman Hindi/Hinglish: Respond in simple Hindi in Devanagari script with common terms.
   - If Roman Marathi: Respond in simple Marathi in Devanagari script.
"""

def _get_genai_client():
    """Returns an authenticated GenAI Client or None."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.warning(f"Failed to initialize Google GenAI client: {e}")
        return None

def is_agricultural_intelligence_query(text: str) -> bool:
    """
    Identifies whether a query is an agricultural domain question that Gemini should answer.
    """
    clean = text.lower().strip()
    
    agri_markers = [
        # Crops
        "wheat", "gehu", "gehun", "gahu", "paddy", "dhan", "rice", "bhat", "soybean", "soyabean",
        "mustard", "sarson", "mohari", "chana", "cotton", "kapas", "kapus", "maize", "makka",
        "tomato", "tamatar", "potato", "aalu", "aloo", "onion", "kanda", "pyaz", "mirch", "chilli",
        "गेहूं", "गहू", "धान", "भात", "सोयाबीन", "सरसों", "मोहरी", "चना", "कपास", "कापूस", "मक्का",
        "टमाटर", "आलू", "कांदा", "कांदे", "टोमॅटो", "मिरची",
        # Agronomy & Symptoms
        "yellow", "yellowing", "peele", "peela", "pivli", "pivla", "curl", "curling", "spots", "daag", "dhabbe",
        "leaf", "leaves", "patte", "patti", "paan", "pane", "pan", "wilt", "wilting", "sukha", "rot",
        "blight", "fungus", "fungal", "pest", "pests", "keeda", "keede", "keed", "rog", "bimari", "aajar",
        "fertilizer", "khad", "khatt", "urea", "dap", "npk", "potash", "compost", "manure", "pesticide",
        "insecticide", "fungicide", "dawa", "davai", "aushadh", "spray", "chhidkaw", "fowarni",
        "soil", "mitti", "mati", "sowing", "buwai", "perani", "harvest", "katai", "kapani",
        "disease", "treatment", "cure", "upay", "upchar", "advisory", "crop", "crops", "fasal", "peek",
        "पीले", "पिवळे", "पिवळी", "डाग", "पाने", "पान", "कीड", "रोग", "कीटक", "औषध", "फवारणी",
        "खत", "यूरिया", "खाद", "माती", "रोगराई", "उपाय", "उपचार"
    ]
    
    return any(m in clean for m in agri_markers)

def generate_gemini_agriculture_answer(
    question: str,
    language: str = "english",
    context: Optional[str] = None,
    session_history: Optional[List[Dict[str, str]]] = None,
    is_grounded: bool = False,
    farmer_location: Optional[Dict[str, str]] = None
) -> Tuple[Optional[str], Optional[List[str]], Optional[Dict[str, str]]]:
    """
    Calls Google Gemini to produce agricultural intelligence answers.
    Returns: (answer_text, suggested_questions, source_metadata)
    """
    client = _get_genai_client()
    if not client:
        return None, None, None

    # Construct conversation / context prompt
    user_prompt_parts = []
    
    # State / District context if available
    loc_str = ""
    if farmer_location:
        state = farmer_location.get("state", "Uttar Pradesh")
        district = farmer_location.get("district", "Hapur")
        loc_str = f"Farmer location: {district}, {state}, India.\n"
        user_prompt_parts.append(loc_str)

    if context:
        user_prompt_parts.append(f"Context from agricultural data / recent search:\n{context}\n")

    # Add brief dialogue history if present
    if session_history and len(session_history) > 0:
        history_str = "Recent relevant conversation:\n"
        for h in session_history[-3:]:
            u = h.get("user", "")
            b = h.get("bot", "")
            if u:
                history_str += f"Farmer: {u}\n"
            if b:
                history_str += f"Assistant: {b[:150]}...\n"
        user_prompt_parts.append(history_str)

    target_lang = language.lower()
    user_prompt_parts.append(
        f"Language requested for response: {target_lang.upper()}.\n"
        f"Farmer's question: {question}\n\n"
        "Provide a helpful, safe agricultural answer following the safety instructions. "
        "At the end of your response, add 3 follow-up suggestions for the farmer, separated by semicolons on a single line starting with 'SUGGESTIONS:'"
    )

    full_user_prompt = "\n".join(user_prompt_parts)

    answer_text = None
    used_model = None

    # Try candidate models with fallback
    for model_name in CANDIDATE_MODELS:
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                system_instruction=AGRICULTURE_SYSTEM_PROMPT,
                temperature=0.3,
            )
            response = client.models.generate_content(
                model=model_name,
                contents=full_user_prompt,
                config=config,
            )
            if response and response.text:
                answer_text = response.text.strip()
                used_model = model_name
                break
        except Exception as e:
            logger.info(f"Model {model_name} failed: {e}. Trying next candidate...")
            continue

    if not answer_text:
        return None, None, None

    # Extract suggestions if formatted with SUGGESTIONS:
    suggested_questions: List[str] = []
    if "SUGGESTIONS:" in answer_text:
        parts = answer_text.split("SUGGESTIONS:")
        answer_text = parts[0].strip()
        sugg_raw = parts[1].strip()
        suggested_questions = [s.strip() for s in sugg_raw.split(";") if s.strip() and len(s.strip()) > 3][:4]

    # Source metadata
    source_metadata = {
        "source": "Google Gemini Agricultural Intelligence",
        "model": used_model or "gemini-3.8-flash",
        
    }

    return answer_text, suggested_questions, source_metadata
