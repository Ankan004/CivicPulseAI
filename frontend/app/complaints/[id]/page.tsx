"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { apiUrl } from "@/lib/api";

export default function ComplaintDetailsPage() {
  const params = useParams();

  const [complaint, setComplaint] =
    useState<any>(null);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    fetchComplaint();
  }, []);

  const fetchComplaint = async () => {
    try {
      const response = await axios.get(
        apiUrl(`/complaints/${params.id}`)
      );

      setComplaint(response.data);

    } catch (error) {
      console.error(error);
      setError(true);
    }
  };

  if (error) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">
              ❌
            </div>

            <h1 className="text-2xl font-bold mb-2">
              Complaint Not Found
            </h1>

            <p className="text-slate-400">
              This complaint could not be loaded.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!complaint) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">
              ⏳
            </div>

            <p className="text-slate-400">
              Loading complaint...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

        <div className="max-w-4xl mx-auto">

          <p className="text-cyan-400 font-semibold mb-3">
            CIVICPULSE AI
          </p>

          <h1 className="text-4xl font-bold mb-8">
            Complaint Details
          </h1>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">

            <h2 className="text-3xl font-bold mb-4">
              {complaint.title}
            </h2>

            <p className="text-slate-300 leading-8 mb-8">
              {complaint.description}
            </p>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <p className="text-slate-400">
                  Category
                </p>

                <p className="font-semibold text-lg">
                  {complaint.category}
                </p>
              </div>

              <div>
                <p className="text-slate-400">
                  Severity
                </p>

                <p className="font-semibold text-lg">
                  {complaint.severity}
                </p>
              </div>

              <div>
                <p className="text-slate-400">
                  Priority
                </p>

                <p className="font-semibold text-lg">
                  {complaint.priority}
                </p>
              </div>

              <div>
                <p className="text-slate-400">
                  Status
                </p>

                <p className="font-semibold text-lg">
                  {complaint.status}
                </p>
              </div>

              {complaint.latitude != null && (
                <div>
                  <p className="text-slate-400">
                    Latitude
                  </p>

                  <p className="font-semibold">
                    {complaint.latitude}
                  </p>
                </div>
              )}

              {complaint.longitude != null && (
                <div>
                  <p className="text-slate-400">
                    Longitude
                  </p>

                  <p className="font-semibold">
                    {complaint.longitude}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </main>
    </>
  );
}