from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
# Removed unused asyncio import

from db.mongo import db, check_db_connection
from db.db_ops import create_user, get_user_by_email, create_event, get_events_by_user
from bson.objectid import ObjectId
from api import chat

app = FastAPI()

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

import logging

logger = logging.getLogger("uvicorn.error")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    connected = await check_db_connection()
    if connected:
        logger.info("✅ MongoDB connection established successfully.")
    else:
        logger.error("❌ Failed to connect to MongoDB")
        raise RuntimeError("Failed to connect to MongoDB")
    yield
app = FastAPI(lifespan=lifespan)

@app.get("/", response_class=HTMLResponse)
async def home():
    html_content = """
    <html>
        <head>
            <title>AstroBalendar Home</title>
        </head>
        <body>
            <h1>Welcome to AstroBalendar Backend</h1>
            <p>This is the backend service for AstroBalendar.</p>
        </body>
    </html>
    """
    return html_content

@app.get("/db-status")
async def db_status():
    connected = await check_db_connection()
    return {"mongodb_connected": connected}
    await db.predictions.insert_one(data.model_dump())
@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionRequest):
    # Store the request in MongoDB and return mocked response
    await db.predictions.insert_one(data.dict())
    mock_response = {
        "predictionText": "This is a mocked prediction based on your birth details.",
        "rulingPlanets": ["Mars", "Venus"],
        "chartData": {
            "rasiData": [10, 20, 15, 5, 10, 10, 5, 10, 5, 5, 3, 2],
            "rasiLabels": ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
            "navamsaData": [5, 10, 10, 10, 5, 10, 10, 10, 5, 5, 5, 5],
            "navamsaLabels": ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        },
        "interpretationMeta": {
            "summary": "This is a summary of the prediction.",
            "details": "Detailed interpretation goes here."
        }
    }
    return mock_response

# Additional endpoints for users and events

class User(BaseModel):
    name: str
    email: str

@app.post("/users")
async def register_user(user: User):
    existing_user = get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    user_id = create_user(user.model_dump())
    return {"user_id": str(user_id)}

@app.get("/users/{email}")
async def get_user(email: str):
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

class Event(BaseModel):
    user_id: str
    title: str
    date: str
    event_data = event.model_dump()

@app.post("/events")
async def add_event(event: Event):
    event_data = event.dict()
    event_data["user_id"] = ObjectId(event.user_id)
    event_id = create_event(event_data)
    return {"event_id": str(event_id)}

@app.get("/events/{user_id}")
async def get_events(user_id: str):
    events = get_events_by_user(user_id)
    for event in events:
        event["_id"] = str(event["_id"])
        event["user_id"] = str(event["user_id"])
    return events

app.include_router(chat.router)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()  # Ensure the app variable is defined

origins = [
    "http://localhost:5173",
    "https://akuraastrology.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
