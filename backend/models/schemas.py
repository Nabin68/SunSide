from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    message: Optional[str] = None

class RouteRequest(BaseModel):
    origin: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lon: Optional[float] = None
    destination: str
    departure_time: str

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
    sun_movement: str
    sun_period: str
    worst_segment_note: Optional[str] = None
    arrival_time: str
    # New fields for Fix 4
    departure_time_str: str
    exposure_summary: str
    recommendation_reason: str

class AnalysisResponse(BaseModel):
    origin_name: str
    destination_name: str
    departure_info: str # e.g. "Today at 2:00 PM"
    routes: List[RouteResult]
    best_route_index: int
