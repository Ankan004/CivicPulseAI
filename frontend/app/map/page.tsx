
"use client";

import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

const ComplaintMap = dynamic(
  () => import("../../components/ComplaintMap"),
  {
    ssr: false,
  }
);

export default function MapPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-28 px-10 pb-10">

        <div className="max-w-7xl mx-auto">

          <div className="mb-10">

            <h1 className="text-5xl font-bold mb-3">
              🗺 Complaint Intelligence Map
            </h1>

            <p className="text-slate-400">
              Visualize civic complaints across the city,
              identify hotspots and monitor issue density.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div
              className="
              bg-white/5
              backdrop-blur-xl
              border border-white/10
              rounded-2xl
              p-6
              shadow-xl
              "
            >
              <h3 className="text-slate-400">
                📍 Live Complaint Tracking
              </h3>

              <p className="mt-3 text-sm text-slate-300">
                Monitor complaints reported by citizens.
              </p>
            </div>

            <div
              className="
              bg-white/5
              backdrop-blur-xl
              border border-white/10
              rounded-2xl
              p-6
              shadow-xl
              "
            >
              <h3 className="text-slate-400">
                🔥 Hotspot Detection
              </h3>

              <p className="mt-3 text-sm text-slate-300">
                Identify areas with repeated civic issues.
              </p>
            </div>

            <div
              className="
              bg-white/5
              backdrop-blur-xl
              border border-white/10
              rounded-2xl
              p-6
              shadow-xl
              "
            >
              <h3 className="text-slate-400">
                🤖 AI Monitoring
              </h3>

              <p className="mt-3 text-sm text-slate-300">
                Support smart city decision making.
              </p>
            </div>

          </div>

          <div
            className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-3xl
            p-4
            shadow-2xl
            "
          >

            <ComplaintMap />

          </div>

        </div>

      </main>
    </>
  );
}

