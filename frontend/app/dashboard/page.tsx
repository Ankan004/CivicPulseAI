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
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  fetchStats();
}, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/dashboard/stats"
      );

      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-black p-10">
        <h1 className="text-4xl font-bold mb-8">
          CivicPulse Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border rounded-lg p-6 shadow-lg bg-blue-50">
            <h2 className="text-xl font-bold">
              Total Complaints
            </h2>

            <p className="text-4xl mt-4 font-bold">
              {stats.total_complaints}
            </p>
          </div>

          <div className="border rounded-lg p-6 shadow-lg bg-yellow-50">
            <h2 className="text-xl font-bold">
              Pending
            </h2>

            <p className="text-4xl mt-4 font-bold">
              {stats.pending}
            </p>
          </div>

          <div className="border rounded-lg p-6 shadow-lg bg-orange-50">
            <h2 className="text-xl font-bold">
              In Progress
            </h2>

            <p className="text-4xl mt-4 font-bold">
              {stats.in_progress}
            </p>
          </div>

          <div className="border rounded-lg p-6 shadow-lg bg-green-50">
            <h2 className="text-xl font-bold">
              Resolved
            </h2>

            <p className="text-4xl mt-4 font-bold">
              {stats.resolved}
            </p>
          </div>
        </div>

        <div className="mt-10 border rounded-lg p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">
            Welcome to CivicPulse AI
          </h2>

          <p>
            Monitor civic complaints, track issue resolution,
            and improve community services through AI-powered
            complaint management.
          </p>
        </div>
      </main>
    </>
  );
}