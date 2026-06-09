"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

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

export default function RiskMapPage() {

  const [data, setData] =
    useState<any[]>([]);

  const [hotspots, setHotspots] =
    useState<any[]>([]);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      const riskResponse =
        await axios.get(
          "http://127.0.0.1:8000/risk-map/"
        );

      setData(
        riskResponse.data
      );

      const hotspotResponse =
        await axios.get(
          "http://127.0.0.1:8000/hotspots/"
        );

      setHotspots(
        hotspotResponse.data
      );

    } catch (error) {

      console.error(
        "Risk Map Error:",
        error
      );

    }

  };

  

  
return (
  <>
    <Navbar />

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-28 px-10 pb-10">

      <div className="max-w-7xl mx-auto">

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

        {/* AI Summary */}

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
                {data.length}
              </h3>

            </div>

            <div>

              <p className="text-slate-400 text-sm">
                Active Hotspots
              </p>

              <h3 className="text-3xl font-bold text-red-400">
                {hotspots.length}
              </h3>

            </div>

            <div>

              <p className="text-slate-400 text-sm">
                High Risk Complaints
              </p>

              <h3 className="text-3xl font-bold text-orange-400">
                {
                  data.filter(
                    (item) =>
                      item.risk_score > 70
                  ).length
                }
              </h3>

            </div>

            <div>

              <p className="text-slate-400 text-sm">
                System Status
              </p>

              <h3 className="text-3xl font-bold text-green-400">
                ACTIVE
              </h3>

            </div>

          </div>

        </div>

        {/* Risk Cards */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">

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

            <h3 className="text-xl font-bold">
              🔴 High Risk
            </h3>

            <p className="mt-3 text-slate-300">
              Critical locations requiring
              immediate civic intervention.
            </p>

          </div>

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

            <h3 className="text-xl font-bold">
              🟠 Medium Risk
            </h3>

            <p className="mt-3 text-slate-300">
              Locations needing monitoring
              and preventive actions.
            </p>

          </div>

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

            <h3 className="text-xl font-bold">
              🟢 Low Risk
            </h3>

            <p className="mt-3 text-slate-300">
              Stable zones with minimal
              civic concerns.
            </p>

          </div>

        </div>

        {/* Map Container */}

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
              attribution="OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data
  .filter(
    (item) => item.risk_score > 70
  )
  .map((item) => (

    <CircleMarker
      key={item.id}
      center={[
        item.latitude,
        item.longitude,
      ]}
      radius={10}
      pathOptions={{
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.9,
      }}
    >

      <Popup>

        <div className="w-72">

          <h3 className="font-bold text-red-600 text-lg mb-3">
            🚨 High Risk Complaint
          </h3>

          <p>
            <strong>Title:</strong>
            {" "}
            {item.title}
          </p>

          <p>
            <strong>Risk Score:</strong>
            {" "}
            {item.risk_score}
          </p>

          <p>
            <strong>Category:</strong>
            {" "}
            {item.category}
          </p>

          <p>
            <strong>Severity:</strong>
            {" "}
            {item.severity}
          </p>

        </div>

      </Popup>

    </CircleMarker>

  ))
}

            {hotspots.map(
  (hotspot, index) => {

    let hotspotColor = "green";

    if (
      hotspot.cluster_size >= 5
    ) {

      hotspotColor = "red";

    } else if (
      hotspot.cluster_size >= 3
    ) {

      hotspotColor = "orange";

    }

    return (

      <Circle
        key={`hotspot-${index}`}
        center={[
          hotspot.latitude,
          hotspot.longitude,
        ]}
        radius={
          Math.max(
            200,
            hotspot.cluster_size * 100
          )
        }
        pathOptions={{
          color: hotspotColor,
          fillColor: hotspotColor,
          fillOpacity: 0.15,
        }}
      >

        <Popup>

          <div className="w-72">

            <div className="border-b pb-2 mb-3">

              <h3 className="font-bold text-lg text-red-600">
                🔥 AI Hotspot
              </h3>

            </div>

            <div className="space-y-2">

              <div className="flex justify-between">

                <span>
                  📊 Cluster
                </span>

                <span className="font-bold">
                  {hotspot.cluster}
                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  🚨 Complaints
                </span>

                <span className="font-bold">
                  {hotspot.cluster_size}
                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  📍 Category
                </span>

                <span className="font-bold">
                  {hotspot.category}
                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  ⚠ Risk Level
                </span>

                <span className="font-bold">

                  {
                    hotspot.cluster_size >= 5
                      ? "High"
                      : hotspot.cluster_size >= 3
                      ? "Medium"
                      : "Low"
                  }

                </span>

              </div>

            </div>

            <div className="mt-4">

              <div className="h-2 bg-gray-200 rounded-full">

                <div
                  className={`
                    h-2 rounded-full
                    ${
                      hotspot.cluster_size >= 5
                        ? "bg-red-500"
                        : hotspot.cluster_size >= 3
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }
                  `}
                  style={{
                    width: `${Math.min(
                      hotspot.cluster_size * 20,
                      100
                    )}%`,
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

        <div
          className="
          mt-8
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          rounded-2xl
          p-6
          flex
          gap-8
          text-lg
          "
        >

          <div>
  🔴 High Risk Complaint
</div>

<div>
  🟠 Medium Risk Complaint
</div>

<div>
  🟢 Low Risk Complaint
</div>

<div>
  🔥 AI Hotspot Zone
</div>

<div>
  🧠 ML Risk Detection
</div>

        </div>

      </div>

    </main>
  </>
);
}
