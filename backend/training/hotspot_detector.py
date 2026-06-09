from sklearn.cluster import DBSCAN
import numpy as np


def detect_hotspots(complaints):

    locations = []

    valid_complaints = []

    for complaint in complaints:

        if (
            complaint.latitude
            and complaint.longitude
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

    hotspots = []

    for idx, label in enumerate(
        labels
    ):

        if label == -1:
            continue

        hotspots.append({
            "cluster": int(label),
            "title":
                valid_complaints[idx].title,
            "latitude":
                valid_complaints[idx].latitude,
            "longitude":
                valid_complaints[idx].longitude,
            "category":
                valid_complaints[idx].category
        })

    return hotspots