from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
from apps.backend.models import AdminStatsSummary, AdminPredictionOut, AdminPaymentOut
from apps.backend.services.admin_service import (
    get_admin_stats_summary,
    get_admin_predictions,
    get_admin_payments,
    get_admin_users,
    get_admin_clients,
)

router = APIRouter()

def is_admin_user():
    # TODO: Implement actual admin check logic
    return True

@router.get("/stats/summary", response_model=AdminStatsSummary)
async def stats_summary(admin: bool = Depends(is_admin_user)):
    if not admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_admin_stats_summary()

@router.get("/predictions", response_model=List[AdminPredictionOut])
async def list_predictions(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), admin: bool = Depends(is_admin_user)):
    if not admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_admin_predictions(page, page_size)

@router.get("/payments", response_model=List[AdminPaymentOut])
async def list_payments(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), admin: bool = Depends(is_admin_user)):
    if not admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_admin_payments(page, page_size)

@router.get("/users")
async def list_users(admin: bool = Depends(is_admin_user)):
    if not admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_admin_users()

@router.get("/clients")
async def list_clients(admin: bool = Depends(is_admin_user)):
    if not admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_admin_clients()
