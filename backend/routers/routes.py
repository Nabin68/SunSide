from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
import logging
from models.schemas import RouteRequest, AnalysisResponse, RouteResult, SegmentAnalysis
from services import nominatim, osrm, sun_engine

router = APIRouter()
logger = logging.getLogger("sunside.api")

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_route(request: RouteRequest):
    logger.info(f"Received analysis request for destination: {request.destination}")
    
    # 1. Geocode destination
    dest_data = await nominatim.geocode(request.destination)
    if not dest_data:
        logger.warning(f"Destination not found: {request.destination}")
        raise HTTPException(status_code=404, detail="Destination not found. Please try a more specific address.")
    
    # 2. Get routes from OSRM
    osrm_routes = await osrm.get_routes(
        request.origin_lat, 
        request.origin_lon, 
        dest_data["lat"], 
        dest_data["lon"]
    )
    
    if not osrm_routes:
        logger.warning(f"No routes found for destination: {request.destination}")
        raise HTTPException(status_code=404, detail="No routes found between these locations.")
    
    # Parse departure time
    try:
        dep_time = datetime.fromisoformat(request.departure_time.replace('Z', '+00:00'))
    except ValueError:
        logger.error(f"Invalid departure time format: {request.departure_time}")
        raise HTTPException(status_code=400, detail="Invalid departure time format")

    # 3. Analyze each route
    results = []
    for route in osrm_routes:
        analysis = sun_engine.analyze_route(
            route["geometry"], 
            dep_time, 
            route["duration_seconds"]
        )
        
        leaflet_geometry = [[p[1], p[0]] for p in route["geometry"]]
        
        results.append(RouteResult(
            route_index=route["route_index"],
            duration_seconds=route["duration_seconds"],
            distance_meters=route["distance_meters"],
            geometry=leaflet_geometry,
            left_percent=analysis["left_percent"],
            right_percent=analysis["right_percent"],
            recommended_side=analysis["recommended_side"],
            segment_analysis=[SegmentAnalysis(**sa) for sa in analysis["segment_analysis"]]
        ))
    
    # Best route: OSRM's first route is usually best for traffic, 
    # but let's stick to the one with the most comfort if they are similar.
    # For now, we use the comfort-based logic from Step 2.
    best_route_idx = 0
    min_exposure = 101
    for i, r in enumerate(results):
        max_exp = max(r.left_percent, r.right_percent)
        if max_exp < min_exposure:
            min_exposure = max_exp
            best_route_idx = i

    logger.info(f"Analysis complete. Best route index: {best_route_idx}")
    return AnalysisResponse(
        destination_name=dest_data["display_name"],
        routes=results,
        best_route_index=best_route_idx
    )

@router.get("/reverse-geocode")
async def reverse_geocode(lat: float, lon: float):
    logger.info(f"Reverse geocoding: {lat}, {lon}")
    address = await nominatim.reverse_geocode(lat, lon)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"address": address}

@router.get("/geocode")
async def geocode_suggestions(q: str = Query(..., min_length=2)):
    """Live destination suggestions"""
    logger.info(f"Geocode suggestions for: {q}")
    suggestions = await nominatim.geocode_autocomplete(q)
    return suggestions

@router.get("/sun-position")
async def get_sun_position_endpoint(lat: float, lon: float, time: str):
    """Returns sun azimuth + altitude for map indicator"""
    try:
        dt = datetime.fromisoformat(time.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format")
    
    azimuth = sun_engine.get_sun_azimuth(lat, lon, dt)
    # Get altitude too for the indicator (optional)
    import suncalc
    pos = suncalc.get_position(dt, lat, lon)
    
    return {
        "azimuth": azimuth,
        "altitude": pos['altitude'] # in radians
    }
