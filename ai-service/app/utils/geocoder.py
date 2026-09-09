# Geospatial utility functions for calculating distance between locations
from math import radians, sin, cos, sqrt, atan2

def haversine(loc1, loc2):
    """
    Calculate the great-circle distance between two points on the Earth (in kilometers).
    loc1 and loc2 are dicts with 'lat' and 'lng' keys.
    """
    R = 6371.0  # Earth's radius in kilometers

    lat1, lon1 = radians(float(loc1['lat'])), radians(float(loc1['lng']))
    lat2, lon2 = radians(float(loc2['lat'])), radians(float(loc2['lng']))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2.0)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2.0)**2
    c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a))

    return R * c
