from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from pydantic import BaseModel
from auth.schemas import UserCreate, UserOut, Token
from auth.utils import get_password_hash, verify_password, create_access_token
from auth.dependencies import get_current_user
from db.mongo import db
from bson.objectid import ObjectId
import os

router = APIRouter(prefix="/auth", tags=["auth_advanced"])

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey123")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RoleUserOut(UserOut):
    role: Optional[str] = "user"
    verified: Optional[bool] = False

@router.post("/register", response_model=RoleUserOut, tags=["Authentication"], summary="Register a new user")
async def register(user: UserCreate):
    """
    Register a new user with email and password.
    Returns the created user data (excluding password).
    """
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    user_dict.pop("password")
    user_dict["created_at"] = datetime.utcnow()
    user_dict["role"] = "user"
    user_dict["verified"] = False
    result = await db.users.insert_one(user_dict)
    user_out = RoleUserOut(**user_dict, id=str(result.inserted_id))
    # TODO: Generate and send email verification token here (mock)
    return user_out

@router.post("/login", response_model=Token, tags=["Authentication"], summary="User login and token generation")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user and return access and refresh tokens.
    """
    user = await db.users.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.get("verified", False):
        raise HTTPException(status_code=403, detail="Email not verified")
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user.get("role", "user")},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token, tags=["Authentication"], summary="Refresh access token")
async def refresh_token(token_request: RefreshTokenRequest):
    """
    Refresh access token using a valid refresh token.
    """
    try:
        payload = jwt.decode(token_request.refresh_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user.get("role", "user")},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

def role_required(required_role: str):
    async def role_checker(current_user: RoleUserOut = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

@router.get("/admin-only", tags=["Admin"], summary="Admin-only access route")
async def admin_only_route(current_user: RoleUserOut = Depends(role_required("admin"))):
    """
    Example route accessible only by admin users.
    """
    return {"message": f"Hello Admin {current_user.name}, you have access to this route."}

@router.get("/verify-email/{user_id}", tags=["Authentication"], summary="Verify user email")
async def verify_email(user_id: str):
    """
    Mock email verification endpoint.
    """
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"verified": True}})
    return {"message": "Email verified successfully."}
