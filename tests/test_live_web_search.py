"""
Automated Test Suite for MandiSetu Live Web Search Integration.
Validates all scenarios specified in the requirements:
1. current mandi price -> external search
2. today's weather -> external search/weather
3. latest government scheme -> external search
4. current advisory -> external search
5. normal agronomy question -> NOT forced to external search
6. token status -> NOT external search
7. payment status -> NOT external search
8. booking status -> NOT external search
9. Hindi current-weather query -> external search
10. Marathi current-weather query -> external search
11. Hinglish mandi-price query -> external search
12. Mocked Tavily provider pipeline test
13. Anti-hallucination test when search results are empty
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHATBOT_DIR = os.path.join(BASE_DIR, "chatbot")
if CHATBOT_DIR not in sys.path:
    sys.path.insert(0, CHATBOT_DIR)

from web_search import (
    is_external_search_query,
    build_search_query,
    perform_web_search,
    format_web_search_answer,
)
from assistant import ProcureAIAssistant


class TestLiveWebSearchModule(unittest.TestCase):
    def setUp(self):
        self.assistant = ProcureAIAssistant()

    # 1. current mandi price -> external search
    def test_01_current_mandi_price_triggers_search(self):
        q = "What is today's soybean mandi price?"
        self.assertTrue(is_external_search_query(q))
        built = build_search_query(q, {"state": "Maharashtra", "district": "Nagpur"})
        self.assertIn("soybean", built.lower())
        self.assertTrue("mandi" in built.lower() or "price" in built.lower())

    # 2. today's weather -> external search/weather
    def test_02_todays_weather_triggers_search(self):
        q = "What is today's weather in Hapur?"
        self.assertTrue(is_external_search_query(q))
        built = build_search_query(q, {"state": "Uttar Pradesh", "district": "Hapur"})
        self.assertTrue("weather" in built.lower() or "forecast" in built.lower())

    # 3. latest government scheme -> external search
    def test_03_latest_government_scheme_triggers_search(self):
        q = "What is the latest PM-KISAN update?"
        self.assertTrue(is_external_search_query(q))
        built = build_search_query(q)
        self.assertTrue("pm-kisan" in built.lower() or "pm kisan" in built.lower())

    # 4. current advisory -> external search
    def test_04_current_advisory_triggers_search(self):
        q = "Latest agriculture advisory for wheat this week"
        self.assertTrue(is_external_search_query(q))
        self.assertTrue(is_external_search_query("गेहूं फसल के लिए आज की कृषि सलाह"))

    # 5. normal agronomy question -> NOT forced to external search
    def test_05_normal_agronomy_not_forced_to_search(self):
        self.assertFalse(is_external_search_query("What is crop rotation?"))
        self.assertFalse(is_external_search_query("What is DAP?"))
        self.assertFalse(is_external_search_query("Why are my wheat leaves yellow?"))
        self.assertFalse(is_external_search_query("What is photosynthesis?"))
        self.assertFalse(is_external_search_query("How does fertilizer work?"))

    # 6. token status -> NOT external search
    def test_06_token_status_not_external_search(self):
        q = "What is my token status?"
        self.assertFalse(is_external_search_query(q))
        res = self.assistant.ask(q, farmer_id="farmer-001")
        self.assertIn("M-142", res)
        self.assertIn("Ramesh Singh", res)
        # Verify it stayed on database/operational path
        self.assertIsNone(self.assistant.last_source_metadata)

    # 7. payment status -> NOT external search
    def test_07_payment_status_not_external_search(self):
        q = "What is my payment status?"
        self.assertFalse(is_external_search_query(q))
        res = self.assistant.ask(q, farmer_id="farmer-001")
        self.assertTrue("₹56,875" in res or "PROCESSING" in res or "Wheat" in res)
        self.assertIsNone(self.assistant.last_source_metadata)

    # 8. booking status -> NOT external search
    def test_08_booking_status_not_external_search(self):
        q = "Where is my booking?"
        self.assertFalse(is_external_search_query(q))
        res = self.assistant.ask(q, farmer_id="farmer-001")
        self.assertTrue("book-101" in res or "स्लॉट" in res or "Centre" in res or "CONFIRMED" in res)
        self.assertIsNone(self.assistant.last_source_metadata)

    # 9. Hindi current-weather query
    def test_09_hindi_current_weather_triggers_search(self):
        q = "आज मेरे इलाके में बारिश होगी क्या?"
        self.assertTrue(is_external_search_query(q))

    # 10. Marathi current-weather query
    def test_10_marathi_current_weather_triggers_search(self):
        q = "आज हवामान अंदाज काय आहे आणि पाऊस पडेल का?"
        self.assertTrue(is_external_search_query(q))

    # 11. Hinglish mandi-price query
    def test_11_hinglish_mandi_price_triggers_search(self):
        q = "Aaj gehu ka mandi bhav kya chal raha hai?"
        self.assertTrue(is_external_search_query(q))

    # 12. Mocked Tavily provider pipeline test
    @patch("web_search._search_tavily")
    def test_12_mock_tavily_search_pipeline(self, mock_tavily):
        mock_tavily.return_value = [
            {
                "title": "Agmarknet Hapur Wheat Modal Price Today",
                "url": "https://agmarknet.gov.in/price/wheat",
                "source": "agmarknet.gov.in",
                "snippet": "Wheat modal mandi rate in Hapur APMC today is ₹2,425/quintal with arrivals of 1,200 quintals.",
                "published_date": "Today"
            }
        ]
        import web_search
        with patch.object(web_search, "WEB_SEARCH_API_KEY", "test-tavily-key"):
            results = web_search.perform_web_search("wheat price today Hapur")
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["source"], "agmarknet.gov.in")
            self.assertIn("₹2,425", results[0]["snippet"])

            # Test format_web_search_answer
            ans, meta = format_web_search_answer(results, language="english", commodity="Wheat")
            self.assertIn("₹2,425", ans)
            self.assertIn("agmarknet.gov.in", ans)
            self.assertEqual(meta["source"], "agmarknet.gov.in")
            self.assertEqual(meta["status"], "success")

    # 13. Anti-hallucination test when search results are empty
    def test_13_anti_hallucination_empty_results(self):
        ans_en, meta_en = format_web_search_answer([], language="english")
        self.assertIn("could not be retrieved", ans_en)
        self.assertIsNone(meta_en)

        ans_hi, meta_hi = format_web_search_answer([], language="hindi")
        self.assertTrue("प्राप्त नहीं हो सकी" in ans_hi or "अनुपलब्ध" in ans_hi)
        self.assertIsNone(meta_hi)

        ans_mr, meta_mr = format_web_search_answer([], language="marathi")
        self.assertTrue("उपलब्ध होऊ शकली नाही" in ans_mr or "अनुपलब्ध" in ans_mr)
        self.assertIsNone(meta_mr)


    # 14. Weather with a valid farmer location uses that location
    def test_14_weather_with_valid_location_uses_that_location(self):
        loc = {"district": "Nagpur", "state": "Maharashtra"}
        built = build_search_query("today's weather", farmer_location=loc)
        self.assertIn("Nagpur", built)
        self.assertIn("Maharashtra", built)
        self.assertNotIn("Hapur", built)

    # 15. Weather without a location does not use Hapur or another fabricated location
    def test_15_weather_without_location_does_not_use_hapur(self):
        # build_search_query should not invent Hapur
        built = build_search_query("today's weather", farmer_location=None)
        self.assertNotIn("Hapur", built)
        self.assertNotIn("Uttar Pradesh", built)

        # perform_web_search without location must not default to Hapur
        results = perform_web_search("today's weather", farmer_location=None)
        self.assertTrue(len(results) > 0)
        self.assertTrue(results[0].get("location_required", False))
        self.assertNotIn("Hapur", results[0].get("snippet", ""))

        # format_web_search_answer produces location-required guidance
        ans, meta = format_web_search_answer(results, language="english")
        self.assertIn("specify your district or city", ans.lower())
        self.assertNotIn("Hapur", ans)
        self.assertEqual(meta.get("status"), "location_required")

    # 16. General search without a location does not invent a location
    def test_16_general_search_without_location_does_not_invent_location(self):
        built_price = build_search_query("soybean mandi price today", farmer_location=None)
        self.assertNotIn("Hapur", built_price)
        self.assertNotIn("Uttar Pradesh", built_price)
        self.assertNotIn("Maharashtra", built_price)

        built_scheme = build_search_query("PM-KISAN latest update", farmer_location=None)
        self.assertNotIn("Hapur", built_scheme)
        self.assertNotIn("Uttar Pradesh", built_scheme)


if __name__ == "__main__":
    unittest.main(verbosity=2)
