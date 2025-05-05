from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi import Body, Path
from apps.backend.models import PaymentRequest, PaymentResult
from apps.backend.services.payment_service import create_checkout_session, verify_payment, initiate_upi_payment

router = APIRouter()

@router.post("/create-session")
async def create_session(payment_request: PaymentRequest = Body(...)):
    try:
        session_id = create_checkout_session(payment_request)
        return {"session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/verify/{session_id}", response_model=PaymentResult)
async def verify_payment_status(session_id: str = Path(...)):
    payment = verify_payment(session_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found or not completed")
    return payment

@router.post("/upi/initiate")
async def upi_initiate():
    # Placeholder for UPI payment initiation
    initiate_upi_payment()
    return JSONResponse(content={"message": "UPI payment initiation placeholder"})
