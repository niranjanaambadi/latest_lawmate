"""
Pydantic validation schemas
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseModel):
    email: EmailStr
    khc_advocate_id: str = Field(..., min_length=5, max_length=50)
    khc_advocate_name: str = Field(..., min_length=2, max_length=255)

class UserLogin(BaseModel):
    """Login schema"""
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    """Registration schema"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    khc_advocate_id: str
    khc_advocate_name: str
    mobile: Optional[str] = None
    khc_enrollment_number: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    mobile: Optional[str] = None
    khc_enrollment_number: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    khc_advocate_name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: UUID
    mobile: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime]
    preferences: Dict[str, Any]
    
    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: UUID
    mobile: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============================================================================
# Case Schemas
# ============================================================================

class CaseBase(BaseModel):
    efiling_number: str = Field(..., min_length=5)
    case_number: Optional[str] = None
    case_type: str = Field(..., min_length=2)
    case_year: int = Field(..., ge=2000, le=2100)
    party_role: str = Field(..., pattern='^(petitioner|respondent)$')
    petitioner_name: str = Field(..., min_length=2)
    respondent_name: str = Field(..., min_length=2)
    efiling_date: str
    efiling_details: Optional[str] = None
    next_hearing_date: Optional[str] = None
    status: str = "filed"
    bench_type: Optional[str] = None
    judge_name: Optional[str] = None
    khc_source_url: Optional[str] = None

class CaseCreate(CaseBase):
    advocate_id: UUID

class CaseUpdate(BaseModel):
    case_number: Optional[str] = None
    status: Optional[str] = None
    next_hearing_date: Optional[str] = None
    bench_type: Optional[str] = None
    judge_name: Optional[str] = None
    court_number: Optional[str] = None

class CaseResponse(CaseBase):
    id: UUID
    advocate_id: UUID
    last_synced_at: Optional[datetime]
    sync_status: str
    is_visible: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CaseListResponse(BaseModel):
    cases: List[CaseResponse]
    total: int
    skip: int
    limit: int

# ============================================================================
# Document Schemas
# ============================================================================

class DocumentBase(BaseModel):
    khc_document_id: str
    category: str
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    case_id: UUID
    s3_key: str
    s3_bucket: str = "lawmate-case-pdfs"
    file_size: int = Field(..., gt=0)
    source_url: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: UUID
    case_id: UUID
    s3_key: str
    s3_bucket: str
    file_size: int
    upload_status: str
    uploaded_at: Optional[datetime]
    is_locked: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Add after DocumentCreate schema (around line 150)

class DocumentUpdate(BaseModel):
    """Schema for document updates"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = None
    description: Optional[str] = None
    
    class Config:
        from_attributes = True
# ============================================================================
# Case History Schemas
# ============================================================================

class CaseHistoryCreate(BaseModel):
    case_id: UUID
    event_type: str
    event_date: datetime
    business_recorded: str
    judge_name: Optional[str] = None
    bench_type: Optional[str] = None
    next_hearing_date: Optional[datetime] = None

class CaseHistoryResponse(BaseModel):
    id: UUID
    case_id: UUID
    event_type: str
    event_date: datetime
    business_recorded: str
    judge_name: Optional[str]
    next_hearing_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# AI Analysis Schemas
# ============================================================================

class AIAnalysisCreate(BaseModel):
    case_id: UUID

class AIAnalysisResponse(BaseModel):
    id: UUID
    case_id: UUID
    advocate_id: UUID
    status: str
    model_version: str
    analysis: Optional[Dict[str, Any]]
    urgency_level: Optional[str]
    case_summary: Optional[str]
    processed_at: Optional[datetime]
    processing_time_seconds: Optional[int]
    token_count: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# Detailed Case Response (with relationships)
# ============================================================================

class CaseDetailResponse(CaseResponse):
    documents: List[DocumentResponse] = []
    history: List[CaseHistoryResponse] = []
    ai_analysis: Optional[AIAnalysisResponse] = None

# ============================================================================
# Sync Schemas
# ============================================================================

class PDFLinkSchema(BaseModel):
    url: str
    document_id: str
    label: str
    category: str

class CaseSyncRequest(BaseModel):
    efiling_number: str
    case_number: Optional[str] = None
    case_type: str
    case_year: int
    party_role: str
    petitioner_name: str
    respondent_name: str
    efiling_date: str
    efiling_details: Optional[str] = None
    next_hearing_date: Optional[str] = None
    status: str
    bench_type: Optional[str] = None
    judge_name: Optional[str] = None
    khc_source_url: Optional[str] = None
    pdf_links: List[PDFLinkSchema] = []
    khc_id: str

class DocumentSyncRequest(BaseModel):
    case_number: str
    khc_document_id: str
    category: str
    title: str
    s3_key: str
    file_size: int
    source_url: Optional[str] = None

# ============================================================================
# Dashboard Schemas
# ============================================================================

class DashboardStats(BaseModel):
    total_cases: int
    pending_cases: int
    disposed_cases: int
    upcoming_hearings: int
    total_documents: int
    cases_by_status: Dict[str, int]
    cases_by_type: Dict[str, int]
    monthly_trend: List[Dict[str, Any]]

# ============================================================================
# Subscription Schemas
# ============================================================================

class SubscriptionOut(BaseModel):
    id: str
    user_id: str
    plan: str
    status: str
    billing_cycle: str
    amount: float
    currency: str
    start_date: str
    end_date: str
    auto_renew: bool
    payment_method: Optional[str]
    created_at: str
    updated_at: str

class PlanDetails(BaseModel):
    id: str
    name: str
    description: str
    price_monthly: float
    price_annually: float
    features: Dict[str, Any]
    popular: bool

class UsageStats(BaseModel):
    cases_count: int
    documents_count: int
    storage_used_gb: float
    ai_analyses_used: int
    period_start: str
    period_end: str

class InvoiceOut(BaseModel):
    id: str
    subscription_id: str
    amount: float
    currency: str
    status: str
    invoice_date: str
    due_date: str
    paid_date: Optional[str]
    payment_method: Optional[str]
    invoice_url: Optional[str]

# Add to app/db/schemas.py

class CaseListItem(BaseModel):
    """Simplified case for list view"""
    id: UUID
    case_number: Optional[str]
    efiling_number: str
    case_type: str
    status: str
    petitioner_name: str
    respondent_name: str
    next_hearing_date: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginationMeta(BaseModel):
    """Pagination metadata"""
    total: int
    page: int
    per_page: int
    total_pages: int

class CaseListResponse(BaseModel):
    """Paginated case list response"""
    items: List[CaseResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
# ============================================================================
# Rebuild models to resolve forward references
# ============================================================================

CaseDetailResponse.model_rebuild()