"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#9333ea",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        apiUrl("/analytics/summary")
      );

      setData(response.data);
    } catch (error) {
      console.error(error);
      setError(true);
    }
  };

  if (error) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">
          <div className="max-w-7xl mx-auto">

            <h1 className="text-4xl font-bold mb-4">
              📊 Civic Analytics Dashboard
            </h1>

            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
              <p className="text-red-300">
                Unable to load analytics data.
              </p>
            </div>

          </div>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">
          <div className="max-w-7xl mx-auto">

            <h1 className="text-4xl font-bold mb-8">
              📊 Civic Analytics Dashboard
            </h1>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <p className="text-slate-400">
                Loading analytics...
              </p>
            </div>

          </div>
        </main>
      </>
    );
  }

  const categoryData =
    Object.entries(data.categories || {}).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

        <div className="max-w-7xl mx-auto">

          {/* Header */}

          <div className="mb-10">

            <h1 className="text-5xl font-bold mb-3">
              📊 Civic Analytics Dashboard
            </h1>

            <p className="text-slate-400">
              Monitor complaint trends, priorities,
              and civic issue distribution.
            </p>

          </div>

          {/* Stats Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            <Card
              title="Total Complaints"
              value={data.total}
              accent="blue"
            />

            <Card
              title="Pending"
              value={data.pending}
              accent="yellow"
            />

            <Card
              title="Resolved"
              value={data.resolved}
              accent="green"
            />

            <Card
              title="High Priority"
              value={data.high_priority}
              accent="red"
            />

          </div>

          {/* Charts */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Pie Chart */}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

              <h2 className="text-2xl font-bold mb-6">
                🥧 Category Distribution
              </h2>

              <div className="w-full h-[350px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="name"
                      outerRadius={120}
                      label
                    >

                      {categoryData.map(
                        (entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "12px",
                        color: "#ffffff",
                      }}
                    />

                  </PieChart>
                </ResponsiveContainer>

              </div>

            </div>

            {/* Bar Chart */}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

              <h2 className="text-2xl font-bold mb-6">
                📈 Complaint Categories
              </h2>

              <div className="w-full h-[350px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={categoryData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                    />

                    <YAxis
                      stroke="#94a3b8"
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "12px",
                        color: "#ffffff",
                      }}
                    />

                    <Bar
                      dataKey="count"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>

            </div>

          </div>

        </div>

      </main>
    </>
  );
}

function Card({
  title,
  value,
  accent,
}: {
  title: string;
  value: number;
  accent: "blue" | "yellow" | "green" | "red";
}) {
  const accentClasses = {
    blue: "text-blue-400",
    yellow: "text-yellow-400",
    green: "text-green-400",
    red: "text-red-400",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

      <h3 className="text-slate-300 mb-3">
        {title}
      </h3>

      <p
        className={`text-5xl font-bold ${accentClasses[accent]}`}
      >
        {value}
      </p>

    </div>
  );
}