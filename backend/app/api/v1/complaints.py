"""RailMadad AI Platform — Complaint Management Routes."""

import random
import string
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Complaint, ComplaintStatus, ComplaintSeverity, ComplaintCategory, Attachment, ComplaintStatusHistory
from app.schemas import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
    ComplaintListResponse,
    FeedbackCreate,
    FeedbackResponse,
    MessageResponse,
)
from app.services.ai_intelligence import ai_intelligence_service

router = APIRouter()


def generate_complaint_number() -> str:
    """Generate a unique complaint number format: RM-YYYY-XXXXX."""
    year = datetime.now().year
    rand_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"RM-{year}-{rand_str}"


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    payload: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
) -> ComplaintResponse:
    """Register a new complaint. Runs AI classification automatically."""
    if not payload.title or not payload.description:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title and description are required")

    # Run AI intelligence pipeline on description
    ai_res = await ai_intelligence_service.full_analysis_pipeline(f"{payload.title} - {payload.description}")
    ai_cat = ai_res["classification"]["category"]
    ai_sev = ai_res["severity"]["severity"]

    # Use provided category if present, else AI category
    category_val = payload.category or ai_cat
    try:
        cat_enum = ComplaintCategory(category_val) if category_val in [c.value for c in ComplaintCategory] else ComplaintCategory.OTHER
    except Exception:
        cat_enum = ComplaintCategory.OTHER

    try:
        sev_enum = ComplaintSeverity(ai_sev) if ai_sev in [s.value for s in ComplaintSeverity] else ComplaintSeverity.MEDIUM
    except Exception:
        sev_enum = ComplaintSeverity.MEDIUM

    complaint = Complaint(
        complaint_number=generate_complaint_number(),
        title=payload.title,
        description=payload.description,
        category=cat_enum,
        sub_category=payload.sub_category,
        status=ComplaintStatus.SUBMITTED,
        severity=sev_enum,
        pnr_number=payload.pnr_number,
        coach_number=payload.coach_number,
        seat_number=payload.seat_number,
        journey_date=payload.journey_date,
        location_lat=payload.location_lat,
        location_lng=payload.location_lng,
    )

    db.add(complaint)
    await db.flush()

    # Initial status history record
    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        previous_status=None,
        new_status=ComplaintStatus.SUBMITTED,
        remarks="Complaint registered via AI Platform",
    )
    db.add(history)
    await db.commit()
    await db.refresh(complaint)

    return complaint


@router.get("/", response_model=ComplaintListResponse)
async def list_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> ComplaintListResponse:
    """List complaints with pagination and filters."""
    query = select(Complaint)

    if status_filter:
        query = query.where(Complaint.status == status_filter)
    if category:
        query = query.where(Complaint.category == category)
    if severity:
        query = query.where(Complaint.severity == severity)
    if search:
        query = query.where(
            or_(
                Complaint.title.ilike(f"%{search}%"),
                Complaint.description.ilike(f"%{search}%"),
                Complaint.complaint_number.ilike(f"%{search}%"),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar_one_or_none() or 0

    # Paginate and order by newest
    query = query.order_by(Complaint.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    complaints = result.scalars().all()

    return ComplaintListResponse(
        complaints=complaints,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/track/{complaint_number}", response_model=ComplaintResponse)
async def track_complaint(
    complaint_number: str,
    db: AsyncSession = Depends(get_db),
) -> ComplaintResponse:
    """Track a complaint by its public complaint number."""
    query = select(Complaint).where(Complaint.complaint_number == complaint_number)
    result = await db.execute(query)
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint '{complaint_number}' not found")

    return complaint


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> ComplaintResponse:
    """Get complaint details by ID."""
    query = select(Complaint).where(Complaint.id == complaint_id)
    result = await db.execute(query)
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    return complaint


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: UUID,
    payload: ComplaintUpdate,
    db: AsyncSession = Depends(get_db),
) -> ComplaintResponse:
    """Update complaint status, severity, category, or department."""
    query = select(Complaint).where(Complaint.id == complaint_id)
    result = await db.execute(query)
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    prev_status = complaint.status

    if payload.title:
        complaint.title = payload.title
    if payload.description:
        complaint.description = payload.description
    if payload.category:
        complaint.category = payload.category
    if payload.severity:
        complaint.severity = payload.severity
    if payload.department_id:
        complaint.department_id = payload.department_id

    if payload.status and payload.status != complaint.status:
        try:
            new_status_enum = ComplaintStatus(payload.status)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status '{payload.status}'")

        complaint.status = new_status_enum
        if new_status_enum in (ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED):
            complaint.resolved_at = datetime.now(timezone.utc)

        # Record status history transition
        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            previous_status=prev_status,
            new_status=new_status_enum,
            remarks=f"Status changed from {prev_status} to {new_status_enum}",
        )
        db.add(history)

    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: UUID,
    new_status: str = Query(..., description="New status to set"),
    remarks: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> ComplaintResponse:
    """Dedicated status transition endpoint."""
    query = select(Complaint).where(Complaint.id == complaint_id)
    result = await db.execute(query)
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    try:
        new_status_enum = ComplaintStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status '{new_status}'")

    prev_status = complaint.status
    complaint.status = new_status_enum
    if new_status_enum in (ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED):
        complaint.resolved_at = datetime.now(timezone.utc)

    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        previous_status=prev_status,
        new_status=new_status_enum,
        remarks=remarks or f"Status updated to {new_status_enum}",
    )
    db.add(history)

    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/attachments")
async def upload_attachment(
    complaint_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Upload evidence (image, video, audio) for a complaint."""
    query = select(Complaint).where(Complaint.id == complaint_id)
    result = await db.execute(query)
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    file_url = f"/uploads/{file.filename}"
    file_type = file.content_type.split("/")[0] if file.content_type else "document"

    attachment = Attachment(
        complaint_id=complaint_id,
        file_url=file_url,
        file_type=file_type,
        file_name=file.filename,
        file_size_bytes=0,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)

    return {
        "id": str(attachment.id),
        "complaint_id": str(complaint_id),
        "file_url": attachment.file_url,
        "file_name": attachment.file_name,
        "file_type": attachment.file_type,
    }


@router.get("/{complaint_id}/status-history")
async def get_status_history(
    complaint_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Get status change timeline for a complaint."""
    query = select(ComplaintStatusHistory).where(ComplaintStatusHistory.complaint_id == complaint_id).order_by(ComplaintStatusHistory.created_at.asc())
    result = await db.execute(query)
    history_items = result.scalars().all()

    return [
        {
            "id": str(item.id),
            "previous_status": item.previous_status,
            "new_status": item.new_status,
            "remarks": item.remarks,
            "created_at": item.created_at,
        }
        for item in history_items
    ]
