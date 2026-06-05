"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function HotspotsPage() {
  const [data, setData] =
    useState<any>(null);

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    const response =
      await axios.get(
        "http://127.0.0.1:8000/analytics/hotspots"
      );

    setData(response.data);
  };

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Navbar />

      <main className="p-10">
        <h1 className="text-4xl font-bold mb-6">
          🗺️ AI Hotspot Analysis
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          <Card
            title="Total Complaints"
            value={data.total_complaints}
          />

          <Card
            title="Most Problematic Category"
            value={data.top_category}
          />

          <Card
            title="🔴 High Severity"
            value={data.high_severity}
          />

          <Card
            title="🟡 Medium Severity"
            value={data.medium_severity}
          />

          <Card
            title="🟢 Low Severity"
            value={data.low_severity}
          />
        </div>
      </main>
    </>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="border rounded p-6">
      <h2 className="font-bold">
        {title}
      </h2>

      <p className="text-3xl mt-3">
        {value}
      </p>
    </div>
  );
}