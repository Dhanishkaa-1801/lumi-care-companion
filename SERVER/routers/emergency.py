from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas, dependencies
from database import get_db

router = APIRouter(
    prefix="/emergency",
    tags=["emergency"]
)

@router.get("/active", response_model=schemas.EmergencyAlert)
def get_active_alert(db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    alert = db.query(models.EmergencyAlert).filter(
        models.EmergencyAlert.user_id == current_user.id,
        models.EmergencyAlert.is_active == True
    ).order_by(models.EmergencyAlert.created_at.desc()).first()
    
    if not alert:
        # Return a dummy or 404? 
        # Better to return 204 or just nulls if no content?
        # For simplicity, let's assume frontend checks if empty, or we return 404.
        raise HTTPException(status_code=404, detail="No active emergency")
    
    return alert

@router.post("/", response_model=schemas.EmergencyAlert)
def trigger_emergency(alert: schemas.EmergencyAlertCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Check if active exists
    existing = db.query(models.EmergencyAlert).filter(
        models.EmergencyAlert.user_id == current_user.id,
        models.EmergencyAlert.is_active == True
    ).first()
    
    if existing:
        existing.stage = alert.stage # Update stage
        db.commit()
        db.refresh(existing)
        return existing

    new_alert = models.EmergencyAlert(
        user_id=current_user.id,
        stage=alert.stage,
        is_active=True
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert

@router.post("/{alert_id}/resolve", response_model=schemas.EmergencyAlert)
def resolve_emergency(alert_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    alert = db.query(models.EmergencyAlert).filter(
        models.EmergencyAlert.id == alert_id,
        models.EmergencyAlert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_active = False
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
