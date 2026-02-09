"""
Main API router aggregator
"""
from fastapi import APIRouter
from sqlalchemy.dialects.postgresql import UUID
# ✅ Import all endpoint routers
from app.api.v1.endpoints import (
    auth,
    identity,
    cases,
    documents,
    upload,
    sync,
    analysis,
    ocr,
)

# Import new endpoints (create these if they don't exist)
try:
    from app.api.v1.endpoints import dashboard, sse, subscription
    HAS_NEW_ENDPOINTS = True
except ImportError:
    HAS_NEW_ENDPOINTS = False

api_router = APIRouter()

# Include routers
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])  
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(identity.router, prefix="/identity", tags=["Identity"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(sync.router, prefix="/sync", tags=["Sync"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["AI Analysis"])

# Include new endpoints if available
if HAS_NEW_ENDPOINTS:
    api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
    api_router.include_router(sse.router, prefix="/sse", tags=["Real-time"])
    api_router.include_router(subscription.router, prefix="/subscription", tags=["Subscription"])
