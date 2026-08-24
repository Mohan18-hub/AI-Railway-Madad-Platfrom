"""RailMadad AI Platform — Pydantic Schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ── Auth Schemas ────────────────────────────

class OTPRequest(BaseModel):
    """Request OTP for login."""
    phone: str | None = None
    email: EmailStr | None = None


class OTPVerify(BaseModel):
    """Verify OTP and receive JWT tokens."""
    phone: str | None = None
    email: EmailStr | None = None
    otp: str = Field(..., min_length=4, max_length=8)


class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Refresh token request."""
    refresh_token: str


# ── User Schemas ────────────────────────────

class UserBase(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None


class UserResponse(UserBase):
    id: UUID
    role: str
    is_verified: bool
    is_active: bool
    avatar_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Complaint Schemas ───────────────────────

class ComplaintCreate(BaseModel):
    """Create a new complaint."""
    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=10)
    category: str | None = None
    sub_category: str | None = None
    pnr_number: str | None = None
    train_number: str | None = None
    station_code: str | None = None
    coach_number: str | None = None
    seat_number: str | None = None
    journey_date: datetime | None = None
    location_lat: float | None = None
    location_lng: float | None = None


class ComplaintUpdate(BaseModel):
    """Update complaint fields."""
    title: str | None = None
    description: str | None = None
    status: str | None = None
    severity: str | None = None
    category: str | None = None
    department_id: UUID | None = None


class ComplaintResponse(BaseModel):
    id: UUID
    complaint_number: str
    title: str
    description: str
    category: str | None
    status: str
    severity: str | None
    pnr_number: str | None
    coach_number: str | None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None

    class Config:
        from_attributes = True


class ComplaintListResponse(BaseModel):
    complaints: list[ComplaintResponse]
    total: int
    page: int
    page_size: int


# ── Feedback Schemas ────────────────────────

class FeedbackCreate(BaseModel):
    complaint_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class FeedbackResponse(BaseModel):
    id: UUID
    complaint_id: UUID
    rating: int
    comment: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ── AI Prediction Schemas ───────────────────

class AIPredictionResponse(BaseModel):
    prediction_type: str
    predicted_value: str
    confidence_score: float | None
    model_name: str | None

    class Config:
        from_attributes = True


# ── Analytics Schemas ───────────────────────

class DashboardStats(BaseModel):
    total_complaints: int
    open_complaints: int
    resolved_today: int
    average_resolution_hours: float
    sla_compliance_rate: float
    top_categories: list[dict]
    severity_distribution: dict


# ── Common Schemas ──────────────────────────

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class MessageResponse(BaseModel):
    message: str
    detail: str | None = None
