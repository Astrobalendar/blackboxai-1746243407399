from fastapi import APIRouter, HTTPException
from apps.backend.models import KPPredictionRequest, KPPredictionResult
from apps.backend.services.kp_chart_service import calculate_kp_chart
from apps.backend.storage import save_prediction

router = APIRouter()

@router.post("/", response_model=KPPredictionResult)
async def create_kp_chart_prediction(request: KPPredictionRequest):
    try:
        result = calculate_kp_chart(request.name, request.birth_date)
        save_prediction(result.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse
from fastapi import Path
from io import BytesIO
from apps.backend.pdf_generator import generate_prediction_pdf

@router.get("/pdf/{prediction_id}")
async def get_prediction_pdf(prediction_id: str = Path(..., description="Prediction ID")):
    # Placeholder: Load prediction data by ID from storage
    # For now, return dummy data
    prediction_data = {
        "name": "Sample User",
        "birth_date": "2025-05-01",
        "planetary_positions": [
            {"planet": "Sun", "longitude": 100.0, "house": 1},
            {"planet": "Moon", "longitude": 150.0, "house": 2},
        ],
        "prediction_summary": "This is a sample prediction summary."
    }
    pdf_bytes = generate_prediction_pdf(prediction_data)
    return StreamingResponse(BytesIO(pdf_bytes), media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=prediction_{prediction_id}.pdf"
    })
