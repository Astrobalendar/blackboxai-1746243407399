from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(title="AstroBalendar Backend API")

# CORS middleware setup
origins = [
    "http://localhost",
    "http://localhost:4173",
    "http://localhost:3000",
    # Add other allowed origins here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from apps.backend.api import kp_chart, user, clients, payments

app.include_router(kp_chart.router, prefix="/api/kp-chart", tags=["KP Chart"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
from apps.backend.api import payments, calendar

app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
from apps.backend.api import admin

app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AstroBalendar Backend API"}
