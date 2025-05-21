from dotenv import load_dotenv
load_dotenv()

import os
print("DEBUG MONGODB_URI:", os.getenv("MONGODB_URI"))

from fastapi import FastAPI
from auth.routes import router as auth_router

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Auth test app running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
