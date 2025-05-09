from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import uuid4

app = FastAPI()

# In-memory user store for demo
users_db = {}

class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    role: str  # 'astrologer', 'client', or 'student'
    phone: Optional[str] = None
    photo_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: str

@app.post("/api/signup", response_model=UserOut)
def signup(user: UserCreate):
    # Simulate unique email constraint
    for u in users_db.values():
        if u['email'] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid4())
    user_dict = user.dict()
    user_dict['id'] = user_id
    users_db[user_id] = user_dict
    return user_dict

@app.post("/api/login", response_model=UserOut)
def login(email: EmailStr, password: str):
    for u in users_db.values():
        if u['email'] == email and u['password'] == password:
            return u
    raise HTTPException(status_code=401, detail="Invalid credentials")

allow_origins = [
    "https://astrobalendar.netlify.app",
    "https://astrobalendar.com",
    "https://akuraastrology.netlify.app",
    "https://stately-gingersnap-b43e3e3.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Running number store: { (user_id, role): int }
prediction_counters = {}
# In-memory prediction history: { user_id: [prediction_dict, ...] }
prediction_history = {}

@app.post("/api/predict")
async def predict(request: Request):
    data = await request.json()
    # Expect user_id, role, display_name in request (for demo)
    user_id = data.get('user_id')
    role = data.get('role')
    display_name = data.get('display_name', '')
    if not user_id or not role or not display_name:
        return {"error": "user_id, role, and display_name required"}

    # Generate prefix
    if role == 'astrologer':
        prefix = 'AB'
    elif role == 'client':
        prefix = 'CL'
    else:
        prefix = 'OT'
    name_part = (display_name[:3].upper() + 'XXX')[:3]
    # Running number
    key = (user_id, role)
    n = prediction_counters.get(key, 0) + 1
    prediction_counters[key] = n
    prediction_id = f"{prefix}{name_part}{user_id}{n}"

    # Simulate KP Astrology logic
    prediction_result = {
        "ascendant": "Aries 15°",
        "moon_sign": "Cancer",
        "dasa": "Mars",
        "bhukti": "Venus",
        "antara": "Mercury",
        "sub_lord": "Saturn",
        "sub_sub_lord": "Jupiter",
        "ruling_planets": ["Mars", "Venus", "Saturn"],
    }

    match_status = (
        "match"
        if prediction_result["sub_sub_lord"] in prediction_result["ruling_planets"]
        else "needs_correction"
    )

    # Store prediction in user history
    entry = {
        "prediction_id": prediction_id,
        "user_id": user_id,
        "role": role,
        "display_name": display_name,
        "prediction": prediction_result,
        "match_status": match_status,
        "timestamp": __import__('datetime').datetime.utcnow().isoformat() + 'Z',
    }
    prediction_history.setdefault(user_id, []).append(entry)

    return {
        "prediction": prediction_result,
        "match_status": match_status,
        "prediction_id": prediction_id,
    }

@app.get("/api/predictions/{user_id}")
def get_prediction_history(user_id: str):
    return prediction_history.get(user_id, [])
