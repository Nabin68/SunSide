import httpx
import logging
from typing import List, Dict

logger = logging.getLogger("sunside.osrm")

OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
TIMEOUT = 10.0

async def get_routes(origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float) -> List[Dict]:
    """
    Calls OSRM public API with timeouts and logging
    """
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
                logger.warning(f"OSRM returned non-OK code: {data.get('code')}")
                return []
            
            routes = []
            for idx, r in enumerate(data.get("routes", [])):
                routes.append({
                    "route_index": idx,
                    "geometry": r["geometry"]["coordinates"],
                    "duration_seconds": r["duration"],
                    "distance_meters": r["distance"],
                    "steps": r["legs"][0]["steps"]
                })
            
            logger.info(f"Successfully fetched {len(routes)} routes from OSRM")
            return routes
        except httpx.TimeoutException:
            logger.error(f"OSRM request timed out for {origin_lat}, {origin_lon} to {dest_lat}, {dest_lon}")
            return []
        except Exception as e:
            logger.error(f"OSRM error: {e}")
            return []
