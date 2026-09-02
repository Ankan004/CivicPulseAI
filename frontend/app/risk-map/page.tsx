"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import { apiUrl } from "@/lib/api";

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

const Circle = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.Circle
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

interface RiskData {
  id?: number;
  title?: string;
  category?: string;
  severity?: string;
  latitude: number;
  longitude: number;
  risk_score: number;
}

interface Hotspot {
  cluster: number;
  cluster_size: number;
  latitude: number;
  longitude: number;
  category: string;
  risk_score: number;
  risk_level: "High" | "Medium" | "Low";
  radius: number;
  complaint_ids?: number[];
}

export default function RiskMapPage() {
  const [data, setData] = useState<RiskData[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [riskResponse, hotspotResponse] =
        await Promise.all([
          axios.get(
            apiUrl("/risk-map/")
          ),

          axios.get(
            apiUrl("/hotspots/")
          ),
        ]);

      setData(
        Array.isArray(riskResponse.data)
          ? riskResponse.data
          : []
      );

      setHotspots(
        Array.isArray(hotspotResponse.data)
          ? hotspotResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Risk Map Error:",
        error
      );

      setError(
        "Unable to load risk intelligence data."
      );
    } finally {
      setLoading(false);
    }
  };

  const highRiskCount = data.filter(
    (item) => Number(item.risk_score) > 70
  ).length;

  const mediumRiskCount = data.filter(
    (item) =>
      Number(item.risk_score) >= 40 &&
      Number(item.risk_score) <= 70
  ).length;

  const lowRiskCount = data.filter(
    (item) => Number(item.risk_score) < 40
  ).length;

  const getHotspotColor = (
    riskLevel: string
  ) => {
    if (riskLevel === "High") {
      return "#ef4444";
    }

    if (riskLevel === "Medium") {
      return "#f97316";
    }

    return "#22c55e";
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-28 px-10 pb-10">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="mb-10">

            <h1 className="text-5xl font-bold mb-3">
              🗺️ AI Risk Intelligence Center
            </h1>

            <p className="text-slate-400 text-lg">
              Real-time civic risk monitoring powered by
              Machine Learning, Hotspot Detection,
              Weather Intelligence and AI Analytics.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* AI SUMMARY */}

          <div
            className="
              mb-8
              bg-gradient-to-r
              from-blue-600/20
              to-purple-600/20
              border border-blue-500/20
              rounded-3xl
              p-6
              backdrop-blur-xl
              shadow-2xl
            "
          >

            <h2 className="text-2xl font-bold mb-5">
              🧠 AI Intelligence Summary
            </h2>

            <div className="grid md:grid-cols-4 gap-6">

              <div>
                <p className="text-slate-400 text-sm">
                  Total Complaints
                </p>

                <h3 className="text-3xl font-bold">
                  {loading ? "—" : data.length}
                </h3>
              </div>

              <div>
                <p className="text-slate-400 text-sm">
                  Active Hotspots
                </p>

                <h3 className="text-3xl font-bold text-red-400">
                  {loading ? "—" : hotspots.length}
                </h3>
              </div>

              <div>
                <p className="text-slate-400 text-sm">
                  High Risk Complaints
                </p>

                <h3 className="text-3xl font-bold text-orange-400">
                  {loading
                    ? "—"
                    : highRiskCount}
                </h3>
              </div>

              <div>
                <p className="text-slate-400 text-sm">
                  System Status
                </p>

                <h3 className="text-3xl font-bold text-green-400">
                  {loading
                    ? "LOADING"
                    : "ACTIVE"}
                </h3>
              </div>

            </div>

          </div>

          {/* RISK CARDS */}

          <div className="grid md:grid-cols-3 gap-6 mb-8">

            {/* HIGH */}

            <div
              className="
                bg-red-500/15
                border border-red-500/20
                rounded-3xl
                p-6
                backdrop-blur-xl
                shadow-xl
              "
            >

              <div className="flex justify-between items-center">

                <h3 className="text-xl font-bold">
                  🔴 High Risk
                </h3>

                <span className="text-2xl font-bold text-red-400">
                  {highRiskCount}
                </span>

              </div>

              <p className="mt-3 text-slate-300">
                Critical locations requiring
                immediate civic intervention.
              </p>

            </div>

            {/* MEDIUM */}

            <div
              className="
                bg-orange-500/15
                border border-orange-500/20
                rounded-3xl
                p-6
                backdrop-blur-xl
                shadow-xl
              "
            >

              <div className="flex justify-between items-center">

                <h3 className="text-xl font-bold">
                  🟠 Medium Risk
                </h3>

                <span className="text-2xl font-bold text-orange-400">
                  {mediumRiskCount}
                </span>

              </div>

              <p className="mt-3 text-slate-300">
                Locations needing monitoring
                and preventive actions.
              </p>

            </div>

            {/* LOW */}

            <div
              className="
                bg-green-500/15
                border border-green-500/20
                rounded-3xl
                p-6
                backdrop-blur-xl
                shadow-xl
              "
            >

              <div className="flex justify-between items-center">

                <h3 className="text-xl font-bold">
                  🟢 Low Risk
                </h3>

                <span className="text-2xl font-bold text-green-400">
                  {lowRiskCount}
                </span>

              </div>

              <p className="mt-3 text-slate-300">
                Stable zones with minimal
                civic concerns.
              </p>

            </div>

          </div>

          {/* MAP */}

          <div
            className="
              h-[700px]
              rounded-3xl
              overflow-hidden
              shadow-[0_0_50px_rgba(59,130,246,0.15)]
              border border-white/10
            "
          >

            <MapContainer
              center={[23.239, 87.866]}
              zoom={13}
              style={{
                height: "100%",
                width: "100%",
              }}
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {data
                .filter(
                  (item) =>
                    Number(item.risk_score) > 70
                )
                .map((item, index) => (

                  <CircleMarker
                    key={`high-risk-${item.id ?? index}`}
                    center={[
                      Number(item.latitude),
                      Number(item.longitude),
                    ]}
                    radius={9}
                    pathOptions={{
                      color: "#ef4444",
                      fillColor: "#ef4444",
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  >

                    <Popup>

                      <div className="w-72">

                        <h3 className="font-bold text-red-600 text-lg mb-3">
                          🚨 High Risk Complaint
                        </h3>

                        <div className="space-y-2">

                          <p>
                            <strong>
                              Title:
                            </strong>{" "}
                            {item.title ||
                              "Civic Complaint"}
                          </p>

                          <p>
                            <strong>
                              Risk Score:
                            </strong>{" "}
                            {item.risk_score}
                          </p>

                          <p>
                            <strong>
                              Category:
                            </strong>{" "}
                            {item.category ||
                              "Other"}
                          </p>

                          <p>
                            <strong>
                              Severity:
                            </strong>{" "}
                            {item.severity ||
                              "Not specified"}
                          </p>

                        </div>

                      </div>

                    </Popup>

                  </CircleMarker>

                ))}

              {hotspots.map(
                (hotspot, index) => {

                  const hotspotColor =
                    getHotspotColor(
                      hotspot.risk_level
                    );

                  return (
                    <Circle
                      key={`hotspot-${hotspot.cluster}-${index}`}
                      center={[
                        Number(
                          hotspot.latitude
                        ),
                        Number(
                          hotspot.longitude
                        ),
                      ]}
                      radius={Number(
                        hotspot.radius
                      )}
                      pathOptions={{
                        color:
                          hotspotColor,
                        fillColor:
                          hotspotColor,
                        fillOpacity: 0.12,
                        weight: 2,
                      }}
                    >

                      <Popup>

                        <div className="w-72">

                          <div className="border-b pb-3 mb-3">

                            <h3
                              className="font-bold text-lg"
                              style={{
                                color:
                                  hotspotColor,
                              }}
                            >
                              🔥 AI Hotspot
                            </h3>

                            <p className="text-gray-500 text-sm mt-1">
                              Cluster-based civic
                              risk zone
                            </p>

                          </div>

                          <div className="space-y-3">

                            <div className="flex justify-between gap-4">
                              <span>
                                📊 Cluster
                              </span>

                              <span className="font-bold">
                                #{hotspot.cluster}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span>
                                🚨 Complaints
                              </span>

                              <span className="font-bold">
                                {hotspot.cluster_size}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span>
                                📍 Category
                              </span>

                              <span className="font-bold text-right">
                                {hotspot.category}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span>
                                ⚠ Risk Level
                              </span>

                              <span
                                className="font-bold"
                                style={{
                                  color:
                                    hotspotColor,
                                }}
                              >
                                {hotspot.risk_level}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span>
                                🎯 Risk Score
                              </span>

                              <span className="font-bold">
                                {hotspot.risk_score}/100
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span>
                                📏 Zone Radius
                              </span>

                              <span className="font-bold">
                                {hotspot.radius} m
                              </span>
                            </div>

                          </div>

                          <div className="mt-5">

                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>
                                Risk intensity
                              </span>

                              <span>
                                {hotspot.risk_score}%
                              </span>
                            </div>

                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">

                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      Number(
                                        hotspot.risk_score
                                      ),
                                      0
                                    ),
                                    100
                                  )}%`,
                                  backgroundColor:
                                    hotspotColor,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      </Popup>

                    </Circle>
                  );
                }
              )}

            </MapContainer>

          </div>

          {/* LEGEND */}

          <div
            className="
              mt-8
              bg-white/5
              backdrop-blur-xl
              border border-white/10
              rounded-2xl
              p-6
            "
          >

            <div className="flex flex-wrap gap-x-8 gap-y-4 text-lg">

              <div className="flex items-center gap-2">
                <span className="text-red-400">
                  🔴
                </span>

                <span>
                  High Risk Complaint
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-orange-400">
                  🟠
                </span>

                <span>
                  Medium Risk Complaint
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-400">
                  🟢
                </span>

                <span>
                  Low Risk Complaint
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>
                  🔥
                </span>

                <span>
                  AI Hotspot Zone
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>
                  🧠
                </span>

                <span>
                  ML Risk Detection
                </span>
              </div>

            </div>

          </div>

        </div>
      </main>
    </>
  );
}