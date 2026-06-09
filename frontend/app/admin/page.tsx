"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { useRouter }
from "next/navigation";

import {
  getUserRole
}
from "../../lib/auth";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminPage() {
  const router = useRouter();

const [complaints, setComplaints] =
useState<any[]>([]);
const [hotspot, setHotspot] =
  useState("Loading...");
  const [recommendation, setRecommendation] =
  useState("Loading...");
useEffect(() => {

  const role = getUserRole();

  if (role !== "admin") {

    router.push("/dashboard");
    return;

  }

  fetchComplaints();
  fetchHotspot();
  fetchRecommendation();

}, []);
const fetchRecommendation =
  async () => {

  try {

    const response =
      await axios.post(
        "http://127.0.0.1:8000/assistant/ask",
        {
          question:
            "What should be fixed first?"
        }
      );

    setRecommendation(
      response.data.answer
    );

  } catch (error) {

    console.error(error);

    setRecommendation(
      "Unable to load recommendation"
    );
  }
};

const fetchComplaints = async () => {


try {

  const response =
    await axios.get(
      "http://127.0.0.1:8000/complaints/"
    );

  setComplaints(
    response.data
  );
  const hotspotScores: any = {};

response.data.forEach(
  (complaint: any) => {

    if (
  complaint.latitude == null ||
  complaint.longitude == null
) {
      return;
    }

    const key =
      `${complaint.latitude},
      ${complaint.longitude}`;

    let score = 1;

    if (
      complaint.priority &&
      complaint.priority.toLowerCase()
      === "high"
    ) {
      score = 3;
    }

    hotspotScores[key] =
      (hotspotScores[key] || 0)
      + score;
  }
);

let bestLocation =
  "No hotspot detected";

let highestScore = 0;

Object.entries(
  hotspotScores
).forEach(
  ([location, score]: any) => {

    if (
      score > highestScore
    ) {

      highestScore = score;

      bestLocation =
        location;
    }
  }
);

console.log("Hotspot Scores:", hotspotScores);

setHotspot(
  `${bestLocation} (Risk Score: ${highestScore})`
);

} catch (error) {

  console.error(error);

}


};

const highPriority =
complaints.filter(
(c) =>
c.priority &&
c.priority.toLowerCase() === "high"
).length;

const pending =
complaints.filter(
(c) =>
c.status === "pending"
).length;

const resolved =
complaints.filter(
(c) =>
c.status === "resolved"
).length;
const updateStatus = async (
  complaintId: number,
  status: string
) => {

  try {

    const token =
      localStorage.getItem(
        "token"
      );

    await axios.patch(
      `http://127.0.0.1:8000/complaints/${complaintId}/status`,
      {
        status,
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    fetchComplaints();

  } catch (error) {

    console.error(error);

    alert(
      "Status update failed"
    );
  }
};
const exportCSV = () => {

  window.open(
    "http://127.0.0.1:8000/complaints/export/csv",
    "_blank"
  );

};
const fetchHotspot = async () => {

  try {

    const response =
      await axios.post(
        "http://127.0.0.1:8000/assistant/ask",
        {
          question:
            "What is the highest risk hotspot?"
        }
      );

    setHotspot(
      response.data.answer
    );

  } catch (error) {

    console.error(error);

    setHotspot(
      "Unable to load hotspot"
    );
  }
};
const categoryData = [

  {
    name: "Road",
    value: complaints.filter(
      (c) =>
        c.category?.toLowerCase() === "road"
    ).length,
  },

  {
    name: "Water",
    value: complaints.filter(
      (c) =>
        c.category?.toLowerCase() === "water"
    ).length,
  },

  {
    name: "Electricity",
    value: complaints.filter(
      (c) =>
        c.category?.toLowerCase() === "electricity"
    ).length,
  },

  {
    name: "Waste",
    value: complaints.filter(
      (c) =>
        c.category?.toLowerCase() === "waste"
    ).length,
  },

];
const statusData = [

  {
    name: "Pending",
    value: complaints.filter(
      (c) =>
        c.status === "pending"
    ).length,
  },

  {
    name: "In Progress",
    value: complaints.filter(
      (c) =>
        c.status === "in_progress"
    ).length,
  },

  {
    name: "Resolved",
    value: complaints.filter(
      (c) =>
        c.status === "resolved"
    ).length,
  },

]; 
const severityData = [

  {
    name: "High",
    value: complaints.filter(
      (c) =>
        c.severity?.toLowerCase() === "high"
    ).length,
  },

  {
    name: "Medium",
    value: complaints.filter(
      (c) =>
        c.severity?.toLowerCase() === "medium"
    ).length,
  },

  {
    name: "Low",
    value: complaints.filter(
      (c) =>
        c.severity?.toLowerCase() === "low"
    ).length,
  },

];

return (
<> <Navbar />

```
  <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

    <div className="mb-10">

  <h1 className="text-5xl font-bold mb-3">
    🧠 CivicPulse Admin Center
  </h1>

  <p className="text-slate-400">
    Monitor complaints, risk hotspots,
    AI insights and city operations.
  </p>

</div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
">
        <h2 className="font-bold">
          📊 Total Complaints
        </h2>

        <p className="text-3xl font-bold">
          {complaints.length}
        </p>
      </div>

      <div className="bg-red-500/20 border border-red-500/30 p-5 rounded-lg shadow">
        <h2 className="font-bold">
          🚨 High Priority
        </h2>

        <p className="text-3xl font-bold">
          {highPriority}
        </p>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-500/30 p-5 rounded-lg shadow">
        <h2 className="font-bold">
          ⏳ Pending
        </h2>

        <p className="text-3xl font-bold">
          {pending}
        </p>
      </div>

      <div className="bg-green-500/20 border border-green-500/30 p-5 rounded-lg shadow">
        <h2 className="font-bold">
          ✅ Resolved
        </h2>

        <p className="text-3xl font-bold">
          {resolved}
        </p>
      </div>

    </div>

    <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
mb-8
">

      <h2 className="font-bold text-xl">
        📍 AI Hotspot
      </h2>

      <p className="font-bold">
        {hotspot}
      </p>

    </div>

    <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
mb-8
">

      <h2 className="font-bold text-xl">
        🧠 AI Recommendation
      </h2>

      <p className="text-slate-300 leading-8 whitespace-pre-wrap">
  {recommendation}
</p>

    </div>
   {/* Complaints by Category */}

<div
  className="
  bg-white/5
  backdrop-blur-xl
  border border-white/10
  rounded-2xl
  p-6
  shadow-xl
  mb-8
"
>

  <h2 className="text-2xl font-bold mb-4">
    📈 Complaints by Category
  </h2>

  <div
    style={{
      width: "100%",
      height: 300,
    }}
  >

    <ResponsiveContainer>

      <PieChart>

        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >

          <Cell fill="#3B82F6" />
          <Cell fill="#10B981" />
          <Cell fill="#F59E0B" />
          <Cell fill="#EF4444" />

        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

    </ResponsiveContainer>

  </div>

</div>

{/* Complaint Status Distribution */}

<div
  className="
  bg-white/5
  backdrop-blur-xl
  border border-white/10
  rounded-2xl
  p-6
  shadow-xl
  mb-8
"
>

  <h2 className="text-2xl font-bold mb-4">
    📈 Complaint Status Distribution
  </h2>

  <div
    style={{
      width: "100%",
      height: 300,
    }}
  >

    <ResponsiveContainer>

      <PieChart>

        <Pie
          data={statusData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >

          <Cell fill="#FACC15" />
          <Cell fill="#3B82F6" />
          <Cell fill="#10B981" />

        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

    </ResponsiveContainer>

  </div>

</div>

{/* Severity Distribution */}

<div
  className="
  bg-white/5
  backdrop-blur-xl
  border border-white/10
  rounded-2xl
  p-6
  shadow-xl
  mb-8
"
>

  <h2 className="text-2xl font-bold mb-4">
    📈 Severity Distribution
  </h2>

  <div
    style={{
      width: "100%",
      height: 300,
    }}
  >

    <ResponsiveContainer>

      <PieChart>

        <Pie
          data={severityData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >

          <Cell fill="#EF4444" />
          <Cell fill="#F59E0B" />
          <Cell fill="#10B981" />

        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

    </ResponsiveContainer>

  </div>

</div>
    
  






    <h2 className="text-2xl font-bold mb-4">
      📋 Complaints
    </h2>
    <button
  onClick={exportCSV}
  className="
bg-blue-600
hover:bg-blue-700
transition-all
px-5
py-3
rounded-xl
font-semibold
mb-6
"
>
  📥 Export Complaints CSV
</button>

    <div className="space-y-4">

      {complaints.map((complaint) => (

  <div
    key={complaint.id}
    className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
"
  >

    <h2 className="text-2xl font-bold">
      {complaint.title}
    </h2>

    <p>{complaint.description}</p>

    <p>
      Category: {complaint.category}
    </p>

    <p>
      Severity: {complaint.severity}
    </p>

    <p className="mt-2">
      Status:

      <span
        className={`ml-2 px-2 py-1 rounded text-white ${
          complaint.status === "pending"
            ? "bg-yellow-500"
            : complaint.status === "in_progress"
            ? "bg-blue-500"
            : "bg-green-500"
        }`}
      >
        {complaint.status}
      </span>
    </p>

    <div className="flex gap-2 mt-4">

  <button
    onClick={() =>
      updateStatus(
        complaint.id,
        "pending"
      )
    }
    className="bg-yellow-500 text-white px-3 py-1 rounded"
  >
    Pending
  </button>

  <button
    onClick={() =>
      updateStatus(
        complaint.id,
        "in_progress"
      )
    }
    className="bg-blue-500 text-white px-3 py-1 rounded"
  >
    In Progress
  </button>

  <button
    onClick={() =>
      updateStatus(
        complaint.id,
        "resolved"
      )
    }
    className="bg-green-500 text-white px-3 py-1 rounded"
  >
    Resolved
  </button>

  <Link
    href={`/complaints/${complaint.id}`}
    className="bg-black text-white px-3 py-1 rounded"
  >
    View Details
  </Link>

</div>

  </div>

))}

    </div>

  </main>
</>


);
}
