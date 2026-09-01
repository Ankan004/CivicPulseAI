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

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#9333ea",
];

export default function AnalyticsPage() {
  const [data, setData] =
    useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics =
    async () => {
      try {
        const response =
          await axios.get(
            "http://127.0.0.1:8000/analytics/summary"
          );

        setData(
          response.data
        );
      } catch (error) {
        console.error(error);
      }
    };

  if (!data) {
    return (
      <p className="p-10">
        Loading...
      </p>
    );
  }

  const categoryData =
    Object.entries(
      data.categories
    ).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">
        📊 Civic Analytics Dashboard
      </h1>

      {/* Stats Cards */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Card
          title="Total Complaints"
          value={data.total}
        />

        <Card
          title="Pending"
          value={data.pending}
        />

        <Card
          title="Resolved"
          value={data.resolved}
        />

        <Card
          title="High Priority"
          value={
            data.high_priority
          }
        />
      </div>

      {/* Charts */}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pie Chart */}

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">
            🥧 Category Distribution
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
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
                  (
                    entry,
                    index
                  ) => (
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

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">
            📈 Complaint Categories
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <BarChart
              data={
                categoryData
              }
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#2563eb"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="text-gray-500 mb-2">
        {title}
      </h3>

      <p className="text-4xl font-bold">
        {value}
      </p>
    </div>
  );
}