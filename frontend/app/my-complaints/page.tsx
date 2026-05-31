"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  severity: string;
}

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/complaints/my-complaints",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComplaints(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <h1 className="text-4xl font-bold mb-8">
        My Complaints
      </h1>

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="border rounded-lg p-5 shadow"
          >
            <h2 className="text-2xl font-bold">
              {complaint.title}
            </h2>

            <p className="mt-2">
              {complaint.description}
            </p>

            <p className="mt-2">
              Category: {complaint.category}
            </p>

            <p className="mt-2">
              Status: {complaint.status}
            </p>

            <p className="mt-2">
              Severity: {complaint.severity}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}