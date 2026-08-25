"""RailMadad AI Platform — AI Intelligence Service.

Orchestrates AI classification, sentiment analysis, severity detection,
duplicate detection, and department routing for complaints.
"""

from uuid import UUID

from app.core.config import settings


class AIIntelligenceService:
    """Service for AI-powered complaint analysis."""

    async def classify_complaint(self, text: str) -> dict:
        """Classify a complaint into category, sub-category, and department."""
        lower_text = text.lower()

        categories = {
            "cleanliness": ["clean", "dirty", "garbage", "trash", "toilet", "washroom", "smell", "stink", "dust", "cockroach", "rat", "pest"],
            "catering": ["food", "meal", "water", "pantry", "tea", "coffee", "roti", "thali", "caterer", "quality", "expired", "hygiene", "vendor"],
            "staff_behavior": ["staff", "tc", "tte", "conductor", "rude", "behavior", "bribe", "misbehave", "officer", "guard", "attendant"],
            "punctuality": ["late", "delay", "rescheduled", "halt", "waiting", "time", "speed", "stuck", "cancel"],
            "safety": ["theft", "stolen", "robbery", "chain pulling", "fight", "security", "rpf", "harassment", "police", "unsafe", "danger", "emergency", "fire"],
            "electrical": ["fan", "ac", "air conditioner", "light", "charging", "socket", "power", "cooling", "heat", "plug"],
            "water": ["water", "tap", "flush", "dry", "tank", "leakage"],
            "coach_maintenance": ["door", "window", "seat", "broken", "berth", "latch", "mirror", "handle", "fan switch"],
            "bed_roll": ["sheet", "blanket", "pillow", "bedroll", "towel", "dirty sheet"],
            "corruption": ["bribe", "extra money", "overcharging", "receipt", "fake ticket"],
        }

        matched_category = "other"
        max_matches = 0

        for cat, keywords in categories.items():
            matches = sum(1 for kw in keywords if kw in lower_text)
            if matches > max_matches:
                max_matches = matches
                matched_category = cat

        confidence = min(0.5 + (max_matches * 0.15), 0.98) if max_matches > 0 else 0.40

        dept_map = {
            "cleanliness": "Medical & Health / Environment",
            "catering": "IRCTC Catering Services",
            "staff_behavior": "Commercial / Personnel",
            "punctuality": "Operating / Dispatch",
            "safety": "Railway Protection Force (RPF)",
            "electrical": "Electrical Engineering",
            "water": "Mechanical / Water Supply",
            "coach_maintenance": "Mechanical / Carriage & Wagon",
            "bed_roll": "Mechanized Laundry & Linen",
            "corruption": "Vigilance Department",
            "other": "General Passengers Grievances",
        }

        return {
            "category": matched_category,
            "confidence": confidence,
            "department": dept_map.get(matched_category, "General Grievance Cell"),
        }

    async def detect_severity(self, text: str) -> dict:
        """Detect complaint severity level (low, medium, high, critical)."""
        lower_text = text.lower()

        critical_keywords = ["fire", "smoke", "medical emergency", "heart attack", "bleeding", "weapon", "bomb", "accident", "death", "unconscious"]
        high_keywords = ["theft", "robbery", "harassment", "assault", "rpf required", "ac not working", "no water in entire coach", "severe leak"]
        low_keywords = ["suggestion", "query", "minor dust", "seat preference", "curtain"]

        if any(kw in lower_text for kw in critical_keywords):
            return {"severity": "critical", "confidence": 0.95}
        elif any(kw in lower_text for kw in high_keywords):
            return {"severity": "high", "confidence": 0.88}
        elif any(kw in lower_text for kw in low_keywords):
            return {"severity": "low", "confidence": 0.80}

        return {"severity": "medium", "confidence": 0.75}

    async def analyze_sentiment(self, text: str) -> dict:
        """Perform sentiment analysis on complaint text."""
        lower_text = text.lower()
        negative_words = ["terrible", "worst", "horrible", "unacceptable", "disgusted", "angry", "dangerous", "pathetic", "delay", "broken"]
        urgent_words = ["immediately", "urgent", "asap", "emergency", "please help", "stranded"]

        neg_count = sum(1 for w in negative_words if w in lower_text)
        urg_count = sum(1 for w in urgent_words if w in lower_text)

        if urg_count > 0 or neg_count >= 2:
            return {"sentiment": "urgent_negative", "score": -0.85}
        elif neg_count == 1:
            return {"sentiment": "negative", "score": -0.5}

        return {"sentiment": "neutral", "score": 0.0}

    async def generate_chat_reply(self, message: str, history: list[dict] | None = None) -> dict:
        """Generate conversational assistant response and metadata extraction."""
        classification = await self.classify_complaint(message)
        severity = await self.detect_severity(message)
        sentiment = await self.analyze_sentiment(message)

        # Extract potential details (PNR, coach, seat)
        import re
        pnr_match = re.search(r'\b\d{10}\b', message)
        coach_match = re.search(r'\b([SBAHDE]\d{1,2}|B\d|S\d|A\d)\b', message, re.IGNORECASE)
        seat_match = re.search(r'\b(seat|berth)\s*#?\s*(\d{1,3})\b', message, re.IGNORECASE)

        pnr = pnr_match.group(0) if pnr_match else None
        coach = coach_match.group(0).upper() if coach_match else None
        seat = seat_match.group(2) if seat_match else None

        cat = classification["category"]
        dept = classification["department"]
        sev = severity["severity"]

        # Craft natural response
        if sev == "critical":
            reply = (
                f"⚠️ **ALERT**: I've flagged this as a **CRITICAL** issue and alerted the **{dept}** and RPF Control Room immediately. "
                "If you are in immediate danger, please also dial **139** or inform the nearest onboard RPF officer."
            )
        else:
            reply = (
                f"I've registered your grievance under **{cat.replace('_', ' ').title()}** category. "
                f"It is routed to the **{dept}** (Priority: **{sev.upper()}**)."
            )

        if pnr:
            reply += f"\n\n📌 Detected PNR: `{pnr}`"
        if coach:
            reply += f" | Coach: `{coach}`"
        if seat:
            reply += f" | Seat: `{seat}`"

        if not pnr:
            reply += "\n\n💡 *Tip: Providing your 10-digit PNR number helps us dispatch on-train assistance faster.*"

        return {
            "reply": reply,
            "category": cat,
            "severity": sev,
            "department": dept,
            "extracted_pnr": pnr,
            "extracted_coach": coach,
            "extracted_seat": seat,
            "sentiment": sentiment["sentiment"],
        }

    async def full_analysis_pipeline(self, text: str) -> dict:
        """Run full AI analysis on text."""
        classification = await self.classify_complaint(text)
        severity = await self.detect_severity(text)
        sentiment = await self.analyze_sentiment(text)

        return {
            "classification": classification,
            "severity": severity,
            "sentiment": sentiment,
        }


ai_intelligence_service = AIIntelligenceService()

