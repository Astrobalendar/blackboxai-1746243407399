from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, Dict, Any
from uuid import uuid4
import os
import logging
from .email import email_service

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

# Environment variables
API_KEYS = os.getenv("API_KEYS", "").split(",") if os.getenv("API_KEYS") else []

def verify_api_key(authorization: HTTPAuthorizationCredentials = Depends(security)) -> bool:
    """Verify the API key from the Authorization header."""
    if not API_KEYS:
        logger.warning("No API keys configured, allowing all requests")
        return True
        
    token = authorization.credentials
    if token not in API_KEYS:
        logger.warning(f"Invalid API key attempt: {token}")
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return True

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

class EmailRequest(BaseModel):
    """Request model for sending emails with PDF attachments."""
    email: EmailStr
    url: HttpUrl
    subject: Optional[str] = "Your Astrobalendar Prediction"
    message: Optional[str] = "Here's your requested prediction from Astrobalendar."

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

@app.post("/api/send-email")
async def send_email(
    request: EmailRequest,
    _: bool = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Send an email with a PDF attachment.
    
    Request body:
    - email: Recipient's email address
    - url: URL of the PDF to attach (must be from an allowed domain)
    - subject: (optional) Email subject
    - message: (optional) Email body
    
    Requires valid API key in the Authorization header.
    """
    try:
        # Send the email
        success = await email_service.send_email_with_attachment(
            to_email=request.email,
            subject=request.subject,
            body=f"""
            <html>
                <body>
                    <p>Hello,</p>
                    <p>{request.message}</p>
                    <p>Best regards,<br>Astrobalendar Team</p>
                    <p><small>This is an automated message. Please do not reply to this email.</small></p>
                </body>
            </html>
            """,
            attachment_url=str(request.url),
            filename="astrobalendar-prediction.pdf"
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email"
            )
            
        return {"status": "success", "message": "Email sent successfully"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in send_email endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while sending the email"
        )
