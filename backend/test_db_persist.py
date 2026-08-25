import asyncio
from app.core.database import async_session_factory
from app.models import Complaint, ComplaintStatus, ComplaintCategory, ComplaintSeverity

async def seed_test_complaint():
    async with async_session_factory() as db:
        complaint = Complaint(
            complaint_number="RM-2026-PERSIST01",
            title="AC Failure in Coach B2 seat 45",
            description="Air conditioning unit is non-functional in Coach B2.",
            category=ComplaintCategory.ELECTRICAL,
            status=ComplaintStatus.SUBMITTED,
            severity=ComplaintSeverity.HIGH,
            pnr_number="9876543210",
            coach_number="B2",
            seat_number="45"
        )
        db.add(complaint)
        await db.commit()
        print("✅ Successfully inserted test complaint into railmadad.db!")

if __name__ == "__main__":
    asyncio.run(seed_test_complaint())
