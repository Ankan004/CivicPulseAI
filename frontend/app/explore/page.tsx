"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import { apiUrl } from "../../lib/api";

export default function Explore() {
  const router = useRouter();

  const [stats, setStats] = useState({
    total_complaints: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        apiUrl("/dashboard/stats")
      );

      setStats(response.data);
    } catch (error) {
      console.error(
        "Error fetching platform stats:",
        error
      );
    }
  };

  const handleReportIssue = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "Please create an account or login to submit a complaint."
      );

      router.push("/register");
      return;
    }

    router.push("/create-complaint");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}

          <section className="mb-12">

            <p className="text-cyan-400 font-semibold mb-3">
              CIVICPULSE AI
            </p>

            <h1 className="text-5xl md:text-6xl font-bold mb-5">
              Explore CivicPulse
            </h1>

            <p className="text-slate-300 text-lg max-w-3xl leading-8">
              Explore civic complaints, city risks,
              hotspots, analytics, and disaster
              intelligence — without needing to log in.
            </p>

          </section>


          {/* Live Statistics */}

          <section className="mb-12">

            <h2 className="text-3xl font-bold mb-6">
              Civic Intelligence
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-slate-300">
                  Total Complaints
                </h3>

                <p className="text-5xl font-bold text-blue-400 mt-4">
                  {stats.total_complaints}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-slate-300">
                  Pending
                </h3>

                <p className="text-5xl font-bold text-yellow-400 mt-4">
                  {stats.pending}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-slate-300">
                  In Progress
                </h3>

                <p className="text-5xl font-bold text-orange-400 mt-4">
                  {stats.in_progress}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-slate-300">
                  Resolved
                </h3>

                <p className="text-5xl font-bold text-green-400 mt-4">
                  {stats.resolved}
                </p>
              </div>

            </div>

          </section>


          {/* Explore Features */}

          <section className="mb-12">

            <h2 className="text-3xl font-bold mb-6">
              Explore Platform
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              <button
                onClick={() => router.push("/map")}
                className="text-left bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition"
              >
                <div className="text-4xl mb-4">
                  🗺
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Complaint Map
                </h3>

                <p className="text-slate-400">
                  Explore reported civic issues
                  across different locations.
                </p>
              </button>


              <button
                onClick={() => router.push("/risk-map")}
                className="text-left bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition"
              >
                <div className="text-4xl mb-4">
                  ⚠️
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Risk Map
                </h3>

                <p className="text-slate-400">
                  Identify areas with higher
                  civic risk levels.
                </p>
              </button>


              <button
                onClick={() => router.push("/analytics")}
                className="text-left bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition"
              >
                <div className="text-4xl mb-4">
                  📊
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Analytics
                </h3>

                <p className="text-slate-400">
                  Analyze complaint trends and
                  civic intelligence.
                </p>
              </button>


              <button
                onClick={() =>
                  router.push("/disaster-center")
                }
                className="text-left bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition"
              >
                <div className="text-4xl mb-4">
                  🌦
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Disaster Center
                </h3>

                <p className="text-slate-400">
                  Explore weather and disaster
                  risk information.
                </p>
              </button>


              <button
                onClick={() =>
                  router.push("/assistant")
                }
                className="text-left bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition"
              >
                <div className="text-4xl mb-4">
                  🤖
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  AI Assistant
                </h3>

                <p className="text-slate-400">
                  Ask questions about civic
                  issues and platform intelligence.
                </p>
              </button>


              <button
                onClick={() =>
                  router.push("/complaints/1")
                }
                className="text-left bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition"
              >
                <div className="text-4xl mb-4">
                  📋
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Complaints
                </h3>

                <p className="text-slate-400">
                  Browse individual public
                  complaint information.
                </p>
              </button>

            </div>

          </section>


          {/* Report Issue */}

          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">

            <h2 className="text-3xl font-bold mb-4">
              Have a civic issue?
            </h2>

            <p className="text-slate-300 mb-6">
              Create a free account to report an
              issue and track your complaints.
            </p>

            <button
              onClick={handleReportIssue}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
            >
              ➕ Report an Issue
            </button>

          </section>

        </div>
      </main>
    </>
  );
}