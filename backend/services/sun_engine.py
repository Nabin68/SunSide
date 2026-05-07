import math
import suncalc
from datetime import datetime, timedelta
from typing import List, Dict, Optional

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    return (math.degrees(math.atan2(y, x)) + 360) % 360

def get_sun_azimuth(lat: float, lon: float, dt: datetime) -> float:
    pos = suncalc.get_position(dt, lat, lon)
    return (math.degrees(pos['azimuth']) + 180) % 360

def get_sun_period(dt: datetime) -> str:
    h = dt.hour
    if 5 <= h < 11: return "Morning sun"
    if 11 <= h < 15: return "Midday sun"
    if 15 <= h < 20: return "Evening sun"
    return "Night/Low sun"

def sun_side(bearing: float, sun_azimuth: float) -> str:
    diff = (sun_azimuth - bearing + 360) % 360
    return "RIGHT" if 0 <= diff < 180 else "LEFT"

def analyze_route(coordinates: List[List[float]], departure_time: datetime, duration_seconds: float) -> Dict:
    if not coordinates or len(coordinates) < 2:
        return {}

    total_distance = 0
    segment_distances = []
    for i in range(len(coordinates) - 1):
        p1, p2 = coordinates[i], coordinates[i+1]
        d = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
        segment_distances.append(d)
        total_distance += d
    
    if total_distance == 0: total_distance = 1

    left_exposure_dist = 0
    right_exposure_dist = 0
    segment_analysis = []
    sides_seen = set()
    
    accumulated_dist = 0
    for i in range(len(coordinates) - 1):
        p1, p2 = coordinates[i], coordinates[i+1]
        mid_dist = accumulated_dist + (segment_distances[i] / 2)
        time_offset = (mid_dist / total_distance) * duration_seconds
        segment_time = departure_time + timedelta(seconds=time_offset)
        
        bearing = calculate_bearing(p1[1], p1[0], p2[1], p2[0])
        sun_az = get_sun_azimuth(p1[1], p1[0], segment_time)
        side = sun_side(bearing, sun_az)
        sides_seen.add(side)
        
        if side == "LEFT": left_exposure_dist += segment_distances[i]
        else: right_exposure_dist += segment_distances[i]
        
        segment_analysis.append({"lat": p1[1], "lon": p1[0], "bearing": bearing, "sun_azimuth": sun_az, "sun_side": side})
        accumulated_dist += segment_distances[i]

    left_percent = (left_exposure_dist / total_distance) * 100
    right_percent = (right_exposure_dist / total_distance) * 100
    recommended_side = "RIGHT" if left_percent > right_percent else "LEFT"
    
    # exposure time
    left_mins = int((left_exposure_dist / total_distance) * duration_seconds / 60)
    right_mins = int((right_exposure_dist / total_distance) * duration_seconds / 60)
    
    exposure_summary = f"You'll face direct sun for ~{left_mins if recommended_side == 'RIGHT' else right_mins} mins on the { 'left' if recommended_side == 'RIGHT' else 'right' } side"
    
    # Recommendation reason
    diff_percent = abs(left_percent - right_percent)
    recommendation_reason = f"{recommended_side.capitalize()} side has {int(diff_percent)}% less direct sun on this route at this time of day"

    worst_note = None
    if max(left_percent, right_percent) > 60:
        side = "LEFT" if left_percent > right_percent else "RIGHT"
        mins = int(max(left_percent, right_percent) / 100 * duration_seconds / 60)
        worst_note = f"⚠️ Direct sun on {side} side for ~{mins} mins during your journey"

    return {
        "left_percent": round(left_percent, 1),
        "right_percent": round(right_percent, 1),
        "recommended_side": recommended_side,
        "segment_analysis": segment_analysis,
        "sun_movement": "CROSSING" if len(sides_seen) > 1 else "STABLE",
        "sun_period": get_sun_period(departure_time),
        "worst_segment_note": worst_note,
        "arrival_time": (departure_time + timedelta(seconds=duration_seconds)).isoformat(),
        "departure_time_str": departure_time.strftime("%I:%M %p"),
        "exposure_summary": exposure_summary,
        "recommendation_reason": recommendation_reason
    }
