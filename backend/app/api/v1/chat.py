"""RailMadad AI Platform — Conversational AI Chat Route."""

import random
import string
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Complaint, ComplaintStatus, ComplaintSeverity, ComplaintCategory, ComplaintStatusHistory
from app.services.ai_intelligence import ai_intelligence_service

router = APIRouter()


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    complaint_id: Optional[UUID] = None
    history: Optional[list[dict]] = None
    auto_create_complaint: bool = True


class ChatResponse(BaseModel):
    reply: str
    category: Optional[str] = None
    severity: Optional[str] = None
    department: Optional[str] = None
    extracted_pnr: Optional[str] = None
    extracted_coach: Optional[str] = None
    extracted_seat: Optional[str] = None
    complaint_id: Optional[UUID] = None
    complaint_number: Optional[str] = None


@router.post("/", response_model=ChatResponse)
async def process_chat(
    payload: ChatMessageRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """Conversational AI Assistant endpoint.
    Analyses user message, classifies grievance, extracts details,
    generates guidance reply, and optionally registers/updates complaint record.
    """
    ai_result = await ai_intelligence_service.generate_chat_reply(
        message=payload.message,
        history=payload.history,
    )

    created_complaint_id = None
    created_complaint_number = None

    if payload.auto_create_complaint:
        cat_val = ai_result["category"]
        sev_val = ai_result["severity"]

        cat_enum = ComplaintCategory(cat_val) if cat_val in [c.value for c in ComplaintCategory] else ComplaintCategory.OTHER
        sev_enum = ComplaintSeverity(sev_val) if sev_val in [s.value for s in ComplaintSeverity] else ComplaintSeverity.MEDIUM

        year = datetime.now().year
        rand_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
        comp_num = f"RM-{year}-{rand_str}"

        title_preview = payload.message[:60] + "..." if len(payload.message) > 60 else payload.message

        complaint = Complaint(
            complaint_number=comp_num,
            title=title_preview,
            description=payload.message,
            category=cat_enum,
            status=ComplaintStatus.SUBMITTED,
            severity=sev_enum,
            pnr_number=ai_result["extracted_pnr"],
            coach_number=ai_result["extracted_coach"],
            seat_number=ai_result["extracted_seat"],
        )

        db.add(complaint)
        await db.flush()

        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            previous_status=None,
            new_status=ComplaintStatus.SUBMITTED,
            remarks="Registered via Conversational AI Assistant",
        )
        db.add(history)
        await db.commit()
        await db.refresh(complaint)

        created_complaint_id = complaint.id
        created_complaint_number = complaint.complaint_number

    return ChatResponse(
        reply=ai_result["reply"],
        category=ai_result["category"],
        severity=ai_result["severity"],
        department=ai_result["department"],
        extracted_pnr=ai_result["extracted_pnr"],
        extracted_coach=ai_result["extracted_coach"],
        extracted_seat=ai_result["extracted_seat"],
        complaint_id=created_complaint_id,
        complaint_number=created_complaint_number,
    )
