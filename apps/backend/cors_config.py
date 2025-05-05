from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os

def setup_cors(app):
    """
    Configure CORS for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    # Get allowed origins from environment variable
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "https://astrobalendar.netlify.app").split(",")
    
    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    )
    
    return app

def get_cors_headers() -> dict:
    """Get CORS headers for responses."""
    return {
        "Access-Control-Allow-Origin": os.getenv("ALLOWED_ORIGINS", "https://astrobalendar.netlify.app"),
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    }
