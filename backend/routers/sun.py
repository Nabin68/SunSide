# API Routes for Sun position calculations
from fastapi import APIRouter

router = APIRouter()

@router.get("/sun-position")
async def get_sun_position():
    return {"message": "Sun position endpoint skeleton"}
