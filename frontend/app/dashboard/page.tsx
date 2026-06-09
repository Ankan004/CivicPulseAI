"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

export default function Dashboard() {

const router = useRouter();

const [stats, setStats] = useState({
total_complaints: 0,
pending: 0,
in_progress: 0,
resolved: 0,
});

useEffect(() => {


const token =
  localStorage.getItem("token");

if (!token) {

  router.push("/login");

  return;
}

fetchStats();


}, []);

const fetchStats = async () => {


try {

  const response =
    await axios.get(
      "https://civicpulseai-production.up.railway.app/dashboard/stats"
    );

  setStats(response.data);

} catch (error) {

  console.error(
    "Error fetching dashboard stats:",
    error
  );

}


};

return (
<>


  <Navbar />

  <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

    <div className="max-w-7xl mx-auto">

      <h1 className="text-5xl font-bold mb-3">
        Welcome Back 👋
      </h1>

      <p className="text-slate-400 mb-10">
        Monitor complaints, analyze risks,
        and manage city intelligence from one place.
      </p>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

          <h2 className="text-lg text-slate-300">
            Total Complaints
          </h2>

          <p className="text-5xl font-bold text-blue-400 mt-4">
            {stats.total_complaints}
          </p>

        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

          <h2 className="text-lg text-slate-300">
            Pending
          </h2>

          <p className="text-5xl font-bold text-yellow-400 mt-4">
            {stats.pending}
          </p>

        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

          <h2 className="text-lg text-slate-300">
            In Progress
          </h2>

          <p className="text-5xl font-bold text-orange-400 mt-4">
            {stats.in_progress}
          </p>

        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

          <h2 className="text-lg text-slate-300">
            Resolved
          </h2>

          <p className="text-5xl font-bold text-green-400 mt-4">
            {stats.resolved}
          </p>

        </div>

      </div>

      {/* Quick Actions */}

      <div className="mt-12">

        <h2 className="text-3xl font-bold mb-6">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <button
            onClick={() =>
              router.push("/create-complaint")
            }
            className="bg-blue-600 hover:bg-blue-700 transition-all rounded-2xl p-5 font-semibold"
          >
            ➕ Report Issue
          </button>

          <button
            onClick={() =>
              router.push("/map")
            }
            className="bg-cyan-600 hover:bg-cyan-700 transition-all rounded-2xl p-5 font-semibold"
          >
            🗺 Complaint Map
          </button>

          <button
            onClick={() =>
              router.push("/risk-map")
            }
            className="bg-orange-600 hover:bg-orange-700 transition-all rounded-2xl p-5 font-semibold"
          >
            ⚠ Risk Map
          </button>

          <button
            onClick={() =>
              router.push("/disaster-center")
            }
            className="bg-green-600 hover:bg-green-700 transition-all rounded-2xl p-5 font-semibold"
          >
            🌦 Disaster Center
          </button>

        </div>

      </div>

      {/* Platform Overview */}

      <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">

        <h2 className="text-3xl font-bold mb-4">
          🏛 CivicPulse Intelligence Hub
        </h2>

        <p className="text-slate-300 leading-8">

          CivicPulse combines complaint
          management, disaster intelligence,
          hotspot mapping, and AI-powered
          analytics into a unified platform.

          Monitor civic issues, predict risks,
          and improve community services through
          data-driven decision making.

        </p>

      </div>

    </div>

  </main>

</>


);
}
