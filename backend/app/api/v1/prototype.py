"""RailMadad AI Platform — Emergency & Special Category Real Email & Prototype Notification Router."""

import asyncio
import os
import uuid
import smtplib
from email.message import EmailMessage
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.database import async_session_factory
from app.models import Complaint, ComplaintCategory, ComplaintStatus, ComplaintSeverity

# Load .env file explicitly
load_dotenv()

router = APIRouter()

PROTOTYPE_API_KEY = "railmadad-prototype-secret-key"

class ComplaintIncoming(BaseModel):
    title: str
    description: str
    pnr_number: Optional[str] = None
    passenger_email: Optional[EmailStr] = None
    is_emergency: bool = False


def send_email_in_background(subject: str, body: str, recipient: str):
    """Background task to dispatch SMTP email asynchronously without blocking the event loop."""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    email_from = os.getenv("EMAIL_FROM", smtp_user or "notifications@railmadad.in").strip()

    msg = EmailMessage()
    msg["Subject"] = f"🚨 [RAILMADAD ALERT] {subject}"
    msg["From"] = email_from
    msg["To"] = recipient
    msg.set_content(body)

    if smtp_user and smtp_password:
        try:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            print(f"✅ [REAL EMAIL DISPATCHED SUCCESSFULLY]: To '{recipient}' via {smtp_server}")
        except Exception as err:
            print(f"❌ [SMTP ERROR]: Could not send email to '{recipient}': {err}")
    else:
        print(f"[OFFICER NOTIFICATION SIMULATED]: Subject='{subject}' -> Recipient='{recipient}'")


@router.post("/complaint")
async def process_incoming_complaint(
    payload: ComplaintIncoming,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> dict:
    """Process incoming grievance, tag special categories, notify authorized officer asynchronously, and persist to database."""
    if x_api_key and x_api_key != PROTOTYPE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid API Key or security token.",
        )

    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    recipient = os.getenv("AUTHORIZED_OFFICER_EMAIL", "mohan15vk@gmail.com").strip()

    desc_lower = payload.description.lower()
    critical_keywords = ["fire", "smoke", "medical emergency", "heart attack", "theft", "stolen", "harassment", "rpf"]
    
    is_special = payload.is_emergency or any(kw in desc_lower for kw in critical_keywords)
    category_tag = "SPECIAL_CATEGORY_CRITICAL" if is_special else "STANDARD_GRIEVANCE"

    # ── 1. Save Complaint Record to Database ──────────────────
    complaint_num = f"RM-2026-{uuid.uuid4().hex[:6].upper()}"
    new_complaint = Complaint(
        complaint_number=complaint_num,
        title=payload.title,
        description=payload.description,
        pnr_number=payload.pnr_number,
        category=ComplaintCategory.SAFETY if is_special else ComplaintCategory.OTHER,
        status=ComplaintStatus.SUBMITTED,
        severity=ComplaintSeverity.CRITICAL if is_special else ComplaintSeverity.MEDIUM,
    )

    async with async_session_factory() as db:
        db.add(new_complaint)
        await db.commit()

    # ── 2. Schedule Non-Blocking Email Dispatch ───────────────
    if is_special:
        email_body = (
            f"🚨 SPECIAL CATEGORY GRIEVANCE REGISTERED\n\n"
            f"Complaint Number: {complaint_num}\n"
            f"Title: {payload.title}\n"
            f"Details: {payload.description}\n"
            f"PNR: {payload.pnr_number or 'N/A'}\n"
            f"Passenger Email: {payload.passenger_email or 'N/A'}\n"
            f"Assigned Officer: {recipient}\n"
        )
        background_tasks.add_task(
            send_email_in_background,
            subject=f"CRITICAL GRIEVANCE: {payload.title[:50]}",
            body=email_body,
            recipient=recipient,
        )

    return {
        "status": "processed",
        "complaint_number": complaint_num,
        "complaint_id": str(new_complaint.id),
        "category_tag": category_tag,
        "is_special_category": is_special,
        "officer_notified": is_special,
        "authorized_officer": recipient,
        "smtp_configured": bool(smtp_user and smtp_password)
    }
