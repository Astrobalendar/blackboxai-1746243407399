from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Prediction(BaseModel):
    id: Optional[str]
    name: str
    birth_date: datetime
    prediction_data: dict

class KPPredictionRequest(BaseModel):
    name: str
    birth_date: datetime
    birth_time: Optional[str] = None
    birth_location: Optional[str] = None

class PlanetPosition(BaseModel):
    planet: str
    longitude: float
    house: int

class KPPredictionResult(BaseModel):
    name: str
    birth_date: datetime
    planetary_positions: List[PlanetPosition]
    houses: List[int]
    prediction_summary: str

class PredictionSummary(BaseModel):
    id: str
    name: str
    date: datetime
    summary: str

class CalendarEvent(BaseModel):
    id: str
    title: str
    start: datetime
    end: Optional[datetime] = None
    all_day: bool = False
    type: Optional[str] = None

class ClientCreate(BaseModel):
    name: str
    birth_date: datetime
    birth_time: Optional[str] = None
    birth_location: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str]
    birth_date: Optional[datetime]
    birth_time: Optional[str]
    birth_location: Optional[str]

class ClientOut(BaseModel):
    id: str
    name: str
    birth_date: datetime
    birth_time: Optional[str]
    birth_location: Optional[str]

class PaymentRequest(BaseModel):
    client_id: str
    amount: float
    currency: str = "usd"
    description: Optional[str] = None

class PaymentResult(BaseModel):
    payment_id: str
    status: str
    amount: float
    currency: str
    client_id: str
    created_at: datetime

class AdminStatsSummary(BaseModel):
    total_users: int
    total_clients: int
    total_predictions: int
    total_revenue: float

class AdminPredictionOut(BaseModel):
    id: str
    name: str
    birth_date: datetime
    created_at: datetime

class AdminPaymentOut(BaseModel):
    payment_id: str
    status: str
    amount: float
    currency: str
    client_id: str
    created_at: datetime

class UserSettings(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    language: Optional[str]
    timezone: Optional[str]
    theme: Optional[str]

class UserSettingsUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    language: Optional[str]
    timezone: Optional[str]
    theme: Optional[str]
