from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

@app.post("/api/predict")
async def predict(request: Request):
    data = await request.json()
    
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

    return {
        "prediction": prediction_result,
        "match_status": match_status,
    }
