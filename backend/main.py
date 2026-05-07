import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("sunside")
from models.schemas import HealthResponse
from routers import sun, routes

app = FastAPI(title="SunSide API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(sun.router, prefix="/api/sun", tags=["sun"])
app.include_router(routes.router, prefix="/api/routes", tags=["routes"])

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok", "message": "Backend is running smoothly"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
