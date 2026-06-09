"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const pendingIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const progressIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const resolvedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ComplaintMap() {
  const [complaints, setComplaints] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(
        "https://civicpulseai-production.up.railway.app/map/complaints"
      );

      setComplaints(response.data);
    } catch (error) {
      console.error(
        "Failed to load complaints",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const getMarkerIcon = (
    status: string
  ) => {
    switch (status) {
      case "pending":
        return pendingIcon;

      case "in_progress":
        return progressIcon;

      case "resolved":
        return resolvedIcon;

      default:
        return progressIcon;
    }
  };

  if (loading) {
    return (
      <p className="text-lg">
        Loading map...
      </p>
    );
  }

  return (
    <>
      <div className="flex gap-6 mb-4 text-lg font-semibold">
        <div>🟡 Pending</div>
        <div>🔵 In Progress</div>
        <div>🟢 Resolved</div>
      </div>

      <MapContainer
        center={[23.2323, 87.8615]}
        zoom={8}
        style={{
          height: "600px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {complaints.map((c) => {
          if (
            c.latitude == null ||
            c.longitude == null
          ) {
            return null;
          }

          return (
            <Marker
              key={c.id}
              position={[
                Number(c.latitude),
                Number(c.longitude),
              ]}
              icon={getMarkerIcon(
                c.status
              )}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">
                    {c.title}
                  </h3>

                  <p>
                    <strong>
                      Category:
                    </strong>{" "}
                    {c.category}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {c.status}
                  </p>

                  <p>
                    <strong>ID:</strong>{" "}
                    {c.id}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}