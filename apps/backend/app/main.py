from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

allow_origins = [
    "https://akuraastrology.netlify.app",
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
