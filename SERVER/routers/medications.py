from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
import models, schemas, dependencies
from database import get_db

router = APIRouter(
    prefix="/medications",
    tags=["medications"]
)

@router.get("/", response_model=List[schemas.Medication])
def get_medications(db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user.medications

@router.post("/", response_model=schemas.Medication)
def create_medication(med: schemas.MedicationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    db_med = models.Medication(**med.dict(), user_id=current_user.id)
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

@router.post("/{med_id}/log", response_model=schemas.MedicationLog)
def log_medication(med_id: int, log: schemas.MedicationLogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Verify medication belongs to user
    med = db.query(models.Medication).filter(models.Medication.id == med_id, models.Medication.user_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Check if log already exists for this date? (Optional logic, for now allow multi-entry for demo or assume rigid schedule)
    # Ideally should check if entry exists for that `date` and `medication_id`.
    existing_log = db.query(models.MedicationLog).filter(
        models.MedicationLog.medication_id == med_id, 
        models.MedicationLog.date == log.date
    ).first()
    
    if existing_log:
        existing_log.status = log.status
        existing_log.taken_at = log.taken_at
        db.commit()
        db.refresh(existing_log)
        return existing_log
    
    db_log = models.MedicationLog(**log.dict(), user_id=current_user.id) # log.dict() should contain medication_id technically but we passed it in URL. 
    # Wait, schemas.MedicationLogCreate has medication_id. 
    # Let's override or ensure consistency
    db_log.medication_id = med_id
    
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/logs", response_model=List[schemas.MedicationLog])
def get_medication_logs(start_date: date, end_date: date, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    logs = db.query(models.MedicationLog).filter(
        models.MedicationLog.user_id == current_user.id,
        models.MedicationLog.date >= start_date,
        models.MedicationLog.date <= end_date
    ).all()
    return logs
