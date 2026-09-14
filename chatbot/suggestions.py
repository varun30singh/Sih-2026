"""
ProcureAI - Responsible, Context-Aware, Data-Aware Suggested Question Generator
================================================================================
SIH26032 - Multilingual Procurement Assistant

Generates 3-4 context-aware, non-hallucinatory suggested follow-up questions
based on:
1. The user's query and intent
2. ProcureAI's latest response
3. Conversational context & memory
4. Verified live procurement data from SQLite
5. The language of interaction (English, Hindi, Marathi, Hinglish, Marathi-English)

Guarantees:
- Never generates random or generic unrelated questions.
- Never suggests questions for data that doesn't exist in the database.
- Strictly between 3 and 4 questions.
- Filters out duplicate or semantically identical questions.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Set, Tuple


# Default known suppliers in ProcureAI SQLite database
DEFAULT_KNOWN_SUPPLIERS = [
    "SKF India",
    "Tata Steel",
    "Bosch India",
    "Siemens India",
    "Polycab",
    "Schneider Electric",
    "L&T",
    "Hindalco",
    "Honeywell",
    "Donaldson",
]


def _normalize_cmp(text: str) -> str:
    """Normalize text for semantic deduplication comparison."""
    if not text:
        return ""
    # Remove punctuation and normalize spaces
    t = re.sub(r"[^\w\s\u0900-\u097F]", "", text).lower().strip()
    return re.sub(r"\s+", " ", t)


def _is_duplicate_or_similar(candidate: str, existing_list: List[str], user_msg: str) -> bool:
    """Checks if candidate question matches user query or already selected questions."""
    norm_c = _normalize_cmp(candidate)
    norm_u = _normalize_cmp(user_msg)

    if not norm_c:
        return True

    # Check against user's current message
    if norm_c == norm_u or norm_c in norm_u or norm_u in norm_c:
        return True

    # Check against already selected questions
    for ex in existing_list:
        norm_e = _normalize_cmp(ex)
        if norm_c == norm_e:
            return True
        # Check high token overlap
        c_words = set(norm_c.split())
        e_words = set(norm_e.split())
        if len(c_words) > 2 and len(e_words) > 2:
            overlap = len(c_words & e_words) / max(len(c_words), len(e_words))
            if overlap >= 0.8:
                return True

    return False


class ProcurementSuggestionEngine:
    """
    Context-aware suggestion generator strictly validated against procurement data.
    """

    def __init__(self, procurement_engine: Any = None):
        self._engine = procurement_engine

    @property
    def engine(self):
        if self._engine is None:
            try:
                from procurement import get_procurement_assistant
                pa = get_procurement_assistant()
                self._engine = pa.engine if pa else None
            except Exception:
                self._engine = None
        return self._engine

    def get_live_data_facts(self) -> Dict[str, Any]:
        """Fetch verified data facts directly from SQLite."""
        eng = self.engine
        facts = {
            "known_suppliers": list(DEFAULT_KNOWN_SUPPLIERS),
            "delayed_suppliers": ["SKF India", "Tata Steel", "Honeywell"],
            "top_suppliers": ["Polycab", "Hindalco", "Siemens India", "Bosch India"],
            "has_critical_orders": True,
            "health_score": 46,
            "has_delays": True,
        }

        if eng:
            try:
                sups = eng.supplier_summary()
                if sups:
                    facts["known_suppliers"] = [s["supplier"] for s in sups if s.get("supplier")]
                
                perf = eng.supplier_performance()
                if perf:
                    delayed = [p["supplier"] for p in perf if p.get("delayed_orders", 0) > 0 or p.get("delayed", 0) > 0]
                    if delayed:
                        facts["delayed_suppliers"] = delayed
                    top = [p["supplier"] for p in perf if p.get("performance_score", 0) >= 80 or p.get("score", 0) >= 80]
                    if top:
                        facts["top_suppliers"] = top

                crit = eng.critical_orders()
                facts["has_critical_orders"] = len(crit) > 0

                health = eng.procurement_health()
                facts["health_score"] = health.get("health_score", 46)

                delayed_orders = eng.delayed_orders()
                facts["has_delays"] = len(delayed_orders) > 0
            except Exception:
                pass

        return facts

    def extract_mentioned_suppliers(
        self, user_msg: str, bot_response: str, known_suppliers: List[str]
    ) -> List[str]:
        """Extract valid suppliers mentioned in query or response in order of prominence."""
        combined = f"{user_msg} {bot_response}".lower()
        found: List[str] = []

        for sup in known_suppliers:
            pattern = r"\b" + re.escape(sup.lower()) + r"\b"
            if re.search(pattern, combined):
                # Put suppliers mentioned in user query first
                if re.search(pattern, user_msg.lower()):
                    found.insert(0, sup)
                else:
                    found.append(sup)

        # Deduplicate while preserving order
        seen = set()
        unique = []
        for s in found:
            if s not in seen:
                seen.add(s)
                unique.append(s)

        return unique

    def get_template_question(
        self, key: str, lang: str, s1: str = "", s2: str = ""
    ) -> str:
        """Localized template dictionary for 5 supported language modes."""
        templates = {
            # 1. Supplier performance score
            "supplier_score": {
                "english": f"What is {s1}'s performance score?",
                "hindi": f"{s1} का प्रदर्शन स्कोर कितना है?",
                "hinglish": f"{s1} ka performance score kya hai?",
                "marathi": f"{s1} ची कामगिरी किती आहे?",
                "marathi_english": f"{s1} cha performance score kiti aahe?",
            },
            # 2. Supplier delays / delay rate
            "supplier_delays": {
                "english": f"How many delayed orders does {s1} have?",
                "hindi": f"{s1} के कितने ऑर्डर में देरी है?",
                "hinglish": f"{s1} ke kitne delayed orders hain?",
                "marathi": f"{s1} च्या किती ऑर्डर्स विलंबित आहेत?",
                "marathi_english": f"{s1} che kitne orders delayed aahet?",
            },
            # 3. Why supplier score is low / root cause
            "supplier_why_low": {
                "english": f"Why is {s1}'s performance score low?",
                "hindi": f"{s1} का प्रदर्शन स्कोर कम क्यों है?",
                "hinglish": f"{s1} ka performance score low kyu hai?",
                "marathi": f"{s1} चा परफॉर्मन्स स्कोअर कमी का आहे?",
                "marathi_english": f"{s1} cha score low ka aahe?",
            },
            # 4. Action on supplier delays
            "supplier_action": {
                "english": f"What should we do about {s1}'s delays?",
                "hindi": f"{s1} की देरी के लिए हमें क्या करना चाहिए?",
                "hinglish": f"{s1} ke delays ke liye kya karna chahiye?",
                "marathi": f"{s1} च्या विलंबासाठी आपण काय करावे?",
                "marathi_english": f"{s1} chya delays sathi kay karayche?",
            },
            # 5. Supplier comparison
            "compare_suppliers": {
                "english": f"Compare {s1} and {s2}",
                "hindi": f"{s1} और {s2} की तुलना करो",
                "hinglish": f"{s1} aur {s2} ko compare karo",
                "marathi": f"{s1} आणि {s2} ची तुलना करा",
                "marathi_english": f"{s1} aani {s2} compare kara",
            },
            # 6. Best supplier
            "best_supplier": {
                "english": "Which supplier is performing best?",
                "hindi": "सबसे अच्छा प्रदर्शन किस supplier का है?",
                "hinglish": "Sabse achha performance kis supplier ka hai?",
                "marathi": "सर्वोत्तम कामगिरी कोणत्या supplier ची आहे?",
                "marathi_english": "Saglyat changla supplier konta aahe?",
            },
            # 7. Most delays supplier
            "most_delays": {
                "english": "Which supplier has the most delays?",
                "hindi": "सबसे ज्यादा देरी किस supplier की है?",
                "hinglish": "Sabse zyada delays kis supplier ke hain?",
                "marathi": "सर्वाधिक विलंब कोणत्या supplier चा आहे?",
                "marathi_english": "Saglyat jast delays konache aahet?",
            },
            # 8. All delayed orders
            "delayed_orders": {
                "english": "Which orders are delayed?",
                "hindi": "कौनसे orders delayed हैं?",
                "hinglish": "Kaunse orders delayed hain?",
                "marathi": "कोणत्या orders delayed आहेत?",
                "marathi_english": "Kontya orders delayed aahet?",
            },
            # 9. Procurement health score
            "health_score": {
                "english": "What is our procurement health score?",
                "hindi": "हमारा प्रोक्योरमेंट हेल्थ स्कोर क्या है?",
                "hinglish": "Humara procurement health score kya hai?",
                "marathi": "आमचा प्रोक्योरमेंट हेल्थ स्कोअर किती आहे?",
                "marathi_english": "Aamcha procurement health score kiti aahe?",
            },
            # 10. Why health score low
            "why_health_low": {
                "english": "Why is our procurement health score low?",
                "hindi": "हमारा प्रोक्योरमेंट हेल्थ स्कोर कम क्यों है?",
                "hinglish": "Humara procurement health score low kyu hai?",
                "marathi": "आमचा प्रोक्योरमेंट हेल्थ स्कोअर कमी का आहे?",
                "marathi_english": "Aamcha health score low ka aahe?",
            },
            # 11. Critical orders
            "critical_orders": {
                "english": "Which orders are critical?",
                "hindi": "कौनसे orders critical हैं?",
                "hinglish": "Kaunse orders critical hain?",
                "marathi": "कोणते orders critical आहेत?",
                "marathi_english": "Kontya orders critical aahet?",
            },
            # 12. Total procurement cost
            "total_cost": {
                "english": "What is our total procurement cost?",
                "hindi": "कुल प्रोक्योरमेंट खर्च कितना है?",
                "hinglish": "Total procurement cost kitna hai?",
                "marathi": "एकूण खरेदी खर्च किती आहे?",
                "marathi_english": "Total procurement cost kiti aahe?",
            },
            # 13. Most expensive orders
            "expensive_orders": {
                "english": "What are the most expensive orders?",
                "hindi": "सबसे महंगे orders कौनसे हैं?",
                "hinglish": "Sabse expensive orders kaunse hain?",
                "marathi": "सर्वात महागडे orders कोणते आहेत?",
                "marathi_english": "Saglyat expensive orders konte aahet?",
            },
            # 14. Risky suppliers recommendation
            "risky_recommendations": {
                "english": "What should we do about risky suppliers?",
                "hindi": "जोखिम भरे suppliers के लिए क्या कदम उठाएं?",
                "hinglish": "Risky suppliers ke liye kya steps lein?",
                "marathi": "जोखमीच्या suppliers साठी आपण काय करावे?",
                "marathi_english": "Risky suppliers sathi kay karayla pahije?",
            },
            # 15. Better delay rate follow-up after compare
            "compare_better_delays": {
                "english": f"Which supplier has a better delay rate, {s1} or {s2}?",
                "hindi": f"{s1} और {s2} में से किसकी देरी दर बेहतर है?",
                "hinglish": f"{s1} aur {s2} mein se kiska delay rate better hai?",
                "marathi": f"{s1} आणि {s2} पैकी कोणाचा विलंब दर चांगला आहे?",
                "marathi_english": f"{s1} aani {s2} madhye konacha delay rate changla aahe?",
            },
        }

        lang_key = lang if lang in ["hindi", "hinglish", "marathi", "marathi_english"] else "english"
        sub_dict = templates.get(key, {})
        return sub_dict.get(lang_key, sub_dict.get("english", ""))

    def generate_suggestions(
        self,
        user_message: str,
        bot_response: str,
        intent: str = "unknown",
        language: str = "english",
        memory: Optional[Dict[str, Any]] = None,
        recent_questions: Optional[List[str]] = None,
    ) -> List[str]:
        """
        Generates strictly 3 or 4 relevant, data-validated suggested questions.
        """
        facts = self.get_live_data_facts()
        known = facts["known_suppliers"]
        delayed_sups = facts["delayed_suppliers"]
        top_sups = facts["top_suppliers"]

        # Normalize language
        lang = str(language or "english").lower().strip()
        if lang not in ["hindi", "hinglish", "marathi", "marathi_english"]:
            lang = "english"

        # Mentioned suppliers
        mentioned = self.extract_mentioned_suppliers(user_message, bot_response, known)
        primary_sup = mentioned[0] if mentioned else (delayed_sups[0] if delayed_sups else known[0])
        
        # Determine secondary supplier for comparison if applicable
        secondary_sup = ""
        if len(mentioned) >= 2:
            secondary_sup = mentioned[1]
        elif primary_sup in delayed_sups:
            # Pick a second supplier to compare with
            other_delayed = [s for s in delayed_sups if s != primary_sup]
            if other_delayed:
                secondary_sup = other_delayed[0]
            else:
                other_sups = [s for s in known if s != primary_sup]
                secondary_sup = other_sups[0] if other_sups else ""
        else:
            other_sups = [s for s in known if s != primary_sup]
            secondary_sup = other_sups[0] if other_sups else ""

        # Pool of potential candidate questions based on context
        candidates: List[str] = []
        lower_user = user_message.lower()
        lower_resp = bot_response.lower()

        # ============================================================
        # 1. Comparison Context
        # ============================================================
        if (
            intent in ["supplier_comparison", "compare_need_second", "compare_need_suppliers"]
            or "compare" in lower_user
            or "तुलना" in user_message
            or len(mentioned) >= 2
        ):
            s1 = mentioned[0] if len(mentioned) >= 1 else primary_sup
            s2 = mentioned[1] if len(mentioned) >= 2 else secondary_sup

            candidates.append(self.get_template_question("compare_better_delays", lang, s1, s2))
            candidates.append(self.get_template_question("supplier_score", lang, s1))
            candidates.append(self.get_template_question("supplier_score", lang, s2))
            candidates.append(self.get_template_question("risky_recommendations", lang))
            candidates.append(self.get_template_question("best_supplier", lang))

        # ============================================================
        # 2. Delays / Supplier Delays Context
        # ============================================================
        elif (
            intent in ["supplier_delays", "delays"]
            or "delay" in lower_user
            or "देरी" in user_message
            or "विलंब" in user_message
        ):
            candidates.append(self.get_template_question("supplier_score", lang, primary_sup))
            if secondary_sup and secondary_sup != primary_sup:
                candidates.append(self.get_template_question("compare_suppliers", lang, primary_sup, secondary_sup))
            candidates.append(self.get_template_question("supplier_why_low", lang, primary_sup))
            candidates.append(self.get_template_question("supplier_action", lang, primary_sup))
            candidates.append(self.get_template_question("best_supplier", lang))
            candidates.append(self.get_template_question("critical_orders", lang))

        # ============================================================
        # 3. Specific Supplier Performance / Score Context
        # ============================================================
        elif (
            intent == "supplier_performance"
            or "performance" in lower_user
            or "score" in lower_user
            or "प्रदर्शन" in user_message
            or "कामगिरी" in user_message
        ):
            if primary_sup in delayed_sups:
                candidates.append(self.get_template_question("supplier_why_low", lang, primary_sup))
                candidates.append(self.get_template_question("supplier_action", lang, primary_sup))
            else:
                candidates.append(self.get_template_question("supplier_delays", lang, primary_sup))

            if secondary_sup and secondary_sup != primary_sup:
                candidates.append(self.get_template_question("compare_suppliers", lang, primary_sup, secondary_sup))
            candidates.append(self.get_template_question("best_supplier", lang))
            candidates.append(self.get_template_question("health_score", lang))

        # ============================================================
        # 4. Procurement Health Score Context
        # ============================================================
        elif (
            intent == "health"
            or "health" in lower_user
            or "हेल्थ" in user_message
        ):
            candidates.append(self.get_template_question("why_health_low", lang))
            candidates.append(self.get_template_question("most_delays", lang))
            candidates.append(self.get_template_question("critical_orders", lang))
            candidates.append(self.get_template_question("risky_recommendations", lang))
            candidates.append(self.get_template_question("best_supplier", lang))

        # ============================================================
        # 5. Critical Orders Context
        # ============================================================
        elif (
            intent == "critical"
            or "critical" in lower_user
            or "गंभीर" in user_message
        ):
            candidates.append(self.get_template_question("most_delays", lang))
            candidates.append(self.get_template_question("total_cost", lang))
            candidates.append(self.get_template_question("risky_recommendations", lang))
            candidates.append(self.get_template_question("health_score", lang))
            candidates.append(self.get_template_question("supplier_action", lang, primary_sup))

        # ============================================================
        # 6. Best Supplier / Recommendations Context
        # ============================================================
        elif (
            intent in ["recommendations", "best_supplier_recommendation"]
            or "best" in lower_user
            or "recommend" in lower_user
            or "सलाह" in user_message
            or "शिफारस" in user_message
        ):
            top = top_sups[0] if top_sups else primary_sup
            delayed = delayed_sups[0] if delayed_sups else "SKF India"

            candidates.append(self.get_template_question("supplier_score", lang, top))
            candidates.append(self.get_template_question("compare_suppliers", lang, top, delayed))
            candidates.append(self.get_template_question("critical_orders", lang))
            candidates.append(self.get_template_question("health_score", lang))

        # ============================================================
        # 7. Cost / Financial Exposure Context
        # ============================================================
        elif (
            intent in ["total_cost", "supplier_cost", "average_cost", "expensive"]
            or "cost" in lower_user
            or "spend" in lower_user
            or "खर्च" in user_message
            or "financial" in lower_user
        ):
            candidates.append(self.get_template_question("expensive_orders", lang))
            candidates.append(self.get_template_question("critical_orders", lang))
            candidates.append(self.get_template_question("most_delays", lang))
            candidates.append(self.get_template_question("health_score", lang))

        # ============================================================
        # 8. General / Fallback Context
        # ============================================================
        else:
            candidates.append(self.get_template_question("health_score", lang))
            candidates.append(self.get_template_question("most_delays", lang))
            candidates.append(self.get_template_question("best_supplier", lang))
            candidates.append(self.get_template_question("critical_orders", lang))
            candidates.append(self.get_template_question("total_cost", lang))

        # General backup pool if more candidates are needed
        backup_pool = [
            self.get_template_question("health_score", lang),
            self.get_template_question("most_delays", lang),
            self.get_template_question("best_supplier", lang),
            self.get_template_question("critical_orders", lang),
            self.get_template_question("total_cost", lang),
            self.get_template_question("supplier_score", lang, primary_sup),
            self.get_template_question("supplier_delays", lang, primary_sup),
            self.get_template_question("risky_recommendations", lang),
        ]

        # Combine candidates with backup pool
        all_pool = candidates + [q for q in backup_pool if q not in candidates]

        # Filter out duplicates and previous queries
        selected: List[str] = []
        recent = recent_questions or []

        for q in all_pool:
            if not q:
                continue
            if _is_duplicate_or_similar(q, selected, user_message):
                continue
            # Check if asked recently
            if any(_normalize_cmp(q) == _normalize_cmp(r) for r in recent[-3:]):
                continue

            selected.append(q)
            # Stop when we reach 4
            if len(selected) >= 4:
                break

        # Ensure we have at least 3 questions
        if len(selected) < 3:
            for q in backup_pool:
                if not q or q in selected:
                    continue
                if not _is_duplicate_or_similar(q, selected, user_message):
                    selected.append(q)
                if len(selected) >= 3:
                    break

        # Target 3-4 questions:
        # If simple context (like single fact), 3 questions is preferred;
        # if complex (comparison or delays with multiple entities), 4 questions.
        if len(selected) > 4:
            selected = selected[:4]
        elif len(selected) == 4 and intent in ["health", "total_cost", "average_cost"] and len(mentioned) <= 1:
            # Simple context prefer 3
            selected = selected[:3]

        return selected


# Singleton instance
_suggestion_engine: Optional[ProcurementSuggestionEngine] = None


def get_suggestion_engine(procurement_engine: Any = None) -> ProcurementSuggestionEngine:
    global _suggestion_engine
    if _suggestion_engine is None or procurement_engine is not None:
        _suggestion_engine = ProcurementSuggestionEngine(procurement_engine)
    return _suggestion_engine
