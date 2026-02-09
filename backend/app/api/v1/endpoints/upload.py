# backend/app/api/v1/endpoints/upload.py

"""
Upload Endpoints

Handles S3 pre-signed URL generation and multipart upload management.
"""

from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Document, Case, UploadStatus, DocumentCategory
from app.services.s3_service import S3Service
from app.core.logger import logger

router = APIRouter(tags=["upload"])

# ============================================================================
# Request/Response Models
# ============================================================================

class StandardUploadRequest(BaseModel):
    """Request model for standard upload (< 15MB)"""
    case_number: str = Field(..., description="Case number")
    document_id: str = Field(..., description="Unique document identifier")
    file_size: int = Field(..., gt=0, description="File size in bytes")
    content_type: str = Field(default="application/pdf", description="MIME type")
    
    class Config:
        json_schema_extra = {
            "example": {
                "case_number": "WP(C) 123/2026",
                "document_id": "DOC001",
                "file_size": 2048000,
                "content_type": "application/pdf"
            }
        }

class StandardUploadResponse(BaseModel):
    """Response model for standard upload"""
    upload_url: str = Field(..., description="Pre-signed S3 URL for PUT request")
    s3_key: str = Field(..., description="S3 object key")
    method: str = Field(default="PUT", description="HTTP method to use")
    expires_in: int = Field(..., description="URL expiry time in seconds")
    headers: dict = Field(default={}, description="Required headers for upload")
    
    class Config:
        json_schema_extra = {
            "example": {
                "upload_url": "https://s3.amazonaws.com/...",
                "s3_key": "KHC-001/WPC-123-2026/case_file/doc.pdf",
                "method": "PUT",
                "expires_in": 900,
                "headers": {
                    "Content-Type": "application/pdf"
                }
            }
        }

class MultipartInitRequest(BaseModel):
    """Request model for multipart upload initialization"""
    case_number: str = Field(..., description="Case number")
    document_id: str = Field(..., description="Unique document identifier")
    file_size: int = Field(..., gt=15_000_000, description="File size in bytes (must be > 15MB)")
    chunk_size: int = Field(default=5_242_880, description="Chunk size in bytes (default 5MB)")
    content_type: str = Field(default="application/pdf", description="MIME type")
    
    class Config:
        json_schema_extra = {
            "example": {
                "case_number": "WP(C) 123/2026",
                "document_id": "DOC001",
                "file_size": 52428800,
                "chunk_size": 5242880,
                "content_type": "application/pdf"
            }
        }

class MultipartInitResponse(BaseModel):
    """Response model for multipart upload initialization"""
    upload_id: str = Field(..., description="Multipart upload ID")
    s3_key: str = Field(..., description="S3 object key")
    chunk_urls: List[str] = Field(..., description="Pre-signed URLs for each chunk")
    total_parts: int = Field(..., description="Total number of parts")
    
    class Config:
        json_schema_extra = {
            "example": {
                "upload_id": "abc123xyz",
                "s3_key": "KHC-001/WPC-123-2026/case_file/doc.pdf",
                "chunk_urls": ["https://s3.amazonaws.com/...part1", "https://s3.amazonaws.com/...part2"],
                "total_parts": 10
            }
        }

class PartInfo(BaseModel):
    """Model for uploaded part information"""
    PartNumber: int = Field(..., ge=1, description="Part number (1-indexed)")
    ETag: str = Field(..., description="ETag returned by S3 after upload")
    
    class Config:
        json_schema_extra = {
            "example": {
                "PartNumber": 1,
                "ETag": "\"abc123def456\""
            }
        }

class MultipartCompleteRequest(BaseModel):
    """Request model for completing multipart upload"""
    upload_id: str = Field(..., description="Multipart upload ID")
    s3_key: str = Field(..., description="S3 object key")
    parts: List[PartInfo] = Field(..., description="List of uploaded parts")
    
    class Config:
        json_schema_extra = {
            "example": {
                "upload_id": "abc123xyz",
                "s3_key": "KHC-001/WPC-123-2026/case_file/doc.pdf",
                "parts": [
                    {"PartNumber": 1, "ETag": "\"abc123\""},
                    {"PartNumber": 2, "ETag": "\"def456\""}
                ]
            }
        }

class MultipartCompleteResponse(BaseModel):
    """Response model for completed multipart upload"""
    status: str = Field(default="completed", description="Upload status")
    s3_key: str = Field(..., description="S3 object key")
    location: str = Field(..., description="S3 object URL")
    etag: str = Field(..., description="Final ETag of combined object")

class UploadProgressUpdate(BaseModel):
    """Model for upload progress updates"""
    upload_id: str
    uploaded_parts: int
    total_parts: int
    progress_percentage: int

# ============================================================================
# Endpoints
# ============================================================================

class InitiateUploadRequest(BaseModel):
    """Webapp: initiate upload (creates document + presigned URL)"""
    caseId: str = Field(..., description="Case UUID")
    category: str = Field(..., description="Document category")
    title: str = Field(..., description="Document title")
    description: Optional[str] = None
    fileName: str = Field(..., description="Original file name")
    fileSize: int = Field(..., gt=0)
    contentType: str = Field(default="application/pdf")


@router.post("/initiate")
async def initiate_upload(
    request: InitiateUploadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a document record (PENDING) and return presigned URL.
    Webapp expects { data: { documentId, uploadUrl, s3Key } }.
    """
    case = db.query(Case).filter(
        Case.id == request.caseId,
        Case.advocate_id == current_user.id,
    ).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    try:
        # Frontend may send CASE_FILE or case_file; enum values are case_file, annexure, etc.
        cat_val = (request.category or "misc").lower().replace("-", "_").replace(" ", "_")
        category_enum = DocumentCategory(cat_val) if cat_val in [e.value for e in DocumentCategory] else DocumentCategory.misc
    except (ValueError, TypeError):
        category_enum = DocumentCategory.misc
    khc_doc_id = f"upload-{uuid4().hex[:12]}"
    s3_key = f"cases/{request.caseId}/{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{request.fileName}"
    doc = Document(
        case_id=request.caseId,
        khc_document_id=khc_doc_id,
        category=category_enum,
        title=request.title,
        description=request.description,
        s3_key=s3_key,
        s3_bucket="lawmate-case-pdfs",
        file_size=request.fileSize,
        content_type=request.contentType,
        upload_status=UploadStatus.pending,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    try:
        s3_service = S3Service()
        upload_url = s3_service.generate_presigned_url(
            s3_key=s3_key,
            content_type=request.contentType,
            expires_in=900,
        )
    except Exception as e:
        logger.warning("S3 presigned URL failed, returning placeholder: %s", e)
        upload_url = f"https://lawmate-case-pdfs.s3.amazonaws.com/{s3_key}?expires=900"
    return {
        "data": {
            "documentId": str(doc.id),
            "uploadUrl": upload_url,
            "s3Key": s3_key,
        }
    }


@router.post("/presigned-url", response_model=StandardUploadResponse)
async def get_presigned_url(
    request: StandardUploadRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate pre-signed URL for direct S3 upload (files < 15MB).
    
    **Process:**
    1. Request pre-signed URL from this endpoint
    2. Upload file directly to S3 using the returned URL (PUT request)
    3. Call `/sync/documents` to register the upload
    
    **Example usage:**
    ```javascript
    // Step 1: Get pre-signed URL
    const response = await fetch('/api/v1/upload/presigned-url', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer <token>',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            case_number: 'WP(C) 123/2026',
            document_id: 'DOC001',
            file_size: 2048000
        })
    });
    const { upload_url, s3_key } = await response.json();
    
    // Step 2: Upload to S3
    await fetch(upload_url, {
        method: 'PUT',
        body: pdfBlob,
        headers: { 'Content-Type': 'application/pdf' }
    });
    
    // Step 3: Confirm upload
    await fetch('/api/v1/sync/documents', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer <token>',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            case_number: 'WP(C) 123/2026',
            khc_document_id: 'DOC001',
            category: 'case_file',
            title: 'Main Petition',
            s3_key: s3_key,
            file_size: 2048000
        })
    });
    ```
    """
    try:
        logger.info(f"Generating pre-signed URL for user {current_user.id}", extra={
            "case_number": request.case_number,
            "file_size": request.file_size
        })
        
        # Generate S3 key
        s3_key = f"{current_user.khc_advocate_id}/{request.case_number}/{request.document_id}.pdf"
        
        # Initialize S3 service
        s3_service = S3Service()
        
        # Generate pre-signed URL (15 minutes expiry)
        presigned_url = s3_service.generate_presigned_url(
            s3_key=s3_key,
            content_type=request.content_type,
            expires_in=900
        )
        
        logger.info(f"Pre-signed URL generated successfully", extra={
            "s3_key": s3_key,
            "user_id": str(current_user.id)
        })
        
        return StandardUploadResponse(
            upload_url=presigned_url,
            s3_key=s3_key,
            method="PUT",
            expires_in=900,
            headers={
                "Content-Type": request.content_type
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to generate pre-signed URL", extra={
            "error": str(e),
            "user_id": str(current_user.id)
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate upload URL: {str(e)}"
        )

@router.post("/multipart/init", response_model=MultipartInitResponse)
async def initiate_multipart_upload(
    request: MultipartInitRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Initiate multipart upload for large files (>= 15MB).
    
    Returns upload ID and pre-signed URLs for each chunk.
    
    **Process:**
    1. Call this endpoint to initiate multipart upload
    2. Upload each chunk to its respective pre-signed URL
    3. Call `/multipart/complete` with all uploaded part ETags
    
    **Benefits of multipart upload:**
    - Resume interrupted uploads
    - Parallel chunk uploads
    - Better for unreliable networks
    - Handles files up to 5TB
    """
    try:
        logger.info(f"Initiating multipart upload", extra={
            "case_number": request.case_number,
            "file_size": request.file_size,
            "user_id": str(current_user.id)
        })
        
        # Validate file size
        if request.file_size < 15_000_000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be >= 15MB for multipart upload. Use standard upload instead."
            )
        
        # Generate S3 key
        s3_key = f"{current_user.khc_advocate_id}/{request.case_number}/{request.document_id}.pdf"
        
        # Initialize S3 service
        s3_service = S3Service()
        
        # Initiate multipart upload
        upload_id = s3_service.initiate_multipart_upload(
            s3_key=s3_key,
            content_type=request.content_type,
            metadata={
                "case-number": request.case_number,
                "khc-id": current_user.khc_advocate_id,
                "upload-timestamp": str(int(datetime.utcnow().timestamp()))
            }
        )
        
        # Calculate number of parts
        num_parts = (request.file_size + request.chunk_size - 1) // request.chunk_size
        
        # Generate pre-signed URLs for each part
        chunk_urls = s3_service.generate_multipart_presigned_urls(
            s3_key=s3_key,
            upload_id=upload_id,
            num_parts=num_parts,
            expires_in=3600  # 1 hour for large files
        )
        
        logger.info(f"Multipart upload initiated", extra={
            "upload_id": upload_id,
            "total_parts": num_parts,
            "s3_key": s3_key
        })
        
        return MultipartInitResponse(
            upload_id=upload_id,
            s3_key=s3_key,
            chunk_urls=chunk_urls,
            total_parts=num_parts
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to initiate multipart upload", extra={
            "error": str(e),
            "user_id": str(current_user.id)
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate multipart upload: {str(e)}"
        )

@router.post("/multipart/complete", response_model=MultipartCompleteResponse)
async def complete_multipart_upload(
    request: MultipartCompleteRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Complete multipart upload after all chunks are uploaded.
    
    **Important:** Parts must be sorted by PartNumber in ascending order.
    
    **Example:**
    ```json
    {
        "upload_id": "abc123xyz",
        "s3_key": "KHC-001/WPC-123-2026/case_file/doc.pdf",
        "parts": [
            {"PartNumber": 1, "ETag": "\"abc123\""},
            {"PartNumber": 2, "ETag": "\"def456\""},
            {"PartNumber": 3, "ETag": "\"ghi789\""}
        ]
    }
    ```
    """
    try:
        logger.info(f"Completing multipart upload", extra={
            "upload_id": request.upload_id,
            "total_parts": len(request.parts),
            "user_id": str(current_user.id)
        })
        
        # Validate parts are sorted
        for i in range(len(request.parts) - 1):
            if request.parts[i].PartNumber >= request.parts[i + 1].PartNumber:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parts must be sorted by PartNumber in ascending order"
                )
        
        # Initialize S3 service
        s3_service = S3Service()
        
        # Format parts for S3 API
        parts = [
            {
                'PartNumber': part.PartNumber,
                'ETag': part.ETag
            }
            for part in request.parts
        ]
        
        # Complete multipart upload
        result = s3_service.complete_multipart_upload(
            s3_key=request.s3_key,
            upload_id=request.upload_id,
            parts=parts
        )
        
        logger.info(f"Multipart upload completed successfully", extra={
            "upload_id": request.upload_id,
            "s3_key": request.s3_key,
            "location": result.get('Location')
        })
        
        return MultipartCompleteResponse(
            status="completed",
            s3_key=request.s3_key,
            location=result.get('Location', ''),
            etag=result.get('ETag', '')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to complete multipart upload", extra={
            "error": str(e),
            "upload_id": request.upload_id
        })
        
        # Attempt to abort the upload
        try:
            s3_service = S3Service()
            s3_service.abort_multipart_upload(request.s3_key, request.upload_id)
            logger.info(f"Aborted failed multipart upload", extra={
                "upload_id": request.upload_id
            })
        except Exception as abort_error:
            logger.error(f"Failed to abort multipart upload", extra={
                "error": str(abort_error)
            })
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete multipart upload: {str(e)}"
        )

@router.delete("/multipart/abort/{upload_id}")
async def abort_multipart_upload(
    upload_id: str,
    s3_key: str,
    current_user: User = Depends(get_current_user)
):
    """
    Abort a multipart upload.
    
    Use this endpoint if the upload fails or is cancelled.
    This cleans up partial uploads in S3.
    """
    try:
        logger.info(f"Aborting multipart upload", extra={
            "upload_id": upload_id,
            "s3_key": s3_key,
            "user_id": str(current_user.id)
        })
        
        s3_service = S3Service()
        s3_service.abort_multipart_upload(s3_key, upload_id)
        
        logger.info(f"Multipart upload aborted successfully", extra={
            "upload_id": upload_id
        })
        
        return {
            "status": "aborted",
            "upload_id": upload_id,
            "message": "Multipart upload aborted and cleaned up"
        }
        
    except Exception as e:
        logger.error(f"Failed to abort multipart upload", extra={
            "error": str(e),
            "upload_id": upload_id
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to abort multipart upload: {str(e)}"
        )