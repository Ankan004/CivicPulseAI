"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  severity: string;
}

export default function AdminPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState(""); 

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/complaints/"
      );

      setComplaints(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (
    complaintId: number,
    status: string
  ) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://127.0.0.1:8000/complaints/${complaintId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchComplaints();
    } catch (error) {
      console.error(error);
      alert("Status update failed");
    }
  };
  const filteredComplaints = complaints.filter((complaint) => {
  const matchesFilter =
    filter === "all" || complaint.status === filter;

  const matchesSearch =
    complaint.title
      .toLowerCase()
      .includes(search.toLowerCase());

  return matchesFilter && matchesSearch;
});

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-black p-10">
        <h1 className="text-4xl font-bold mb-8">
          Admin Panel
        </h1>
        <div className="flex gap-4 mb-6">
  <input
    type="text"
    placeholder="Search complaints..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border p-2 rounded w-64"
  />

  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="all">All</option>
    <option value="pending">Pending</option>
    <option value="in_progress">
      In Progress
    </option>
    <option value="resolved">
      Resolved
    </option>
  </select>
</div>

        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="border rounded-lg p-5 shadow"
            >
              <h2 className="text-2xl font-bold">
                {complaint.title}
              </h2>

              <p>{complaint.description}</p>

              <p>
                Category: {complaint.category}
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
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}