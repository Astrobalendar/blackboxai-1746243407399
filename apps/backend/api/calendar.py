from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from apps.backend.services.calendar_service import get_calendar_events, get_prediction_summary_by_date
from apps.backend.models import CalendarEvent, PredictionSummary

router = APIRouter()

@router.get("/", response_model=list[CalendarEvent])
async def list_calendar_events(
    user_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    events = get_calendar_events(user_id, start_date, end_date)
    return events

@router.get("/{date}", response_model=PredictionSummary)
async def get_prediction_by_date(date: datetime):
    prediction = get_prediction_summary_by_date(date)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found for the given date")
    return prediction
