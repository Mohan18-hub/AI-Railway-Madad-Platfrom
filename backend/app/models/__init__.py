"""RailMadad AI Platform — SQLAlchemy Models.

All 14 domain models for the platform:
users, complaints, trains, stations, departments, officers,
complaint_assignments, complaint_status_history, attachments,
feedback, suggestions, ai_predictions, ai_embeddings, audit_logs.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.core.database import Base


# ── Enums ───────────────────────────────────

class ComplaintStatus(str, PyEnum):
    SUBMITTED = "submitted"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"


class ComplaintSeverity(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplaintCategory(str, PyEnum):
    CLEANLINESS = "cleanliness"
    CATERING = "catering"
    STAFF_BEHAVIOR = "staff_behavior"
    PUNCTUALITY = "punctuality"
    SAFETY = "safety"
    ELECTRICAL = "electrical"
    WATER = "water"
    COACH_MAINTENANCE = "coach_maintenance"
    BED_ROLL = "bed_roll"
    CORRUPTION = "corruption"
    OTHER = "other"


class UserRole(str, PyEnum):
    PASSENGER = "passenger"
    GUEST = "guest"
    OFFICER = "officer"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


# ── Mixin ───────────────────────────────────

class TimestampMixin:
    """Adds created_at and updated_at columns."""
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


# ── Models ──────────────────────────────────

class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.PASSENGER, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)

    # Relationships
    complaints = relationship("Complaint", back_populates="user", lazy="selectin")
    feedback = relationship("Feedback", back_populates="user", lazy="selectin")


class Complaint(TimestampMixin, Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(ComplaintCategory), nullable=True)
    sub_category = Column(String(255), nullable=True)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.SUBMITTED, nullable=False, index=True)
    severity = Column(Enum(ComplaintSeverity), nullable=True)
    pnr_number = Column(String(20), nullable=True)
    train_id = Column(UUID(as_uuid=True), ForeignKey("trains.id"), nullable=True)
    station_id = Column(UUID(as_uuid=True), ForeignKey("stations.id"), nullable=True)
    coach_number = Column(String(10), nullable=True)
    seat_number = Column(String(10), nullable=True)
    journey_date = Column(DateTime(timezone=True), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    sla_deadline = Column(DateTime(timezone=True), nullable=True)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="complaints")
    train = relationship("Train", back_populates="complaints")
    station = relationship("Station", back_populates="complaints")
    department = relationship("Department", back_populates="complaints")
    attachments = relationship("Attachment", back_populates="complaint", lazy="selectin")
    status_history = relationship("ComplaintStatusHistory", back_populates="complaint", lazy="selectin")
    assignments = relationship("ComplaintAssignment", back_populates="complaint", lazy="selectin")
    ai_predictions = relationship("AIPrediction", back_populates="complaint", lazy="selectin")
    feedback = relationship("Feedback", back_populates="complaint", lazy="selectin")


class Train(TimestampMixin, Base):
    __tablename__ = "trains"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    train_number = Column(String(10), unique=True, nullable=False, index=True)
    train_name = Column(String(255), nullable=False)
    train_type = Column(String(50), nullable=True)
    source_station = Column(String(255), nullable=True)
    destination_station = Column(String(255), nullable=True)
    route = Column(JSON, nullable=True)  # list of station codes
    coaches = Column(JSON, nullable=True)  # coach configuration
    is_active = Column(Boolean, default=True)

    # Relationships
    complaints = relationship("Complaint", back_populates="train")


class Station(TimestampMixin, Base):
    __tablename__ = "stations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_code = Column(String(10), unique=True, nullable=False, index=True)
    station_name = Column(String(255), nullable=False)
    city = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    zone = Column(String(50), nullable=True)
    division = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    complaints = relationship("Complaint", back_populates="station")


class Department(TimestampMixin, Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    handles_categories = Column(ARRAY(String).with_variant(JSON, "sqlite"), nullable=True)
    sla_hours = Column(Integer, default=48)
    is_active = Column(Boolean, default=True)

    # Relationships
    officers = relationship("Officer", back_populates="department")
    complaints = relationship("Complaint", back_populates="department")


class Officer(TimestampMixin, Base):
    __tablename__ = "officers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    designation = Column(String(255), nullable=True)
    zone = Column(String(50), nullable=True)
    division = Column(String(100), nullable=True)
    is_available = Column(Boolean, default=True)
    max_active_complaints = Column(Integer, default=20)

    # Relationships
    department = relationship("Department", back_populates="officers")
    assignments = relationship("ComplaintAssignment", back_populates="officer")


class ComplaintAssignment(TimestampMixin, Base):
    __tablename__ = "complaint_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    officer_id = Column(UUID(as_uuid=True), ForeignKey("officers.id"), nullable=False)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="assignments")
    officer = relationship("Officer", back_populates="assignments")


class ComplaintStatusHistory(TimestampMixin, Base):
    __tablename__ = "complaint_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    previous_status = Column(Enum(ComplaintStatus), nullable=True)
    new_status = Column(Enum(ComplaintStatus), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    remarks = Column(Text, nullable=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="status_history")


class Attachment(TimestampMixin, Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    file_url = Column(String(1000), nullable=False)
    file_type = Column(String(50), nullable=False)  # image, video, audio, document
    file_name = Column(String(500), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    ai_analysis = Column(JSON, nullable=True)  # CV / Whisper analysis results

    # Relationships
    complaint = relationship("Complaint", back_populates="attachments")


class Feedback(TimestampMixin, Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="feedback")
    user = relationship("User", back_populates="feedback")


class Suggestion(TimestampMixin, Base):
    __tablename__ = "suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(255), nullable=True)
    upvotes = Column(Integer, default=0)
    status = Column(String(50), default="pending")  # pending, reviewed, implemented


class AIPrediction(TimestampMixin, Base):
    __tablename__ = "ai_predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False)
    prediction_type = Column(String(50), nullable=False)  # category, severity, sentiment, department, duplicate
    predicted_value = Column(String(500), nullable=False)
    confidence_score = Column(Float, nullable=True)
    model_name = Column(String(255), nullable=True)
    model_version = Column(String(50), nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="ai_predictions")


class AIEmbedding(TimestampMixin, Base):
    __tablename__ = "ai_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_type = Column(String(50), nullable=False)  # complaint, knowledge_base, faq
    source_id = Column(UUID(as_uuid=True), nullable=False)
    content_hash = Column(String(64), nullable=False)
    embedding_model = Column(String(255), nullable=False)
    # Note: For pgvector, use:  embedding = Column(Vector(384))
    # The Vector column type is added via Alembic migration after pgvector extension is enabled.
    metadata_ = Column("metadata", JSON, nullable=True)


class AuditLog(TimestampMixin, Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
