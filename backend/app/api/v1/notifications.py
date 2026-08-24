"""RailMadad AI Platform — Notification Routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_notifications(
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Get notifications for the current user."""
    # TODO: Implement notification retrieval with read/unread filter
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Mark a notification as read."""
    # TODO: Implement mark as read
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.post("/test/sms")
async def test_sms(
    phone: str,
    message: str,
) -> dict:
    """Test SMS notification (admin only, non-production)."""
    # TODO: Implement SMS test via configured provider
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.post("/test/email")
async def test_email(
    email: str,
    subject: str,
    body: str,
) -> dict:
    """Test email notification (admin only, non-production)."""
    # TODO: Implement email test via configured provider
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
