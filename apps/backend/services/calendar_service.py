from datetime import datetime
from typing import List, Optional
from apps.backend.models import CalendarEvent, PredictionSummary
from apps.backend.storage import load_predictions

def get_calendar_events(user_id: Optional[str] = None, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[CalendarEvent]:
    """
    Fetch prediction events filtered by user and date range.
    """
    predictions = load_predictions()
    events = []
    for pred in predictions:
        # Placeholder filtering logic
        event = CalendarEvent(
            id=pred.get("id", ""),
            title=f"Prediction for {pred.get('name', '')}",
            start=pred.get("birth_date"),
            all_day=True,
            type="KP Chart"
        )
        events.append(event)
    return events

def get_prediction_summary_by_date(date: datetime) -> Optional[PredictionSummary]:
    """
    Fetch prediction summary for a specific date.
    """
    predictions = load_predictions()
    for pred in predictions:
        if pred.get("birth_date") == date:
            return PredictionSummary(
                id=pred.get("id", ""),
                name=pred.get("name", ""),
                date=pred.get("birth_date"),
                summary=pred.get("prediction_summary", "")
            )
    return None
