import math
import suncalc
from datetime import datetime, timedelta
from typing import List, Dict

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the compass bearing between two points in degrees (0-360, 0=North)
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - \
        math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360

def get_sun_azimuth(lat: float, lon: float, dt: datetime) -> float:
    """
    Returns sun's horizontal direction in degrees (0-360, 0=North)
    Using suncalc-py which returns azimuth in radians (0 at South, pi/2 at West, -pi/2 at East)
    """
    pos = suncalc.get_position(dt, lat, lon)
    azimuth_rad = pos['azimuth']
    
    # Suncalc azimuth: 0 is South, positive West, negative East.
    # To convert to compass (0 North, 90 East...):
    # compass = (degrees(azimuth) + 180) % 360
    azimuth_deg = math.degrees(azimuth_rad)
    compass_azimuth = (azimuth_deg + 180) % 360
    return compass_azimuth

def sun_side(bearing: float, sun_azimuth: float) -> str:
    """
    Returns "LEFT" or "RIGHT" based on sun position relative to bearing.
    Logic: normalize (sun_azimuth - bearing); if 0-180 it's RIGHT, if 180-360 it's LEFT.
    """
    diff = (sun_azimuth - bearing + 360) % 360
    if 0 <= diff < 180:
        return "RIGHT"
    else:
        return "LEFT"

def analyze_route(coordinates: List[List[float]], departure_time: datetime, duration_seconds: float) -> Dict:
    """
    Iterates segments, calculates exposure, tallies results.
    coordinates: list of [lon, lat] from OSRM GeoJSON
    """
    if not coordinates or len(coordinates) < 2:
        return {
            "left_percent": 0,
            "right_percent": 0,
            "recommended_side": "NONE",
            "segment_analysis": []
        }

    # Calculate total distance to interpolate time
    segment_distances = []
    total_distance = 0
    for i in range(len(coordinates) - 1):
        p1 = coordinates[i]
        p2 = coordinates[i+1]
        # Simple Euclidean distance for weight (fine for small segments)
        d = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
        segment_distances.append(d)
        total_distance += d

    if total_distance == 0:
        total_distance = 1 # Avoid division by zero

    left_exposure = 0
    right_exposure = 0
    segment_analysis = []
    
    current_time = departure_time
    accumulated_dist = 0

    for i in range(len(coordinates) - 1):
        p1 = coordinates[i] # [lon, lat]
        p2 = coordinates[i+1]
        
        bearing = calculate_bearing(p1[1], p1[0], p2[1], p2[0])
        
        # Interpolate time at midpoint of segment
        segment_dist = segment_distances[i]
        mid_dist = accumulated_dist + (segment_dist / 2)
        time_offset = (mid_dist / total_distance) * duration_seconds
        segment_time = departure_time + timedelta(seconds=time_offset)
        
        sun_az = get_sun_azimuth(p1[1], p1[0], segment_time)
        side = sun_side(bearing, sun_az)
        
        if side == "LEFT":
            left_exposure += segment_dist
        else:
            right_exposure += segment_dist
            
        segment_analysis.append({
            "lat": p1[1],
            "lon": p1[0],
            "bearing": bearing,
            "sun_azimuth": sun_az,
            "sun_side": side
        })
        
        accumulated_dist += segment_dist

    left_percent = (left_exposure / total_distance) * 100
    right_percent = (right_exposure / total_distance) * 100
    
    recommended_side = "RIGHT" if left_percent > right_percent else "LEFT"
    
    return {
        "left_percent": round(left_percent, 1),
        "right_percent": round(right_percent, 1),
        "recommended_side": recommended_side,
        "segment_analysis": segment_analysis
    }
