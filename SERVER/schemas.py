from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    is_registered: bool = True

class TokenData(BaseModel):
    phone: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    fullname: str
    phone: str
    dob: date
    blood_group: str
    address: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Login Request
class LoginRequest(BaseModel):
    phone: str
    otp: str

class CheckUserRequest(BaseModel):
    phone: str

class CheckUserResponse(BaseModel):
    exists: bool

# Nominee Schemas
class NomineeBase(BaseModel):
    name: str
    relationship: str
    phone: str

class NomineeCreate(NomineeBase):
    pass

class Nominee(NomineeBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# Medication Schemas
class MedicationBase(BaseModel):
    name: str
    dosage: str
    scheduled_time: str
    start_date: date
    end_date: Optional[date] = None

class MedicationCreate(MedicationBase):
    pass

class Medication(MedicationBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class MedicationLogBase(BaseModel):
    status: str
    taken_at: Optional[datetime] = None

class MedicationLogCreate(MedicationLogBase):
    medication_id: int
    date: date

class MedicationLog(MedicationLogBase):
    id: int
    medication_id: int
    user_id: int
    date: date

    class Config:
        orm_mode = True

# Emergency Alert Schemas
class EmergencyAlertBase(BaseModel):
    stage: str

class EmergencyAlertCreate(EmergencyAlertBase):
    pass

class EmergencyAlert(EmergencyAlertBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True
