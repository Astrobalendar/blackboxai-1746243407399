from fastapi import APIRouter, HTTPException, Depends
from apps.backend.models import UserSettings, UserSettingsUpdate
from apps.backend.services.user_service import get_user_settings, update_user_settings

router = APIRouter()

def get_current_user():
    # Placeholder for actual user authentication
    return "current_user"

@router.get("/settings", response_model=UserSettings)
    create_access_token,
    get_current_user,
)

router = APIRouter()

# Pydantic schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    db_user = await register_user(user)
    if not db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user=Depends(get_current_user)):
    return current_user
