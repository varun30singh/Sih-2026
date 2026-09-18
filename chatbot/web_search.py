"""
MandiSetu Web Search Module
Retrieves current, fresh external agricultural information (mandi prices, MSP, weather, government schemes, fresh advisories)
from authoritative sources (Agmarknet, CACP, IMD, Ministry of Agriculture, ICAR, state APMCs)
and formats them cleanly for farmer consumption and LLM context.
"""

from __future__ import annotations
import os
import re
import json
import logging
import urllib.parse
import urllib.request
from typing import List, Dict, Any, Optional, Tuple

from dotenv import load_dotenv

load_dotenv()

try:
    from .config import (
        WEB_SEARCH_API_KEY,
        WEB_SEARCH_PROVIDER,
        WEB_SEARCH_TIMEOUT,
    )
except (ImportError, ValueError):
    try:
        from config import (
            WEB_SEARCH_API_KEY,
            WEB_SEARCH_PROVIDER,
            WEB_SEARCH_TIMEOUT,
        )
    except Exception:
        WEB_SEARCH_API_KEY = os.getenv("WEB_SEARCH_API_KEY", "").strip()
        WEB_SEARCH_PROVIDER = os.getenv("WEB_SEARCH_PROVIDER", "tavily").strip().lower()
        WEB_SEARCH_TIMEOUT = int(os.getenv("WEB_SEARCH_TIMEOUT", "15"))

logger = logging.getLogger(__name__)


# ============================================================
# 1. EXTERNAL SEARCH QUERY DETECTION
# ============================================================

def is_external_search_query(text: str) -> bool:
    """
    Deterministically determines if a user query requires current/live web information.
    Supports English, Hindi, Marathi, and Hinglish.

    Returns True for:
      - Today's/current mandi prices, crop rates, latest MSP revisions
      - Today's/tomorrow's weather, rain forecast, temperature
      - Recent/current updates on government schemes (PM-Kisan, PMFBY, KCC, subsidies)
      - Latest agricultural advisories, current pest outbreak alerts, fresh agricultural news

    Returns False for:
      - Personal MandiSetu operational data (token, queue, slot, booking, payment, sales history)
      - General agronomy concepts (crop rotation, what is DAP, leaf yellowing causes)
    """
    if not text or not isinstance(text, str):
        return False

    clean = text.lower().strip().replace("’", "'").replace("‘", "'")

    # 1. Personal MandiSetu questions must NEVER go to web search
    personal_markers = [
        "my token", "token status", "what is my token", "my queue", "my slot", "my booking",
        "where is my booking", "my payment", "payment status", "what is my payment",
        "show my procurement", "my procurement", "my sale", "my sales", "my sale status",
        "what did i sell", "when is my", "where is my token", "farmers ahead", "ahead of me",
        "my farmer id", "my transaction", "my appointment", "my appointment/slot",
        "mera token", "meri booking", "mera payment", "mera slot", "kitne kisan aage",
        "hamara token", "maza token", "majha token", "माझा टोकन", "माझं पेमेंट",
        "माझा स्लॉट", "माझे बुकिंग", "माझ्या पुढे किती शेतकरी", "पेमेंट कधी", "टोकन कधी"
    ]
    if any(p in clean for p in personal_markers):
        return False

    # 2. General agronomy / ontology questions should NOT be forced to web search
    general_agronomy_starters = [
        "what is photosynthesis", "what is crop rotation", "what is dap",
        "what is irrigation", "how does fertilizer work", "how does urea work",
        "why are wheat leaves yellow", "why are my wheat leaves yellow",
        "why are leaves yellow", "why leaves turning yellow"
    ]
    if any(clean.startswith(g) or clean == g.strip() for g in general_agronomy_starters):
        return False

    # 3. Weather / Rain triggers (immediate external search need)
    weather_triggers = [
        "weather", "rain", "rainfall", "forecast", "temperature",
        "मौसम", "बारिश", "बरसात", "तापमान", "वर्षा",
        "हवामान", "पाऊस", "उष्णता",
        "mausam", "barish", "havaman", "paus"
    ]
    if any(w in clean for w in weather_triggers):
        return True

    # 4. Recency / Current time triggers
    recency_markers = [
        "today", "todays", "today's", "tomorrow", "tomorrows", "tomorrow's",
        "current", "latest", "recent", "now", "updated", "this week",
        "aaj", "aajka", "aaj ka", "aaj ke", "aaj ki", "abhi", "taaza", "taza", "haal hi", "kal",
        "आज", "अभी", "वर्तमान", "ताज़ा", "ताजा", "कल",
        "सध्या", "ताजे", "उद्या", "नुकताच", "सध्याचा", "चालू"
    ]
    has_recency = any(m in clean for m in recency_markers)

    # Fast check: specific price/rate idioms
    price_idioms = [
        "aaj ka bhav", "aaj ka mandi bhav", "mandi bhav", "market price", "bazar bhav", "bazaar bhav",
        "mandi rate", "mandi rates", "crop rate", "crop price",
        "आज का भाव", "मंडी भाव", "बाजार भाव", "बाजारभाव", "आजचा भाव", "आजचे भाव",
        "दर काय आहे", "भाव काय आहे", "भाव क्या है", "रेट क्या है"
    ]
    if any(p in clean for p in price_idioms):
        return True

    # Commodities
    commodity_markers = [
        "wheat", "gehu", "gehun", "gahu", "paddy", "dhan", "rice", "bhat", "soybean", "soyabean",
        "mustard", "sarson", "mohari", "chana", "gram", "harbhara", "cotton", "kapas", "kapus",
        "maize", "makka", "makkai", "tomato", "tamatar", "potato", "aalu", "aloo", "onion",
        "kanda", "pyaz", "mirch", "chilli",
        "गेहूं", "गहू", "धान", "भात", "सोयाबीन", "सरसों", "मोहरी", "चना", "कपास", "कापूस", "मक्का",
        "टमाटर", "आलू", "कांदा", "टोमॅटो", "मिरची"
    ]
    has_commodity = any(c in clean for c in commodity_markers)

    # 5. Price / Market triggers with recency or commodity
    price_triggers = [
        "price", "prices", "rate", "rates", "bhav", "bhaav", "mandi price", "market price",
        "भाव", "बाजारभाव", "दर", "किंमत"
    ]
    if any(p in clean for p in price_triggers) and (has_recency or has_commodity or "mandi" in clean or "मंडी" in clean or "मार्केट" in clean):
        return True

    # 6. Government Schemes & Subsidies (PM-KISAN, PMFBY, KCC, etc.)
    scheme_triggers = [
        "pm-kisan", "pm kisan", "pmkisan", "fasal bima", "pmfby", "kcc", "kisan credit card",
        "subsidy", "subsidies", "scheme", "schemes", "yojana", "sarkari yojana",
        "सरकारी योजना", "योजना", "सब्सिडी", "अनुदान", "पीएम किसान", "पीक विमा"
    ]
    if any(s in clean for s in scheme_triggers) and (has_recency or "update" in clean or "latest" in clean or "list" in clean or "new" in clean or "नया" in clean or "नवीन" in clean or "अपडेट" in clean):
        return True

    # 7. Agricultural Advisories & News
    advisory_triggers = [
        "advisory", "advisories", "bulletin", "kheti salah", "krishi salah",
        "कृषि सलाह", "कृषी सल्ला", "सल्ला", "सलाह", "alert", "alert news"
    ]
    if any(a in clean for a in advisory_triggers) and (has_recency or has_commodity or "kisan" in clean or "crop" in clean or "मंडी" in clean):
        return True

    # 8. Recency combined with commodity or agricultural context
    if has_recency and (has_commodity or "mandi" in clean or "msp" in clean or "msp rate" in clean):
        return True

    return False


# ============================================================
# 2. SEARCH QUERY BUILDING
# ============================================================

def build_search_query(
    text: str,
    farmer_location: Optional[Dict[str, str]] = None
) -> str:
    """
    Constructs an authoritative, targeted search query.
    Incorporates farmer location if present (without inventing locations).
    Appends priority government/agricultural domains for high source reliability.
    """
    clean = text.strip()

    loc_str = ""
    if farmer_location and isinstance(farmer_location, dict):
        district = farmer_location.get("district", "").strip()
        state = farmer_location.get("state", "").strip()
        if district and state:
            loc_str = f"{district} {state}"
        elif district:
            loc_str = district
        elif state:
            loc_str = state

    lower = clean.lower()

    # Weather Queries
    if any(w in lower for w in ["weather", "rain", "mausam", "havaman", "मौसम", "बारिश", "हवामान", "पाऊस"]):
        if loc_str:
            return f"{loc_str} weather forecast today IMD rainfall"
        return f"{clean} weather forecast today IMD rainfall"

    # Government Scheme Queries
    if any(s in lower for s in ["pm-kisan", "pm kisan", "kisan samman", "fasal bima", "kcc", "yojana", "योजना"]):
        for scheme in ["PM-KISAN", "PM Fasal Bima Yojana", "Kisan Credit Card"]:
            if scheme.lower() in lower or scheme.replace("-", " ").lower() in lower:
                return f"{scheme} latest update official guidelines 2026 gov.in"
        return f"{clean} latest update official portal gov.in"

    # Commodity Mandi Prices
    found_crop = None
    crop_keywords = [
        ("wheat", "Wheat"), ("gehu", "Wheat"), ("गेहूं", "Wheat"), ("gahu", "Wheat"),
        ("soybean", "Soybean"), ("सोयाबीन", "Soybean"),
        ("mustard", "Mustard"), ("sarson", "Mustard"), ("सरसों", "Mustard"), ("mohari", "Mustard"),
        ("paddy", "Paddy"), ("dhan", "Paddy"), ("धान", "Paddy"), ("rice", "Paddy"),
        ("chana", "Chana"), ("चना", "Chana"),
        ("cotton", "Cotton"), ("kapas", "Cotton"), ("कपास", "Cotton"),
        ("maize", "Maize"), ("makka", "Maize"), ("मक्का", "Maize"),
        ("tomato", "Tomato"), ("tamatar", "Tomato"), ("टमाटर", "Tomato"),
        ("potato", "Potato"), ("aloo", "Potato"), ("आलू", "Potato"),
        ("onion", "Onion"), ("pyaz", "Onion"), ("kanda", "Onion"), ("कांदा", "Onion"),
    ]
    for kw, norm_crop in crop_keywords:
        if kw in lower:
            found_crop = norm_crop
            break

    if found_crop:
        if loc_str:
            return f"{found_crop} mandi price today {loc_str} Agmarknet official"
        return f"{found_crop} mandi price today Agmarknet official"

    # General Advisory / News
    if loc_str:
        return f"{clean} {loc_str} official agriculture"

    return f"{clean} official agriculture portal gov.in"


# ============================================================
# 3. OPEN-METEO WEATHER SERVICE
# ============================================================

def _fetch_open_meteo_weather(
    query: str,
    farmer_location: Optional[Dict[str, str]] = None
) -> List[Dict[str, Any]]:
    """
    Retrieves live meteorological data from Open-Meteo.
    Uses farmer_location if available.
    If unavailable, checks if a location is explicitly mentioned in the query.
    If no location can be determined, returns a clear 'location_required' notice
    without ever assuming or defaulting to Hapur or any fabricated location.
    """
    district = None
    state = ""
    if farmer_location and isinstance(farmer_location, dict):
        district = (farmer_location.get("district") or "").strip()
        state = (farmer_location.get("state") or "").strip()

    if not district:
        loc_match = re.search(
            r"\b(?:in|mein|me|at|near|madhe|मध्ये|में|च्या|चा|चे|ची)\s+([a-zA-Z\u0900-\u097F]+)",
            query,
            re.IGNORECASE
        )
        if loc_match:
            cand = loc_match.group(1).strip()
            stopwords = [
                "today", "tomorrow", "now", "weather", "rain", "forecast",
                "aaj", "kal", "mausam", "havaman", "barish", "paus",
                "आज", "कल", "हवामान", "पाऊस", "मौसम", "बारिश", "इलाके", "परिसर"
            ]
            if cand.lower() not in stopwords:
                district = cand.capitalize()

    # If still no location, DO NOT fabricate any location. Return location-required notice.
    if not district:
        return [{
            "title": "Weather Location Required",
            "url": "https://open-meteo.com",
            "source": "Weather Service",
            "snippet": "Weather forecast requires a specific district or location. Please specify your location (e.g., 'Weather in Pune') or update your farmer profile location.",
            "published_date": "Today",
            "location_required": True,
        }]

    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(district)}&count=1&language=en&format=json"
        req = urllib.request.Request(geo_url, headers={"User-Agent": "MandiSetu/1.0"})
        lat, lon, place_name = None, None, f"{district}, {state}"
        with urllib.request.urlopen(req, timeout=WEB_SEARCH_TIMEOUT) as resp:
            geo_data = json.loads(resp.read().decode("utf-8"))
            results = geo_data.get("results")
            if results:
                lat = results[0]["latitude"]
                lon = results[0]["longitude"]
                admin1 = results[0].get("admin1", state)
                place_name = f"{results[0]['name']}, {admin1}".strip(", ")

        if lat is None or lon is None:
            return []

        fc_url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code"
            "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
            "&timezone=auto"
        )
        req2 = urllib.request.Request(fc_url, headers={"User-Agent": "MandiSetu/1.0"})
        with urllib.request.urlopen(req2, timeout=WEB_SEARCH_TIMEOUT) as resp2:
            fc_data = json.loads(resp2.read().decode("utf-8"))

        current = fc_data.get("current", {})
        daily = fc_data.get("daily", {})
        temp = current.get("temperature_2m", "N/A")
        humidity = current.get("relative_humidity_2m", "N/A")
        precip = current.get("precipitation", 0.0)

        rain_status = "Rain/Showers likely" if precip > 0.1 else "No significant precipitation expected today"
        max_temp = daily.get("temperature_2m_max", ["N/A"])[0] if daily.get("temperature_2m_max") else "N/A"
        min_temp = daily.get("temperature_2m_min", ["N/A"])[0] if daily.get("temperature_2m_min") else "N/A"
        daily_rain = daily.get("precipitation_sum", [0.0])[0] if daily.get("precipitation_sum") else 0.0

        content = (
            f"Live weather observation and forecast for {place_name}: "
            f"Current temperature: {temp}°C, Relative Humidity: {humidity}%. "
            f"Today's Max Temperature: {max_temp}°C, Min Temperature: {min_temp}°C. "
            f"Expected Precipitation: {daily_rain} mm ({rain_status}). "
            f"Farming advisory: Monitor field drainage if spraying pesticides or harvesting."
        )

        return [{
            "title": f"Live Weather Forecast for {place_name}",
            "url": "https://open-meteo.com",
            "source": "Open-Meteo / IMD meteorological models",
            "snippet": content,
            "published_date": current.get("time", "Today"),
        }]
    except Exception as e:
        logger.info(f"Open-Meteo weather fetch failed: {e}")
        return []


# ============================================================
# 4. TAVILY SEARCH PROVIDER
# ============================================================

def _search_tavily(query: str, api_key: str) -> List[Dict[str, Any]]:
    """
    Executes search using Tavily API.
    Tries tavily-python SDK first, falls back to direct HTTPS request.
    """
    if not api_key:
        return []

    # Priority authoritative domains
    auth_domains = ["agmarknet.gov.in", "gov.in", "nic.in", "imd.gov.in", "icar.org.in"]

    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=query,
            search_depth="basic",
            max_results=5,
            include_answer=False
        )
        results = []
        for r in response.get("results", []):
            url = r.get("url", "")
            domain = urllib.parse.urlparse(url).netloc.lower()
            source_name = domain.replace("www.", "") if domain else "Tavily Search"
            results.append({
                "title": r.get("title", ""),
                "url": url,
                "source": source_name,
                "snippet": r.get("content", ""),
                "published_date": r.get("published_date", "Today"),
            })
        if results:
            return results
    except ImportError:
        pass
    except Exception as e:
        logger.warning(f"TavilyClient invocation error: {e}")

    # Direct HTTPS fallback
    try:
        payload = json.dumps({
            "api_key": api_key,
            "query": query,
            "search_depth": "basic",
            "include_answer": False,
            "max_results": 5
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.tavily.com/search",
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "MandiSetu/1.0"}
        )
        with urllib.request.urlopen(req, timeout=WEB_SEARCH_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        results = []
        for r in data.get("results", []):
            url = r.get("url", "")
            domain = urllib.parse.urlparse(url).netloc.lower()
            source_name = domain.replace("www.", "") if domain else "Tavily Search"
            results.append({
                "title": r.get("title", ""),
                "url": url,
                "source": source_name,
                "snippet": r.get("content", ""),
                "published_date": r.get("published_date", "Today"),
            })
        return results
    except Exception as e:
        logger.warning(f"Tavily HTTP search failed: {e}")
        return []


# ============================================================
# 5. PERFORM WEB SEARCH
# ============================================================

def perform_web_search(
    query: str,
    farmer_location: Optional[Dict[str, str]] = None
) -> List[Dict[str, Any]]:
    """
    Executes web search through available providers.
    1. Checks if weather query -> uses Open-Meteo meteorological service.
    2. If WEB_SEARCH_PROVIDER == 'tavily' and WEB_SEARCH_API_KEY configured -> uses Tavily.
    Returns list of dicts with: title, url, source, snippet, published_date.
    Never transmits private MandiSetu farmer records (tokens, payments, bookings) to external services.
    """
    if not query or not query.strip():
        return []

    clean_q = query.strip()
    lower = clean_q.lower()

    # 1. Weather queries prioritize meteorological data
    if any(w in lower for w in ["weather", "rain", "mausam", "havaman", "मौसम", "बारिश", "हवामान", "पाऊस"]):
        weather_res = _fetch_open_meteo_weather(clean_q, farmer_location=farmer_location)
        if weather_res:
            return weather_res

    # 2. Tavily provider
    api_key = (WEB_SEARCH_API_KEY or os.getenv("WEB_SEARCH_API_KEY", "")).strip()
    provider = (WEB_SEARCH_PROVIDER or os.getenv("WEB_SEARCH_PROVIDER", "tavily")).strip().lower()

    if api_key and provider == "tavily":
        tavily_res = _search_tavily(clean_q, api_key)
        if tavily_res:
            return tavily_res

    # 3. Fallback: if weather was requested and not caught above
    if any(w in lower for w in ["weather", "rain", "forecast"]):
        return _fetch_open_meteo_weather(clean_q, farmer_location=farmer_location)

    return []


# ============================================================
# 6. FORMAT WEB SEARCH ANSWER
# ============================================================

def format_web_search_answer(
    search_results: List[Dict[str, Any]],
    language: str = "english",
    commodity: Optional[str] = None
) -> Tuple[str, Optional[Dict[str, str]]]:
    """
    Formats structured web search results into a concise, farmer-friendly response
    with explicit source citations and publication dates.

    Anti-Hallucination Rule:
    If search_results is empty (search failed or yielded no results),
    it clearly reports that live information could not be retrieved
    rather than silently providing stale or fabricated data.
    """
    clean_lang = (language or "english").lower().strip()
    if clean_lang in ["hinglish", "roman_hindi"]:
        clean_lang = "hindi"
    elif clean_lang in ["marathi_english", "roman_marathi"]:
        clean_lang = "marathi"

    # Anti-Hallucination: Search Failure / Empty Results Handler
    if not search_results:
        if clean_lang == "hindi":
            msg = (
                "वर्तमान में लाइव/ताज़ा जानकारी प्राप्त नहीं हो सकी। "
                "कृपया थोड़ी देर बाद पुनः प्रयास करें या अपने स्थानीय कृषि विज्ञान केंद्र (KVK) या मंडी कार्यालय से संपर्क करें।"
            )
        elif clean_lang == "marathi":
            msg = (
                "सध्या थेट/ताजी माहिती उपलब्ध होऊ शकली नाही. "
                "कृपया थोड्या वेळाने पुन्हा प्रयत्न करा किंवा स्थानिक कृषी विज्ञान केंद्र (KVK) अथवा बाजार समितीशी संपर्क साधा."
            )
        else:
            msg = (
                "Current live information could not be retrieved at this moment. "
                "Please try again shortly or consult your local Krishi Vigyan Kendra (KVK) or APMC mandi office."
            )
        return msg, None

    # Process retrieved results
    top = search_results[0]

    # Location Required Notice (Weather without location)
    if top.get("location_required"):
        if clean_lang == "hindi":
            msg = "मौसम की सटीक जानकारी के लिए कृपया अपने जिले या क्षेत्र का नाम बताएं (जैसे: 'पुणे में आज का मौसम' या प्रोफाइल में स्थान दर्ज करें)।"
        elif clean_lang == "marathi":
            msg = "हवामानाच्या अचूक माहितीसाठी कृपया आपल्या जिल्ह्याचे नाव सांगा (उदा. 'पुण्यातील आजचे हवामान' किंवा प्रोफाइलमध्ये स्थान नोंदवा)."
        else:
            msg = "To provide accurate weather information, please specify your district or city (e.g., 'Today's weather in Pune' or ensure your profile location is set)."
        metadata: Dict[str, str] = {
            "source": "Weather Service",
            "updated": "Location Required",
            "url": "",
            "grounded": "false",
            "status": "location_required",
        }
        return msg, metadata

    snippet = top.get("snippet", "").strip()
    source_name = top.get("source", "Web Search")
    source_url = top.get("url", "")
    pub_date = top.get("published_date") or "Today"

    # Build localized response
    if clean_lang == "hindi":
        header = f"🌾 **{commodity or 'कृषि'} संबंधी नवीनतम जानकारी:**\n"
        body = f"{snippet}\n\n"
        footer = f"📌 **स्रोत:** {source_name} (दिनांक: {pub_date})\n"
        if source_url:
            footer += f"🔗 संदर्भ: {source_url}"
        answer = f"{header}{body}{footer}".strip()
    elif clean_lang == "marathi":
        header = f"🌾 **{commodity or 'कृषी'} संबंधित ताजी माहिती:**\n"
        body = f"{snippet}\n\n"
        footer = f"📌 **स्रोत:** {source_name} (तारीख: {pub_date})\n"
        if source_url:
            footer += f"🔗 संदर्भ: {source_url}"
        answer = f"{header}{body}{footer}".strip()
    else:
        header = f"🌾 **Latest {commodity or 'Agricultural'} Information:**\n"
        body = f"{snippet}\n\n"
        footer = f"📌 **Source:** {source_name} (Date: {pub_date})\n"
        if source_url:
            footer += f"🔗 Reference: {source_url}"
        answer = f"{header}{body}{footer}".strip()

    metadata: Dict[str, str] = {
        "source": source_name,
        "updated": str(pub_date),
        "url": source_url,
        "grounded": "true",
        "status": "success",
    }

    return answer, metadata
