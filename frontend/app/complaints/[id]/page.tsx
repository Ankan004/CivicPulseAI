"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";

export default function ComplaintDetailsPage() {

  const params = useParams();

  const [complaint, setComplaint] =
    useState<any>(null);

  useEffect(() => {

    fetchComplaint();

  }, []);

  const fetchComplaint =
    async () => {

    try {

      const response =
        await axios.get(
          `http://127.0.0.1:8000/complaints/${params.id}`
        );

      setComplaint(
        response.data
      );

    } catch (error) {

      console.error(error);
    }
  };

  if (!complaint) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-black p-10">

        <h1 className="text-4xl font-bold mb-8">
          Complaint Details
        </h1>

        <div className="border rounded-lg p-6 shadow">

          <h2 className="text-3xl font-bold">
            {complaint.title}
          </h2>

          <p className="mt-4">
            {complaint.description}
          </p>

          <div className="mt-6 space-y-2">

            <p>
              <strong>
                Category:
              </strong>{" "}
              {complaint.category}
            </p>

            <p>
              <strong>
                Severity:
              </strong>{" "}
              {complaint.severity}
            </p>

            <p>
              <strong>
                Priority:
              </strong>{" "}
              {complaint.priority}
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}
              {complaint.status}
            </p>

            <p>
              <strong>
                Latitude:
              </strong>{" "}
              {complaint.latitude}
            </p>

            <p>
              <strong>
                Longitude:
              </strong>{" "}
              {complaint.longitude}
            </p>

          </div>

        </div>

      </main>
    </>
  );
}