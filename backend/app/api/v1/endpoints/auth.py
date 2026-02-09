from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from app.db.database import get_db
from app.db import models, schemas
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()

# @router.post("/register", response_model=schemas.UserOut)
# def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
#     """Register new user"""
#     # Check if user exists
#     existing_user = db.query(models.User).filter(
#         models.User.email == user.email
#     ).first()
    
#     if existing_user:
#         raise HTTPException(
#             status_code=400,
#             detail="Email already registered"
#         )
    
#     # Check KHC ID
#     existing_khc = db.query(models.User).filter(
#         models.User.khc_advocate_id == user.khc_advocate_id
#     ).first()
    
#     if existing_khc:
#         raise HTTPException(
#             status_code=400,
#             detail="KHC Advocate ID already registered"
#         )
    
#     # Create user
#     db_user = models.User(
#         email=user.email,
#         password_hash=get_password_hash(user.password),
#         khc_advocate_id=user.khc_advocate_id,
#         khc_advocate_name=user.khc_advocate_name,
#         mobile=user.mobile,
#         khc_enrollment_number=user.khc_enrollment_number,
#         role="advocate",
#         is_active=True,
#         is_verified=False
#     )
    
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
    
#     return db_user

@router.post("/login")
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login endpoint"""
    user = db.query(models.User).filter(
        models.User.email == form_data.email
    ).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Create token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "khc_advocate_id": user.khc_advocate_id,
            "khc_advocate_name": user.khc_advocate_name,
            "role": getattr(user.role, "value", user.role) if hasattr(user, "role") else (user.role or "advocate"),
            "is_verified": getattr(user, "is_verified", False),
        }
    }
    
@router.get("/me", response_model=schemas.UserOut)
def get_current_user_info(
    current_user: models.User = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user

@router.post("/logout")
def logout():
    """Logout endpoint (stateless JWT - client deletes token)"""
    return {"message": "Logged out successfully"}

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    # Check if user exists
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Check KHC ID
    existing_khc = db.query(models.User).filter(
        models.User.khc_advocate_id == user.khc_advocate_id
    ).first()
    
    if existing_khc:
        raise HTTPException(
            status_code=400,
            detail="KHC Advocate ID already registered"
        )
    
    # Create user
    db_user = models.User(
        email=user.email,
        password_hash=get_password_hash(user.password),
        khc_advocate_id=user.khc_advocate_id,
        khc_advocate_name=user.khc_advocate_name,
        mobile=user.mobile,
        khc_enrollment_number=user.khc_enrollment_number,
        role="advocate",  # ← Changed from "ADVOCATE" to "advocate" (lowercase)
        is_active=True,
        is_verified=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user