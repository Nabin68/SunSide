import httpx
import logging
from typing import List, Dict

logger = logging.getLogger("sunside.osrm")

OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
TIMEOUT = 10.0
TRANSPORT_TIME_MULTIPLIER = 1.3 # FIX 1: Account for traffic/stops

async def get_routes(origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float) -> List[Dict]:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            coords = f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
            params = {
                "overview": "full",
                "alternatives": "true",
                "steps": "true",
                "geometries": "geojson"
            }
            url = f"{OSRM_URL}/{coords}"
            logger.info(f"Fetching routes from OSRM: {coords}")
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get("code") != "Ok":
                return []
            
            routes = []
            for idx, r in enumerate(data.get("routes", [])):
                # Apply time multiplier
                adjusted_duration = r["duration"] * TRANSPORT_TIME_MULTIPLIER
                
                routes.append({
                    "route_index": idx,
                    "geometry": r["geometry"]["coordinates"],
                    "duration_seconds": adjusted_duration,
                    "distance_meters": r["distance"],
                    "steps": r["legs"][0]["steps"]
                })
            
            return routes
        except Exception as e:
            logger.error(f"OSRM error: {e}")
            return []
