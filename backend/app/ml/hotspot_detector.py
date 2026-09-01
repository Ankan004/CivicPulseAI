from sklearn.cluster import DBSCAN
import numpy as np
import math


EARTH_RADIUS_METERS = 6_371_000


def _risk_weight(complaint):
    """
    Calculate a simple civic risk contribution
    for one complaint.
    """

    score = 1

    # Priority
    if complaint.priority:
        priority = complaint.priority.lower()

        if priority == "high":
            score += 3
        elif priority == "medium":
            score += 2

    # Severity
    if complaint.severity:
        severity = complaint.severity.lower()

        if severity == "high":
            score += 3
        elif severity == "medium":
            score += 2

    return score


def detect_hotspots(complaints):

    locations = []
    valid_complaints = []

    for complaint in complaints:

        if (
            complaint.latitude is not None
            and complaint.longitude is not None
            and complaint.latitude != 0
            and complaint.longitude != 0
        ):

            locations.append([
                float(complaint.latitude),
                float(complaint.longitude)
            ])

            valid_complaints.append(complaint)

    # Need at least two complaints for clustering
    if len(locations) < 2:
        return []

    coords = np.array(
        locations,
        dtype=float
    )

    # -------------------------------------------------
    # DBSCAN using geographic distance
    # -------------------------------------------------

    coords_radians = np.radians(coords)

    # 350 meter neighborhood
    eps_meters = 350

    model = DBSCAN(
        eps=eps_meters / EARTH_RADIUS_METERS,
        min_samples=2,
        metric="haversine"
    )

    labels = model.fit_predict(
        coords_radians
    )

    hotspots = []

    unique_labels = sorted(
        set(labels)
    )

    for cluster_id in unique_labels:

        # -1 = DBSCAN noise
        if cluster_id == -1:
            continue

        cluster_indices = [
            i
            for i, label in enumerate(labels)
            if label == cluster_id
        ]

        cluster_complaints = [
            valid_complaints[i]
            for i in cluster_indices
        ]

        cluster_size = len(
            cluster_complaints
        )

        # -------------------------------------------------
        # Calculate geographic centroid
        # -------------------------------------------------

        latitudes = [
            float(c.latitude)
            for c in cluster_complaints
        ]

        longitudes = [
            float(c.longitude)
            for c in cluster_complaints
        ]

        center_lat = sum(latitudes) / len(latitudes)
        center_lon = sum(longitudes) / len(longitudes)

        # -------------------------------------------------
        # Calculate cluster risk
        # -------------------------------------------------

        total_risk = sum(
            _risk_weight(c)
            for c in cluster_complaints
        )

        average_risk = (
            total_risk / cluster_size
        )

        # Density contribution
        density_score = min(
            cluster_size * 10,
            40
        )

        risk_score = min(
            round(
                average_risk * 10
                + density_score
            ),
            100
        )

        # -------------------------------------------------
        # Risk classification
        # -------------------------------------------------

        if risk_score >= 70:
            risk_level = "High"

        elif risk_score >= 40:
            risk_level = "Medium"

        else:
            risk_level = "Low"

        # -------------------------------------------------
        # Determine dominant category
        # -------------------------------------------------

        category_counts = {}

        for complaint in cluster_complaints:

            category = (
                complaint.category
                or "Other"
            )

            category_counts[category] = (
                category_counts.get(
                    category,
                    0
                ) + 1
            )

        dominant_category = max(
            category_counts,
            key=category_counts.get
        )

        # -------------------------------------------------
        # Controlled visual radius
        # -------------------------------------------------

        if risk_level == "High":
            radius = 400

        elif risk_level == "Medium":
            radius = 300

        else:
            radius = 220

        # Increase slightly for larger clusters
        radius += min(
            (cluster_size - 2) * 20,
            100
        )

        # Hard safety limit
        radius = min(
            radius,
            500
        )

        hotspots.append({

            "cluster":
                int(cluster_id),

            "cluster_size":
                cluster_size,

            "latitude":
                round(center_lat, 6),

            "longitude":
                round(center_lon, 6),

            "category":
                dominant_category,

            "risk_score":
                risk_score,

            "risk_level":
                risk_level,

            "radius":
                radius,

            "complaint_ids":
                [
                    c.id
                    for c in cluster_complaints
                    if c.id is not None
                ]

        })

    return hotspots