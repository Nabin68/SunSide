from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    message: Optional[str] = None

class RouteRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    destination: str        # text query
    departure_time: str     # ISO format

class SegmentAnalysis(BaseModel):
    lat: float
    lon: float
    bearing: float
    sun_azimuth: float
    sun_side: str

class RouteResult(BaseModel):
    route_index: int
    duration_seconds: float
    distance_meters: float
    geometry: List[List[float]]
    left_percent: float
    right_percent: float
    recommended_side: str
    segment_analysis: List[SegmentAnalysis]

class AnalysisResponse(BaseModel):
    destination_name: str
    routes: List[RouteResult]
    best_route_index: int   # index of route with lowest winning-side exposure (or best recommended)
