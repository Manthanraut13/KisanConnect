# RouteOptimizer class using K-Means clustering and greedy TSP route ordering
import logging
import numpy as np
from sklearn.cluster import KMeans
from app.utils.geocoder import haversine

logger = logging.getLogger(__name__)

class RouteOptimizer:
    """
    Optimizes delivery routes for driver assignments by clustering order destinations
    and generating shortest delivery sequence using nearest-neighbor greedy TSP.
    """

    def optimize(self, orders: list, driver_location: dict) -> dict:
        """
        Cluster orders and generate optimized delivery route.
        """
        if not orders:
            return {"clusters": []}

        # Normalize driver location keys
        d_lat = float(driver_location.get('lat', driver_location.get('latitude', 0.0)))
        d_lng = float(driver_location.get('lng', driver_location.get('longitude', 0.0)))
        start_point = {'lat': d_lat, 'lng': d_lng}

        # If 3 or fewer orders, single cluster greedy TSP
        if len(orders) <= 3:
            route_data = self._build_route_for_stops(start_point, orders)
            return {
                "clusters": [{
                    "cluster_id": 1,
                    "optimized_route": route_data["route"],
                    "total_km": route_data["total_km"],
                    "total_minutes": route_data["total_minutes"]
                }]
            }

        # K-Means clustering for >3 orders
        n_clusters = min(3, max(1, len(orders) // 3))
        coords = np.array([[float(o['lat']), float(o['lng'])] for o in orders])

        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)

        clusters_dict = {}
        for idx, order in enumerate(orders):
            c_id = int(labels[idx]) + 1
            if c_id not in clusters_dict:
                clusters_dict[c_id] = []
            clusters_dict[c_id].append(order)

        result_clusters = []
        for c_id, c_orders in clusters_dict.items():
            route_data = self._build_route_for_stops(start_point, c_orders)
            result_clusters.append({
                "cluster_id": c_id,
                "optimized_route": route_data["route"],
                "total_km": route_data["total_km"],
                "total_minutes": route_data["total_minutes"]
            })

        return {"clusters": result_clusters}

    def _build_route_for_stops(self, start_point: dict, stops: list) -> dict:
        """Run nearest-neighbor greedy TSP algorithm from start_point."""
        unvisited = stops.copy()
        current = start_point
        ordered_route = []
        total_km = 0.0
        sequence = 1

        while unvisited:
            nearest = min(unvisited, key=lambda s: haversine(current, {'lat': float(s['lat']), 'lng': float(s['lng'])}))
            dist = haversine(current, {'lat': float(nearest['lat']), 'lng': float(nearest['lng'])})
            total_km += dist
            current = {'lat': float(nearest['lat']), 'lng': float(nearest['lng'])}

            # Estimate arrival time (assumed city speed: 25 km/h)
            eta_minutes = int(round((total_km / 25.0) * 60))

            ordered_route.append({
                "order_id": nearest.get('id', nearest.get('order_id', f'order-{sequence}')),
                "address": nearest.get('address', 'Delivery Stop'),
                "lat": float(nearest['lat']),
                "lng": float(nearest['lng']),
                "sequence": sequence,
                "eta_minutes": eta_minutes
            })

            unvisited.remove(nearest)
            sequence += 1

        total_minutes = int(round((total_km / 25.0) * 60))

        return {
            "route": ordered_route,
            "total_km": round(total_km, 2),
            "total_minutes": total_minutes
        }
