"""
SQLAlchemy ORM Models (source of truth: webapp/prisma/schema.prisma)
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Enum as SQLEnum,
    ForeignKey,
    Float,
    Integer,
    String,
    Text,
    TIMESTAMP,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.database import Base

# ============================================================================
# Enums
# ============================================================================

class UserRole(str, enum.Enum):
    """User roles"""
    advocate = "advocate"
    admin = "admin"

class CaseStatus(str, enum.Enum):
    """Case status enum"""
    filed = "filed"
    registered = "registered"
    pending = "pending"
    disposed = "disposed"
    transferred = "transferred"

class CasePartyRole(str, enum.Enum):
    """Party role in case"""
    petitioner = "petitioner"
    respondent = "respondent"
    appellant = "appellant"
    defendant = "defendant"

class DocumentCategory(str, enum.Enum):
    """Document categories"""
    case_file = "case_file"
    annexure = "annexure"
    judgment = "judgment"
    order = "order"
    misc = "misc"

class UploadStatus(str, enum.Enum):
    """Document upload status"""
    pending = "pending"
    uploading = "uploading"
    completed = "completed"
    failed = "failed"

class OCRStatus(str, enum.Enum):
    """OCR processing status"""
    not_required = "not_required"
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class CaseEventType(str, enum.Enum):
    """Case event types"""
    hearing = "hearing"
    order = "order"
    judgment = "judgment"
    filing = "filing"
    notice = "notice"

class AIAnalysisStatus(str, enum.Enum):
    """AI analysis status"""
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class UrgencyLevel(str, enum.Enum):
    """Urgency levels"""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class AIInsightType(str, enum.Enum):
    bundle_analysis = "bundle_analysis"
    precedents = "precedents"
    risk_assessment = "risk_assessment"
    rights_mapping = "rights_mapping"
    narrative = "narrative"
    counter_anticipation = "counter_anticipation"
    relief_evaluation = "relief_evaluation"


class InsightStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class SubscriptionPlan(str, enum.Enum):
    free = "free"
    professional = "professional"
    enterprise = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"
    expired = "expired"
    trial = "trial"


class BillingCycle(str, enum.Enum):
    monthly = "monthly"
    annually = "annually"


class PaymentMethod(str, enum.Enum):
    upi = "upi"
    card = "card"
    netbanking = "netbanking"
    none = "none"


class InvoiceStatus(str, enum.Enum):
    paid = "paid"
    pending = "pending"
    failed = "failed"


# ============================================================================
# Models
# ============================================================================

class User(Base):
    """User/Advocate model"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    mobile = Column(String(15), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    
    # KHC Identity
    khc_advocate_id = Column(String(50), unique=True, nullable=False, index=True)
    khc_advocate_name = Column(String(255), nullable=False)
    khc_enrollment_number = Column(String(50), nullable=True)
    
    # Profile
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.advocate)
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(TIMESTAMP, nullable=True)
    last_sync_at = Column(TIMESTAMP, nullable=True)
    
    # Preferences (JSON)
    preferences = Column(JSONB, nullable=False, default=dict)
    
    # Relationships
    cases = relationship("Case", back_populates="advocate", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="advocate", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    usage_tracking = relationship("UsageTracking", back_populates="user", cascade="all, delete-orphan")


class Case(Base):
    """Legal case model"""
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    advocate_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Case Identification
    case_number = Column(String(100), nullable=True)
    efiling_number = Column(String(100), unique=True, nullable=False)
    case_type = Column(String(50), nullable=False)
    case_year = Column(Integer, nullable=False)
    
    # Party Information
    party_role = Column(SQLEnum(CasePartyRole), nullable=False)
    petitioner_name = Column(Text, nullable=False)
    respondent_name = Column(Text, nullable=False)
    
    # Filing Details
    efiling_date = Column(TIMESTAMP, nullable=False)
    efiling_details = Column(Text, nullable=True)
    
    # Court Assignment
    bench_type = Column(String(50), nullable=True)
    judge_name = Column(String(255), nullable=True)
    court_number = Column(String(50), nullable=True)
    
    # Status
    status = Column(SQLEnum(CaseStatus), nullable=False, default=CaseStatus.filed)
    next_hearing_date = Column(TIMESTAMP, nullable=True)
    
    # Sync Metadata
    khc_source_url = Column(Text, nullable=True)
    last_synced_at = Column(TIMESTAMP, nullable=True)
    sync_status = Column(String(50), nullable=False, default="pending")
    
    # Search
    search_vector = Column(Text, nullable=True)  # TSVECTOR in PostgreSQL
    
    # Soft Delete
    is_visible = Column(Boolean, nullable=False, default=True)
    transferred_reason = Column(Text, nullable=True)
    transferred_at = Column(TIMESTAMP, nullable=True)
    
    # Timestamps
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    advocate = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    history = relationship("CaseHistory", back_populates="case", cascade="all, delete-orphan")
    ai_analysis = relationship("AIAnalysis", back_populates="case", uselist=False, cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="case", cascade="all, delete-orphan")
    hearing_briefs = relationship("HearingBrief", back_populates="case", cascade="all, delete-orphan")


class Document(Base):
    """Document/PDF model"""
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    
    # Document Identity
    khc_document_id = Column(String(100), nullable=False)
    category = Column(SQLEnum(DocumentCategory), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # S3 Storage
    s3_key = Column(String(500), unique=True, nullable=False)
    s3_bucket = Column(String(100), nullable=False, default="lawmate-case-pdfs")
    s3_version_id = Column(String(100), nullable=True)
    
    # File Metadata
    file_size = Column(BigInteger, nullable=False)
    content_type = Column(String(50), nullable=False, default="application/pdf")
    checksum_md5 = Column(String(32), nullable=True)
    
    # Upload Tracking
    upload_status = Column(SQLEnum(UploadStatus), nullable=False, default=UploadStatus.pending)
    uploaded_at = Column(TIMESTAMP, nullable=True)
    upload_error = Column(Text, nullable=True)
    
    # Source
    source_url = Column(Text, nullable=True)
    
    # OCR Status
    is_ocr_required = Column(Boolean, nullable=False, default=False)
    ocr_status = Column(SQLEnum(OCRStatus), nullable=True, default=OCRStatus.not_required)
    ocr_job_id = Column(String(255), nullable=True)
    
    # AI Classification Fields
    extracted_text = Column(Text, nullable=True)
    classification_confidence = Column(Float, nullable=True)
    ai_metadata = Column(JSONB, nullable=True)

    # Legal Hold
    is_locked = Column(Boolean, nullable=False, default=False)
    lock_reason = Column(String(255), nullable=True)
    locked_at = Column(TIMESTAMP, nullable=True)
    
    # Timestamps
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="documents")
    orders = relationship("CaseHistory", back_populates="order_document")


class CaseHistory(Base):
    """Case timeline/history model"""
    __tablename__ = "case_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    
    # Event Details
    event_type = Column(SQLEnum(CaseEventType), nullable=False)
    event_date = Column(TIMESTAMP, nullable=False)
    business_recorded = Column(Text, nullable=False)
    
    # Court Details
    judge_name = Column(String(255), nullable=True)
    bench_type = Column(String(50), nullable=True)
    court_number = Column(String(50), nullable=True)
    
    # Next Hearing
    next_hearing_date = Column(TIMESTAMP, nullable=True)
    
    # Associated Document
    order_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    
    # Timestamp
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="history")
    order_document = relationship("Document", back_populates="orders", foreign_keys=[order_document_id])


class AIAnalysis(Base):
    """AI case analysis model"""
    __tablename__ = "ai_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), unique=True, nullable=False)
    advocate_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Analysis Metadata
    status = Column(SQLEnum(AIAnalysisStatus), nullable=False, default=AIAnalysisStatus.pending)
    model_version = Column(String(50), nullable=False, default="claude-3.5-sonnet")
    
    # Analysis Results (JSONB)
    analysis = Column(JSONB, nullable=True)
    
    # Extracted Fields (for faster queries)
    urgency_level = Column(SQLEnum(UrgencyLevel), nullable=True)
    case_summary = Column(Text, nullable=True)
    
    # Processing Metadata
    processed_at = Column(TIMESTAMP, nullable=True)
    processing_time_seconds = Column(Integer, nullable=True)
    token_count = Column(Integer, nullable=True)
    
    # Error Handling
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)
    
    # Timestamps
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="ai_analysis")
    advocate = relationship("User", back_populates="ai_analyses")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    insight_type = Column(SQLEnum(AIInsightType), nullable=False)
    result = Column(JSONB, nullable=False)

    model = Column(String(255), nullable=False, default="claude-3-5-sonnet-20241022")
    tokens_used = Column(Integer, nullable=True)

    status = Column(SQLEnum(InsightStatus), nullable=False, default=InsightStatus.completed)
    error = Column(Text, nullable=True)

    cached = Column(Boolean, nullable=False, default=False)
    cache_key = Column(String(255), nullable=True, index=True)

    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    expires_at = Column(TIMESTAMP, nullable=True)

    case = relationship("Case", back_populates="ai_insights")


class HearingBrief(Base):
    __tablename__ = "hearing_briefs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    hearing_date = Column(TIMESTAMP, nullable=False)
    content = Column(Text, nullable=False)
    focus_areas = Column(ARRAY(String), nullable=False, default=list)
    bundle_snapshot = Column(JSONB, nullable=True)

    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("Case", back_populates="hearing_briefs")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    plan = Column(SQLEnum(SubscriptionPlan), nullable=False, default=SubscriptionPlan.free)
    status = Column(SQLEnum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.trial)
    billing_cycle = Column(SQLEnum(BillingCycle), nullable=False, default=BillingCycle.monthly)
    amount = Column(Integer, nullable=False, default=0)
    currency = Column(String(3), nullable=False, default="INR")
    start_date = Column(TIMESTAMP, nullable=False)
    end_date = Column(TIMESTAMP, nullable=False)
    trial_end_date = Column(TIMESTAMP, nullable=True)
    auto_renew = Column(Boolean, nullable=False, default=True)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=True)

    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    status = Column(SQLEnum(InvoiceStatus), nullable=False, default=InvoiceStatus.pending)
    invoice_date = Column(TIMESTAMP, nullable=False)
    due_date = Column(TIMESTAMP, nullable=False)
    paid_date = Column(TIMESTAMP, nullable=True)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=True)
    invoice_url = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)

    subscription = relationship("Subscription", back_populates="invoices")


class UsageTracking(Base):
    __tablename__ = "usage_tracking"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    period_start = Column(TIMESTAMP, nullable=False)
    period_end = Column(TIMESTAMP, nullable=False)
    cases_count = Column(Integer, nullable=False, default=0)
    documents_count = Column(Integer, nullable=False, default=0)
    storage_used_bytes = Column(BigInteger, nullable=False, default=0)
    ai_analyses_used = Column(Integer, nullable=False, default=0)

    created_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="usage_tracking")


# ============================================================================
# Indexes (already created in schema.sql, these are for reference)
# ============================================================================

# Index(
#     'idx_user_login',
#     User.email, User.is_active
# )

# Index(
#     'idx_case_advocate_status',
#     Case.advocate_id, Case.status, Case.is_visible
# )

# """
# SQLAlchemy ORM Models

# Defines the database schema for Lawmate application.
# """
# """
# SQLAlchemy ORM models
# """
# from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, BigInteger, Enum as SQLEnum, ForeignKey
# from sqlalchemy.dialects.postgresql import UUID, JSONB, TSVECTOR
# from sqlalchemy.orm import relationship
# from sqlalchemy.sql import func
# import enum
# import uuid
# from sqlalchemy import Column, String, Index
# from datetime import datetime
# # CORRECT import - use relative or absolute
# from app.db.database import Base  # Absolute import
# # OR
# # from .database import Base  # Relative import



# # ============================================================================
# # Enums
# # ============================================================================

# class UserRole(str, enum.Enum):
#     """User roles in the system"""
#     ADVOCATE = "advocate"
#     ADMIN = "admin"

# class CaseStatus(str, enum.Enum):
#     """Case status enumeration"""
#     FILED = "filed"
#     REGISTERED = "registered"
#     PENDING = "pending"
#     DISPOSED = "disposed"
#     TRANSFERRED = "transferred"
#     WITHDRAWN = "withdrawn"

# class CasePartyRole(str, enum.Enum):
#     """Party role of the advocate"""
#     PETITIONER = "petitioner"
#     RESPONDENT = "respondent"

# class DocumentCategory(str, enum.Enum):
#     """Document category classification"""
#     AFFIRMATION = "affirmation"
#     RECEIPT = "receipt"
#     CASE_FILE = "case_file"
#     ANNEXURE = "annexure"
#     JUDGMENT = "judgment"
#     COURT_ORDER = "court_order"
#     COUNTER_AFFIDAVIT = "counter_affidavit"
#     VAKALATNAMA = "vakalatnama"
#     OTHER = "other"

# class CaseEventType(str, enum.Enum):
#     """Case history event types"""
#     FILED = "filed"
#     REGISTERED = "registered"
#     HEARING = "hearing"
#     ORDER_PASSED = "order_passed"
#     ADJOURNED = "adjourned"
#     INTERIM_STAY = "interim_stay"
#     COUNTER_FILED = "counter_filed"
#     DISPOSED = "disposed"
#     JUDGMENT = "judgment"
#     OTHER = "other"

# class AIAnalysisStatus(str, enum.Enum):
#     """AI analysis processing status"""
#     PENDING = "pending"
#     PROCESSING = "processing"
#     COMPLETED = "completed"
#     FAILED = "failed"

# class UrgencyLevel(str, enum.Enum):
#     """Case urgency level (determined by AI)"""
#     HIGH = "high"
#     MEDIUM = "medium"
#     LOW = "low"

# # ============================================================================
# # Models
# # ============================================================================

# class User(Base):
#     """
#     User model - Represents advocates using Lawmate.
#     """
#     __tablename__ = "users"
    
#     # Primary Key
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
#     # Authentication (Lawmate credentials)
#     email = Column(String(255), unique=True, nullable=False, index=True)
#     mobile = Column(String(15), unique=True, nullable=True, index=True)
#     password_hash = Column(String(255), nullable=False)
    
#     # KHC Identity (The "Handshake" Key)
#     khc_advocate_id = Column(String(50), unique=True, nullable=False, index=True)
#     khc_advocate_name = Column(String(255), nullable=False)
#     khc_enrollment_number = Column(String(50), nullable=True)
    
#     # Profile
#     #role = Column(SQLEnum(UserRole), default=UserRole.ADVOCATE, nullable=False)
#     role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.advocate)

#     is_active = Column(Boolean, default=True, nullable=False)
#     is_verified = Column(Boolean, default=False, nullable=False)
    
#     # Timestamps
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
#     last_login_at = Column(DateTime, nullable=True)
#     last_sync_at = Column(DateTime, nullable=True)
    
#     # Preferences (JSONB for flexibility)
#     preferences = Column(JSONB, default={}, nullable=False)
#     # Example structure:
#     # {
#     #   "notification_email": true,
#     #   "auto_sync": true,
#     #   "theme": "light",
#     #   "language": "en"
#     # }
    
#     # Relationships
#     cases = relationship("Case", back_populates="advocate", cascade="all, delete-orphan")
#     ai_analyses = relationship("AIAnalysis", back_populates="advocate")
    
#     # Indexes
#     __table_args__ = (
#         Index('idx_user_login', 'email', 'is_active'),
#         Index('idx_user_khc', 'khc_advocate_id', 'is_active'),
#     )
    
#     def __repr__(self):
#         return f"<User {self.email} ({self.khc_advocate_id})>"


# class Case(Base):
#     """
#     Case model - Represents legal cases from KHC portal.
#     """
#     __tablename__ = "cases"
    
#     # Primary Key
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
#     # Foreign Keys
#     advocate_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
#     # Case Identification
#     case_number = Column(String(100), nullable=True, index=True)  # Assigned after registration
#     efiling_number = Column(String(100), unique=True, nullable=False, index=True)
#     case_type = Column(String(50), nullable=False, index=True)  # WP(C), CRL.A, etc.
#     case_year = Column(Integer, nullable=False, index=True)
    
#     # Party Information
#     party_role = Column(SQLEnum(CasePartyRole), nullable=False, index=True)
#     petitioner_name = Column(Text, nullable=False)
#     respondent_name = Column(Text, nullable=False)
    
#     # Filing Details
#     efiling_date = Column(DateTime, nullable=False, index=True)
#     efiling_details = Column(Text, nullable=True)
    
#     # Court Assignment
#     bench_type = Column(String(50), nullable=True)  # "Single Bench", "Division Bench"
#     judge_name = Column(String(255), nullable=True)
#     court_number = Column(String(50), nullable=True)
    
#     # Status & Tracking
#     status = Column(SQLEnum(CaseStatus), default=CaseStatus.FILED, nullable=False, index=True)
#     next_hearing_date = Column(DateTime, nullable=True, index=True)
    
#     # Sync Metadata
#     khc_source_url = Column(Text, nullable=True)
#     last_synced_at = Column(DateTime, nullable=True)
#     sync_status = Column(String(50), default="pending", nullable=False)
    
#     # Full-Text Search (PostgreSQL specific)
#     search_vector = Column(TSVECTOR, nullable=True)
    
#     # Soft Delete (for Vakalath transfers)
#     is_visible = Column(Boolean, default=True, nullable=False)
#     transferred_reason = Column(Text, nullable=True)
#     transferred_at = Column(DateTime, nullable=True)
    
#     # Timestamps
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
#     # Relationships
#     advocate = relationship("User", back_populates="cases")
#     documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
#     history = relationship("CaseHistory", back_populates="case", cascade="all, delete-orphan")
#     ai_analysis = relationship("AIAnalysis", back_populates="case", uselist=False)
    
#     # Indexes
#     __table_args__ = (
#         Index('idx_case_advocate_status', 'advocate_id', 'status', 'is_visible'),
#         Index('idx_case_advocate_hearing', 'advocate_id', 'next_hearing_date'),
#         Index('idx_case_advocate_year', 'advocate_id', 'case_year', 'case_type'),
#         Index('idx_case_search', 'search_vector', postgresql_using='gin'),
#         Index('idx_case_active', 'advocate_id', 'status', 
#               postgresql_where="status != 'disposed' AND is_visible = true"),
#     )
    
#     def __repr__(self):
#         return f"<Case {self.case_number or self.efiling_number}>"


# class Document(Base):
#     """
#     Document model - Represents PDF documents associated with cases.
#     """
#     __tablename__ = "documents"
    
#     # Primary Key
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
#     # Foreign Keys
#     case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    
#     # Document Identity
#     khc_document_id = Column(String(100), nullable=False, index=True)
#     category = Column(SQLEnum(DocumentCategory), nullable=False, index=True)
#     title = Column(String(255), nullable=False)
#     description = Column(Text, nullable=True)
    
#     # S3 Storage
#     s3_key = Column(String(500), unique=True, nullable=False, index=True)
#     s3_bucket = Column(String(100), default="lawmate-case-pdfs", nullable=False)
#     s3_version_id = Column(String(100), nullable=True)
    
#     # File Metadata
#     file_size = Column(BigInteger, nullable=False)  # Bytes (supports files > 2GB)
#     content_type = Column(String(50), default="application/pdf", nullable=False)
#     checksum_md5 = Column(String(32), nullable=True)
    
#     # Upload Tracking
#     upload_status = Column(String(50), default="pending", nullable=False, index=True)
#     uploaded_at = Column(DateTime, nullable=True)
#     upload_error = Column(Text, nullable=True)
    
#     # Source URL
#     source_url = Column(Text, nullable=True)
    
#     # OCR Status
#     is_ocr_required = Column(Boolean, default=False, nullable=False)
#     ocr_status = Column(String(50), default="not_required", nullable=True)
#     ocr_job_id = Column(String(255), nullable=True)
    
#     # Legal Hold (Object Lock for compliance)
#     is_locked = Column(Boolean, default=False, nullable=False)
#     lock_reason = Column(String(255), nullable=True)
#     locked_at = Column(DateTime, nullable=True)
    
#     # Timestamps
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
#     # Relationships
#     case = relationship("Case", back_populates="documents")
    
#     # Indexes
#     __table_args__ = (
#         Index('idx_doc_case_category', 'case_id', 'category'),
#         Index('idx_doc_upload_status', 'upload_status', 'created_at'),
#         Index('idx_doc_s3_key', 's3_key'),
#     )
    
#     def __repr__(self):
#         return f"<Document {self.title} ({self.category})>"


# class CaseHistory(Base):
#     """
#     Case History model - Timeline of events in a case.
#     """
#     __tablename__ = "case_history"
    
#     # Primary Key
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
#     # Foreign Keys
#     case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    
#     # Event Details
#     event_type = Column(SQLEnum(CaseEventType), nullable=False, index=True)
#     event_date = Column(DateTime, nullable=False, index=True)
#     business_recorded = Column(Text, nullable=False)
    
#     # Court Details
#     judge_name = Column(String(255), nullable=True)
#     bench_type = Column(String(50), nullable=True)
#     court_number = Column(String(50), nullable=True)
    
#     # Next Hearing
#     next_hearing_date = Column(DateTime, nullable=True)
    
#     # Associated Document (if order/judgment)
#     order_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    
#     # Metadata
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
#     # Relationships
#     case = relationship("Case", back_populates="history")
#     order_document = relationship("Document", foreign_keys=[order_document_id])
    
#     # Indexes
#     __table_args__ = (
#         Index('idx_history_case_date', 'case_id', 'event_date'),
#         Index('idx_history_event_type', 'event_type', 'event_date'),
#     )
    
#     def __repr__(self):
#         return f"<CaseHistory {self.event_type} on {self.event_date}>"


# class AIAnalysis(Base):
#     """
#     AI Analysis model - Claude-generated case insights.
#     """
#     __tablename__ = "ai_analyses"
    
#     # Primary Key
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
#     # Foreign Keys
#     case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), 
#                      unique=True, nullable=False, index=True)
#     advocate_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
#     # Analysis Metadata
#     status = Column(SQLEnum(AIAnalysisStatus), default=AIAnalysisStatus.PENDING, nullable=False, index=True)
#     model_version = Column(String(50), default="claude-3.5-sonnet", nullable=False)
    
#     # Analysis Results (JSONB for flexibility)
#     analysis = Column(JSONB, nullable=True)
#     # Structure:
#     # {
#     #   "case_type_classification": "Writ Petition (Civil)",
#     #   "key_legal_issues": ["..."],
#     #   "relevant_statutes": ["..."],
#     #   "precedent_cases": [{name, citation, relevance}],
#     #   "action_items": ["..."],
#     #   "urgency_level": "high",
#     #   "deadline_reminders": [{task, due_date, priority}],
#     #   "case_summary": "2-3 line summary"
#     # }
    
#     # Extracted Fields (for faster queries)
#     urgency_level = Column(SQLEnum(UrgencyLevel), nullable=True, index=True)
#     case_summary = Column(Text, nullable=True)
    
#     # Processing Metadata
#     processed_at = Column(DateTime, nullable=True)
#     processing_time_seconds = Column(Integer, nullable=True)
#     token_count = Column(Integer, nullable=True)
    
#     # Error Handling
#     error_message = Column(Text, nullable=True)
#     retry_count = Column(Integer, default=0, nullable=False)
    
#     # Timestamps
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
#     # Relationships
#     case = relationship("Case", back_populates="ai_analysis")
#     advocate = relationship("User", back_populates="ai_analyses")
    
#     # Indexes
#     __table_args__ = (
#         Index('idx_ai_advocate_urgency', 'advocate_id', 'urgency_level'),
#         Index('idx_ai_status', 'status', 'created_at'),
#         Index('idx_ai_analysis_jsonb', 'analysis', postgresql_using='gin'),
#     )
    
#     def __repr__(self):
#         return f"<AIAnalysis for Case {self.case_id}>"


# class MultipartUploadSession(Base):
#     """
#     Multipart Upload Session model - Tracks active multipart uploads.
#     Used for recovery and monitoring.
#     """
#     __tablename__ = "multipart_upload_sessions"
    
#     # Primary Key
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
#     # Upload Details
#     upload_id = Column(String(255), unique=True, nullable=False, index=True)
#     s3_key = Column(String(500), nullable=False)
#     s3_bucket = Column(String(100), default="lawmate-case-pdfs", nullable=False)
    
#     # Associated Case
#     case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
#     advocate_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
#     # Upload Progress
#     total_parts = Column(Integer, nullable=False)
#     uploaded_parts = Column(JSONB, default=[], nullable=False)  # List of part numbers
#     failed_parts = Column(JSONB, default=[], nullable=False)
    
#     # Status
#     status = Column(String(50), default="in_progress", nullable=False, index=True)
#     # Status: in_progress, completed, aborted, failed
    
#     # File Metadata
#     file_size = Column(BigInteger, nullable=False)
#     content_type = Column(String(50), default="application/pdf", nullable=False)
    
#     # Timestamps
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
#     completed_at = Column(DateTime, nullable=True)
    
#     # TTL (for cleanup)
#     expires_at = Column(DateTime, nullable=True)  # Auto-delete after 7 days
    
#     # Indexes
#     __table_args__ = (
#         Index('idx_multipart_status', 'status', 'created_at'),
#         Index('idx_multipart_advocate', 'advocate_id', 'status'),
#     )
    
#     def __repr__(self):
#         return f"<MultipartUploadSession {self.upload_id}>"