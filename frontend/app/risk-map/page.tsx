"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.MapContainer
    ),
  { ssr: false }
);

const TileLayer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.TileLayer
    ),
  { ssr: false }
);

const CircleMarker = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.CircleMarker
    ),
  { ssr: false }
);

const Popup = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.Popup
    ),
  { ssr: false }
);

export default function RiskMapPage() {
  const [data, setData] =
    useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response =
        await axios.get(
          "http://127.0.0.1:8000/risk-map/"
        );

      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">
        🗺️ AI Risk Intelligence Map
      </h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <p>
          Visualizes civic complaints
          based on AI-generated risk
          scores.
        </p>
      </div>

      <div className="h-[700px] rounded overflow-hidden shadow">
        <MapContainer
          center={[23.239, 87.866]}
          zoom={13}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {data.map((item) => {
            let color = "green";

            if (
              item.risk_score > 70
            ) {
              color = "red";
            } else if (
              item.risk_score > 40
            ) {
              color = "orange";
            }

            return (
              <CircleMarker
                key={item.id}
                center={[
                  item.latitude,
                  item.longitude,
                ]}
                radius={Math.max(
                  10,
                  item.risk_score / 2
                )}
                pathOptions={{
                  color,
                  fillColor:
                    color,
                  fillOpacity:
                    0.5,
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">
                      {item.title}
                    </h3>

                    <p>
                      Risk Score:
                      {" "}
                      {
                        item.risk_score
                      }
                    </p>

                    <p>
                      Latitude:
                      {" "}
                      {
                        item.latitude
                      }
                    </p>

                    <p>
                      Longitude:
                      {" "}
                      {
                        item.longitude
                      }
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-6 flex gap-8 text-lg">
        <div>
          🔴 High Risk
        </div>

        <div>
          🟠 Medium Risk
        </div>

        <div>
          🟢 Low Risk
        </div>
      </div>
    </main>
  );
}