# backend/app/api/v1/endpoints/ocr.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.api.deps import get_current_user
from app.db.models import User, Document, Case
from sqlalchemy.orm import Session
from app.db.database import get_db
import pypdf
from pypdf import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
from datetime import datetime

router = APIRouter()

@router.post("/extract")
async def extract_text(
    file: UploadFile,
    current_user: User = Depends(get_current_user)
):
    try:
        contents = await file.read()
        pdf = PdfReader(io.BytesIO(contents))
        text = "\n\n".join(page.extract_text() for page in pdf.pages)
        return {"text": text, "pages": len(pdf.pages)}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/create-searchable-pdf")
async def create_searchable_pdf(
    file: UploadFile = File(...),
    text: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Creates searchable PDF by layering invisible text over original PDF"""
    try:
        original_pdf = PdfReader(io.BytesIO(await file.read()))
        writer = PdfWriter()
        
        # Split text by pages
        lines = text.split("\n")
        lines_per_page = len(lines) // len(original_pdf.pages)
        
        for page_num, page in enumerate(original_pdf.pages):
            # Create text overlay (invisible)
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=letter)
            can.setFillColorRGB(0, 0, 0, 0)  # Transparent
            can.setFont("Helvetica", 1)  # Tiny font
            
            # Add text
            page_text = "\n".join(lines[page_num * lines_per_page:(page_num + 1) * lines_per_page])
            can.drawString(0, 0, page_text)
            can.save()
            
            # Merge with original
            packet.seek(0)
            overlay = PdfReader(packet)
            page.merge_page(overlay.pages[0])
            writer.add_page(page)
        
        # Output
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=searchable.pdf"}
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/save-to-case")
async def save_to_case(
    file: UploadFile = File(...),
    text: str = Form(...),
    case_id: str = Form(...),
    format: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Saves OCR document to case"""
    # Verify case ownership
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.advocate_id == current_user.id
    ).first()
    
    if not case:
        raise HTTPException(404, "Case not found")
    
    # Generate S3 key
    filename = f"ocr_{datetime.utcnow().timestamp()}_{file.filename}"
    s3_key = f"{case.efiling_number}/ocr/{filename}"
    
    # Create document or searchable PDF based on format
    if format == "searchable_pdf":
        # Use create_searchable_pdf logic, upload to S3
        pass  # TODO: S3 upload
    else:
        # Save as txt to S3
        pass  # TODO: S3 upload
    
    # Save metadata
    doc = Document(
        case_id=case_id,
        khc_document_id=f"OCR_{datetime.utcnow().timestamp()}",
        category="misc",
        title=f"OCR - {file.filename}",
        s3_key=s3_key,
        file_size=len(text.encode()),
        upload_status="completed"
    )
    db.add(doc)
    db.commit()
    
    return {"message": "Saved successfully", "document_id": str(doc.id)}
