from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas, dependencies
from database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(user_update: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Update fields
    current_user.fullname = user_update.fullname
    current_user.dob = user_update.dob
    current_user.blood_group = user_update.blood_group
    current_user.address = user_update.address
    # Phone usually shouldn't change easily as it is the ID, but for now we skip updating phone or strictly validation
    
    db.commit()
    db.refresh(current_user)
    return current_user
