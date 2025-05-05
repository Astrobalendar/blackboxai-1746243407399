from fastapi import APIRouter, Depends, HTTPException, status
from auth.dependencies import get_current_user
from auth.schemas import UserOut

router = APIRouter(prefix="/protected", tags=["protected"])

@router.get("/profile", response_model=UserOut)
async def get_profile(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.get("/example")
async def example_protected_route(current_user: UserOut = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.name}! This is a protected route."}
