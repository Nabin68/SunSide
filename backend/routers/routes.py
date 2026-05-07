from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone
import logging
from models.schemas import RouteRequest, AnalysisResponse, RouteResult, SegmentAnalysis
from services import nominatim, osrm, sun_engine

router = APIRouter()
logger = logging.getLogger("sunside.api")

def format_departure_info(dt: datetime) -> str:
    now = datetime.now()
    diff = (dt - now).total_seconds()
    
    time_str = dt.strftime("%I:%M %p")
    if abs(diff) < 300: # 5 mins
        return "Departing now"
    
    day_str = "Today" if dt.date() == now.date() else dt.strftime("%b %d")
    return f"{day_str} at {time_str}"

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_route(request: RouteRequest):
    if request.origin:
        origin_data = await nominatim.geocode(request.origin)
        if not origin_data: raise HTTPException(status_code=404, detail="Start point not found.")
        o_lat, o_lon, origin_name = origin_data["lat"], origin_data["lon"], origin_data["display_name"]
    else:
        o_lat, o_lon = request.origin_lat, request.origin_lon
        origin_name = await nominatim.reverse_geocode(o_lat, o_lon) or "Your Location"

    dest_data = await nominatim.geocode(request.destination)
    if not dest_data: raise HTTPException(status_code=404, detail="Destination not found.")
    
    osrm_routes = await osrm.get_routes(o_lat, o_lon, dest_data["lat"], dest_data["lon"])
    if not osrm_routes: raise HTTPException(status_code=404, detail="No routes found.")
    
    try:
        dep_time = datetime.fromisoformat(request.departure_time.replace('Z', '+00:00')).replace(tzinfo=None)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format")

    results = []
    for route in osrm_routes:
        analysis = sun_engine.analyze_route(route["geometry"], dep_time, route["duration_seconds"])
        leaflet_geometry = [[p[1], p[0]] for p in route["geometry"]]
        
        results.append(RouteResult(
            route_index=route["route_index"],
            duration_seconds=route["duration_seconds"],
            distance_meters=route["distance_meters"],
            geometry=leaflet_geometry,
            left_percent=analysis["left_percent"],
            right_percent=analysis["right_percent"],
            recommended_side=analysis["recommended_side"],
            segment_analysis=[SegmentAnalysis(**sa) for sa in analysis["segment_analysis"]],
            sun_movement=analysis["sun_movement"],
            sun_period=analysis["sun_period"],
            worst_segment_note=analysis["worst_segment_note"],
            arrival_time=analysis["arrival_time"],
            departure_time_str=analysis["departure_time_str"],
            exposure_summary=analysis["exposure_summary"],
            recommendation_reason=analysis["recommendation_reason"]
        ))
    
    results.sort(key=lambda r: max(r.left_percent, r.right_percent))

    return AnalysisResponse(
        origin_name=origin_name,
        destination_name=dest_data["display_name"],
        departure_info=format_departure_info(dep_time),
        routes=results,
        best_route_index=0
    )

@router.get("/reverse-geocode")
async def reverse_geocode(lat: float, lon: float):
    address = await nominatim.reverse_geocode(lat, lon)
    if not address: raise HTTPException(status_code=404, detail="Address not found")
    return {"address": address}

@router.get("/geocode")
async def geocode_suggestions(q: str = Query(..., min_length=2)):
    return await nominatim.geocode_autocomplete(q)

@router.get("/sun-position")
async def get_sun_position_endpoint(lat: float, lon: float, time: str):
    dt = datetime.fromisoformat(time.replace('Z', '+00:00')).replace(tzinfo=None)
    return {"azimuth": sun_engine.get_sun_azimuth(lat, lon, dt)}
