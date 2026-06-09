from sklearn.cluster import DBSCAN
import numpy as np


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
                complaint.latitude,
                complaint.longitude
            ])

            valid_complaints.append(
                complaint
            )

    if len(locations) < 2:

        return []

    coords = np.array(
        locations
    )

    model = DBSCAN(
        eps=0.01,
        min_samples=2
    )

    labels = model.fit_predict(
        coords
    )

    # Count complaints in each cluster

    cluster_counts = {}

    for label in labels:

        if label == -1:
            continue

        cluster_counts[label] = (
            cluster_counts.get(
                label,
                0
            ) + 1
        )

    hotspots = []

    for idx, label in enumerate(
        labels
    ):

        # Ignore noise points

        if label == -1:
            continue

        hotspots.append({

            "cluster":
                int(label),

            "cluster_size":
                cluster_counts[label],

            "title":
                valid_complaints[idx].title,

            "category":
                valid_complaints[idx].category,

            "latitude":
                valid_complaints[idx].latitude,

            "longitude":
                valid_complaints[idx].longitude

        })

    return hotspots