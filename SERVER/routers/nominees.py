from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, dependencies
from database import get_db

router = APIRouter(
    prefix="/nominees",
    tags=["nominees"]
)

@router.get("/", response_model=List[schemas.Nominee])
def get_nominees(db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user.nominees

@router.post("/", response_model=schemas.Nominee)
def create_nominee(nominee: schemas.NomineeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    db_nominee = models.Nominee(**nominee.dict(), user_id=current_user.id)
    db.add(db_nominee)
    db.commit()
    db.refresh(db_nominee)
    return db_nominee

@router.delete("/{nominee_id}")
def delete_nominee(nominee_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    db_nominee = db.query(models.Nominee).filter(models.Nominee.id == nominee_id, models.Nominee.user_id == current_user.id).first()
    if not db_nominee:
        raise HTTPException(status_code=404, detail="Nominee not found")
    db.delete(db_nominee)
    db.commit()
    return {"message": "Nominee deleted"}
