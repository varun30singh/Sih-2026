"""
Comprehensive Automated Verification Test Suite for MandiSetu AI Farmer Assistant.
Validates all 12 key dialogue and routing scenarios specified in the Implementation Plan.
"""

import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHATBOT_DIR = os.path.join(BASE_DIR, "chatbot")
if CHATBOT_DIR not in sys.path:
    sys.path.insert(0, CHATBOT_DIR)

from assistant import ProcureAIAssistant


class TestMandiSetuAIAssistant(unittest.TestCase):
    def setUp(self):
        self.assistant = ProcureAIAssistant()

    def test_01_english_token_status(self):
        """Scenario 1: English token status enquiry for authenticated farmer Ramesh Singh"""
        res = self.assistant.ask("What is my current token status?", farmer_id="farmer-001")
        self.assertIn("M-142", res)
        self.assertIn("Ramesh Singh", res)
        self.assertIn("Wheat", res)

    def test_02_hindi_token_status(self):
        """Scenario 2: Hindi token queue turn query"""
        res = self.assistant.ask("मेरा टोकन कितने नंबर पर है?", farmer_id="farmer-001")
        self.assertIn("M-142", res)
        self.assertTrue("कतार" in res or "प्रतीक्षा" in res or "नंबर" in res)

    def test_03_marathi_payment_status(self):
        """Scenario 3: Marathi payment status query"""
        res = self.assistant.ask("माझं पेमेंट कधी येणार?", farmer_id="farmer-001")
        self.assertTrue("₹56,875" in res or "प्रक्रियेत" in res or "जमा" in res)

    def test_04_hinglish_slot_booking(self):
        """Scenario 4: Hinglish slot inquiry"""
        res = self.assistant.ask("Mera slot kab hai?", farmer_id="farmer-001")
        self.assertTrue("10:00 AM" in res or "स्लॉट" in res or "Slot" in res)

    def test_05_agricultural_knowledge(self):
        """Scenario 5: General agricultural ontology query (Crop rotation)"""
        res = self.assistant.ask("What is crop rotation?", farmer_id="farmer-001")
        self.assertIn("rotation", res.lower())
        self.assertTrue("soil" in res.lower() or "fertility" in res.lower() or "pest" in res.lower())

    def test_06_mandisetu_shortest_queue(self):
        """Scenario 6: MandiSetu live queue query for shortest queue centre"""
        res = self.assistant.ask("Which procurement centre has the shortest queue?", farmer_id="farmer-001")
        self.assertTrue("Centre" in res or "Bulandshahr" in res or "Shortest Queue" in res or "Wait" in res)

    def test_07_personal_sales_history(self):
        """Scenario 7: Authenticated farmer previous sales history"""
        res = self.assistant.ask("What did I sell last time?", farmer_id="farmer-001")
        self.assertTrue("Mustard" in res or "Wheat" in res or "Soybean" in res)

    def test_08_follow_up_context_mandi(self):
        """Scenario 8: Context carry-forward (What was my wheat sale? -> At which mandi?)"""
        session_id = "test-session-context-1"
        res1 = self.assistant.ask("What was my wheat sale?", farmer_id="farmer-001", session_id=session_id)
        self.assertTrue("Wheat" in res1 or "2,275" in res1)

        res2 = self.assistant.ask("At which mandi?", farmer_id="farmer-001", session_id=session_id)
        self.assertTrue("Hapur" in res2 or "Centre" in res2 or "mandi" in res2.lower())

    def test_09_queue_follow_up(self):
        """Scenario 9: Queue turn followed by wait time query"""
        session_id = "test-session-context-2"
        res1 = self.assistant.ask("How many farmers are ahead of me?", farmer_id="farmer-001", session_id=session_id)
        self.assertTrue("ahead" in res1.lower() or "8" in res1)

        res2 = self.assistant.ask("How long will it take?", farmer_id="farmer-001", session_id=session_id)
        self.assertTrue("minute" in res2.lower() or "wait" in res2.lower() or "45" in res2)

    def test_10_unrelated_out_of_scope(self):
        """Scenario 10: Non-agricultural / out-of-scope redirection"""
        res = self.assistant.ask("What is the capital of Japan?", farmer_id="farmer-001")
        self.assertTrue("MandiSetu" in res or "farming" in res.lower() or "mandi" in res.lower())

    def test_11_missing_data_transparency(self):
        """Scenario 11: Missing data transparency when asking for a crop never sold"""
        res = self.assistant.ask("How much cotton did I sell?", farmer_id="farmer-001")
        self.assertTrue("couldn't find" in res.lower() or "no record" in res.lower() or "not find" in res.lower())

    def test_12_language_persistence(self):
        """Scenario 12: Language continuity (Hindi query followed by Hindi follow-up)"""
        session_id = "test-session-lang-1"
        res1 = self.assistant.ask("मेरा टोकन कब आएगा?", farmer_id="farmer-001", session_id=session_id)
        self.assertTrue("टोकन" in res1 or "कतार" in res1)

        res2 = self.assistant.ask("और मेरा पेमेंट?", farmer_id="farmer-001", session_id=session_id)
        self.assertTrue("रुपये" in res2 or "भुगतान" in res2 or "खाते" in res2 or "पेमेंट" in res2 or "₹" in res2)

    def test_13_gemini_tomato_yellow_leaves_english(self):
        """Scenario 13: Agricultural intelligence query in English handled with safety"""
        res = self.assistant.ask("Why are my tomato leaves turning yellow?", farmer_id="farmer-001")
        self.assertTrue(any(w in res.lower() for w in ["factor", "cause", "nutrient", "leaf", "leaves", "yellow", "kvk", "tomato"]))
        # Verify source metadata
        meta = self.assistant.last_source_metadata
        if meta:
            self.assertEqual(meta.get("source"), "Google Gemini Agricultural Intelligence")

    def test_14_gemini_marathi_leaf_spots(self):
        """Scenario 14: Agricultural disease query in Marathi in Devanagari script"""
        res = self.assistant.ask("माझ्या टोमॅटोच्या पानांवर पिवळे डाग पडले आहेत, काय करावे?", farmer_id="farmer-001")
        self.assertTrue(any(w in res for w in ["टोमॅटो", "पान", "पिवळ", "कारण", "रोग", "उपाय", "खत"]))

    def test_15_gemini_missing_key_graceful_fallback(self):
        """Scenario 15: Missing or invalid Gemini API key degrades gracefully without crashing"""
        import os
        original_key = os.environ.get("GEMINI_API_KEY")
        try:
            os.environ["GEMINI_API_KEY"] = ""
            res = self.assistant.ask("Why are my potato leaves curling?", farmer_id="farmer-001")
            self.assertIsInstance(res, str)
            self.assertTrue(len(res) > 0)
        finally:
            if original_key:
                os.environ["GEMINI_API_KEY"] = original_key


if __name__ == "__main__":
    unittest.main(verbosity=2)

