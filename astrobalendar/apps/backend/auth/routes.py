from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from auth.schemas import UserCreate, UserOut, Token
from auth.utils import get_password_hash, verify_password, create_access_token
from auth.dependencies import get_current_user
from db.mongo import db
from datetime import datetime, timedelta
from bson.objectid import ObjectId

router = APIRouter(prefix="/auth", tags=["auth"])

class UserInDB(UserCreate):
    hashed_password: str

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    user_dict.pop("password")
    user_dict["created_at"] = datetime.utcnow()
    result = await db.users.insert_one(user_dict)
    user_out = UserOut(**user_dict, id=str(result.inserted_id))
    return user_out

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: UserOut = Depends(get_current_user)):
    return current_user
