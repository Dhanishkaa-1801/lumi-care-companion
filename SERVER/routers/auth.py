from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional

import models, schemas, dependencies
from database import get_db
from config import settings

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/check-user", response_model=schemas.CheckUserResponse)
def check_user(request: schemas.CheckUserRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == request.phone).first()
    return {"exists": user is not None}

@router.post("/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    # 1. Verify OTP (Universal 1234)
    if request.otp != "1234":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Check if user exists
    user = db.query(models.User).filter(models.User.phone == request.phone).first()
    
    if not user:
        # If user doesn't exist, we can't issue a full access token that expects a user DB record usually.
        # But for this flow, the frontend will likely redirect to Register if check-user failed.
        # This endpoint is strictly for logging in existing users.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register.",
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = dependencies.create_access_token(
        data={"sub": user.phone}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "is_registered": True}

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.phone == user.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    new_user = models.User(
        fullname=user.fullname,
        phone=user.phone,
        dob=user.dob,
        blood_group=user.blood_group,
        address=user.address
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = dependencies.create_access_token(
        data={"sub": new_user.phone}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "is_registered": True}
