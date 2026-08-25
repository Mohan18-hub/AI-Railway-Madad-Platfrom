"""RailMadad AI Platform — Native Standalone Test Suite."""

import asyncio
import unittest
from app.services.ai_intelligence import ai_intelligence_service


class TestAIIntelligence(unittest.TestCase):

    def test_classification_cleanliness(self):
        async def run():
            res = await ai_intelligence_service.classify_complaint("The toilet in coach B2 is dirty")
            self.assertEqual(res["category"], "cleanliness")
            self.assertIn("Health", res["department"])
        asyncio.run(run())

    def test_classification_electrical(self):
        async def run():
            res = await ai_intelligence_service.classify_complaint("AC fan air conditioner stopped working")
            self.assertEqual(res["category"], "electrical")
        asyncio.run(run())

    def test_severity_critical(self):
        async def run():
            res = await ai_intelligence_service.detect_severity("Fire in coach S3 emergency")
            self.assertEqual(res["severity"], "critical")
        asyncio.run(run())

    def test_severity_high(self):
        async def run():
            res = await ai_intelligence_service.detect_severity("Handbag stolen RPF required")
            self.assertEqual(res["severity"], "high")
        asyncio.run(run())

    def test_chat_reply_generation(self):
        async def run():
            res = await ai_intelligence_service.generate_chat_reply("AC not cooling in coach B2 seat 45 PNR 2415678901")
            self.assertEqual(res["category"], "electrical")
            self.assertEqual(res["extracted_pnr"], "2415678901")
            self.assertEqual(res["extracted_coach"], "B2")
            self.assertEqual(res["extracted_seat"], "45")
            self.assertIn("Electrical", res["department"])
        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
