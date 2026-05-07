import httpx
import logging
from typing import Dict, Optional, List

logger = logging.getLogger("sunside.nominatim")

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
HEADERS = {
    "User-Agent": "SunSide-App/1.0"
}
TIMEOUT = 10.0 # 10 seconds

# Simple in-memory cache
_geocode_cache = {}

async def geocode(query: str) -> Optional[Dict]:
    """
    Converts a place name to { lat, lon, display_name } with caching and timeouts
    """
    if query in _geocode_cache:
        logger.info(f"Geocode cache hit: {query}")
        return _geocode_cache[query]

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            params = {
                "q": query,
                "format": "json",
                "limit": 5 # Get a few for autocomplete
            }
            response = await client.get(f"{NOMINATIM_URL}/search", params=params, headers=HEADERS)
            response.raise_for_status()
            data = response.json()
            
            if not data:
                return None
            
            # For the main geocode call, we just take the first one
            result = data[0]
            processed = {
                "lat": float(result["lat"]),
                "lon": float(result["lon"]),
                "display_name": result["display_name"]
            }
            _geocode_cache[query] = processed
            return processed
        except httpx.TimeoutException:
            logger.error(f"Nominatim geocode timeout for query: {query}")
            return None
        except Exception as e:
            logger.error(f"Geocoding error for {query}: {e}")
            return None

async def geocode_autocomplete(query: str) -> List[Dict]:
    """
    Returns a list of suggestions for autocomplete
    """
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            params = {
                "q": query,
                "format": "json",
                "limit": 5
            }
            response = await client.get(f"{NOMINATIM_URL}/search", params=params, headers=HEADERS)
            response.raise_for_status()
            data = response.json()
            
            return [{
                "lat": float(item["lat"]),
                "lon": float(item["lon"]),
                "display_name": item["display_name"]
            } for item in data]
        except Exception as e:
            logger.error(f"Autocomplete error for {query}: {e}")
            return []

async def reverse_geocode(lat: float, lon: float) -> Optional[str]:
    """
    Converts coordinates to a human-readable address with timeouts
    """
    cache_key = f"rev_{lat}_{lon}"
    if cache_key in _geocode_cache:
        return _geocode_cache[cache_key]["display_name"]

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            params = {
                "lat": lat,
                "lon": lon,
                "format": "json"
            }
            response = await client.get(f"{NOMINATIM_URL}/reverse", params=params, headers=HEADERS)
            response.raise_for_status()
            data = response.json()
            
            if not data:
                return None
            
            address = data.get("display_name")
            _geocode_cache[cache_key] = {"display_name": address}
            return address
        except httpx.TimeoutException:
            logger.error(f"Nominatim reverse geocode timeout for {lat}, {lon}")
            return None
        except Exception as e:
            logger.error(f"Reverse geocoding error for {lat}, {lon}: {e}")
            return None
