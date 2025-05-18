from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Astrobalendar API", version="1.0.0")

# Initialize Firebase
firebase_config = {
    "apiKey": os.getenv("FIREBASE_API_KEY"),
    "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
    "projectId": os.getenv("FIREBASE_PROJECT_ID"),
    "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
    "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
    "appId": os.getenv("FIREBASE_APP_ID"),
    "databaseURL": os.getenv("FIREBASE_DATABASE_URL")
}

# For Firebase Admin SDK, we'll use default credentials
# Make sure GOOGLE_APPLICATION_CREDENTIALS is set in your environment
# or running on a Google Cloud service with appropriate permissions
cred = credentials.ApplicationDefault()

# Initialize Firebase app
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://astrobalendar.com",
        "https://astrobalendar.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PredictionRequest(BaseModel):
    birthDate: str = Field(..., description="Birth date in ISO 8601 format")
    birthTime: str = Field(..., description="Birth time in ISO 8601 format")
    birthPlace: str = Field(..., description="Birth place as city name or coordinates")
    predictionType: str = Field(..., description="Type of prediction (general, career, health, etc.)")

class PredictionResponse(BaseModel):
    predictionText: str
    rulingPlanets: List[str]
    chartData: dict
    interpretationMeta: Optional[dict] = None

# Initialize logging
import logging
logger = logging.getLogger("uvicorn.error")

# Root endpoint
@app.get("/")
async def home():
    """Root endpoint that returns a welcome message."""
    return {
        "message": "Welcome to Astrobalendar API",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "documentation": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        # Check if Firebase is accessible
        db.collection('health').document('check').set({
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"status": "unhealthy", "error": str(e)}
        )

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(prediction: PredictionRequest):
    """
    Generate astrological prediction based on birth details.
    """
    try:
        # Store the prediction request in Firestore
        pred_ref = db.collection('predictions').document()
        pred_data = {
            **prediction.dict(),
            'created_at': firestore.SERVER_TIMESTAMP,
            'status': 'completed'
        }
        pred_ref.set(pred_data)
        
        # Here you would implement the actual prediction logic
        # This is a placeholder response
        return {
            "predictionText": "Sample prediction based on birth details.",
            "rulingPlanets": ["Sun", "Moon"],
            "chartData": {"sign": "Aries", "house": 1},
            "interpretationMeta": {"confidence": 0.95},
            "predictionId": pred_ref.id
        }
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# User Management Endpoints
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user"""
    try:
        # Check if user already exists
        existing_user = db.collection('users').where('email', '==', user.email).limit(1).get()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        # Create user in Firestore
        user_ref = db.collection('users').document()
        user_data = {
            'name': user.name,
            'email': user.email,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        user_ref.set(user_data)
        
        # In a real app, you would:
        # 1. Hash the password
        # 2. Create the user in Firebase Auth
        # 3. Then store additional data in Firestore
        
        return {**user_data, 'id': user_ref.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User creation failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create user")

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    try:
        user_ref = db.collection('users').document(user_id)
        user = user_ref.get()
        if user.exists:
            user_data = user.to_dict()
            # Convert Firestore timestamp to datetime
            user_data['created_at'] = user_data['created_at'].isoformat()
            if 'updated_at' in user_data:
                user_data['updated_at'] = user_data['updated_at'].isoformat()
            return {**user_data, 'id': user.id}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        logger.error(f"Failed to get user: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to retrieve user")

# Event Management Endpoints
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    user_id: str

class EventResponse(EventCreate):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

@app.post("/events/", response_model=EventResponse)
async def create_event(event: EventCreate):
    """Create a new event"""
    try:
        # Verify user exists
        user_ref = db.collection('users').document(event.user_id)
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
            
        event_ref = db.collection('events').document()
        event_data = {
            **event.dict(),
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        event_ref.set(event_data)
        
        # Return the created event with ID
        return {**event_data, 'id': event_ref.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Event creation failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create event")

@app.get("/events/{user_id}", response_model=List[EventResponse])
async def get_user_events(user_id: str):
    """Get all events for a user"""
    try:
        events_ref = db.collection('events')
        events = events_ref.where('user_id', '==', user_id).order_by('event_date').stream()
        
        result = []
        for event in events:
            event_data = event.to_dict()
            # Convert Firestore timestamps to datetime
            event_data['created_at'] = event_data['created_at'].isoformat()
            if 'updated_at' in event_data:
                event_data['updated_at'] = event_data['updated_at'].isoformat()
            if 'event_date' in event_data and hasattr(event_data['event_date'], 'isoformat'):
                event_data['event_date'] = event_data['event_date'].isoformat()
            result.append({'id': event.id, **event_data})
            
        return result
    except Exception as e:
        logger.error(f"Failed to get events: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to retrieve events")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
