"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

interface Complaint {
id: number;
title: string;
description: string;
category: string;
status: string;
severity: string;
}

export default function MyComplaintsPage() {

const router = useRouter();

const [complaints, setComplaints] = useState<
Complaint[]

> ([]);

useEffect(() => {


const token =
  localStorage.getItem("token");

if (!token) {

  router.push("/login");

  return;
}

fetchComplaints();


}, []);

const fetchComplaints = async () => {


try {

  const token =
    localStorage.getItem("token");

  const response =
    await axios.get(
      "http://127.0.0.1:8000/complaints/my-complaints",
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  setComplaints(response.data);

} catch (error) {

  console.error(error);

}


};

const getStatusColor = (
status: string
) => {


switch (
  status?.toLowerCase()
) {

  case "resolved":
    return "bg-green-500";

  case "in progress":
    return "bg-orange-500";

  default:
    return "bg-yellow-500";
}


};

return (
<>


  <Navbar />

  <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

    <div className="max-w-6xl mx-auto">

      <h1 className="text-5xl font-bold mb-3">
        📋 My Complaints
      </h1>

      <p className="text-slate-400 mb-10">
        Track all your submitted
        complaints and monitor
        their progress.
      </p>

      {complaints.length === 0 ? (

        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">

          <h2 className="text-3xl mb-4">
            📭
          </h2>

          <p className="text-slate-400">
            No complaints submitted yet.
          </p>

        </div>

      ) : (

        <div className="grid gap-6">

          {complaints.map(
            (complaint) => (

              <div
                key={complaint.id}
                className="
                  bg-white/5
                  backdrop-blur-xl
                  border
                  border-white/10
                  rounded-2xl
                  p-6
                  shadow-xl
                "
              >

                <div className="flex justify-between items-start mb-4">

                  <h2 className="text-2xl font-bold">
                    {complaint.title}
                  </h2>

                  <span
                    className={`
                      ${getStatusColor(
                        complaint.status
                      )}
                      px-4
                      py-1
                      rounded-full
                      text-sm
                      font-semibold
                      text-white
                    `}
                  >
                    {complaint.status}
                  </span>

                </div>

                <p className="text-slate-300 mb-4">
                  {complaint.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4">

                  <div>

                    <p className="text-slate-400">
                      Category
                    </p>

                    <p className="font-semibold">
                      {complaint.category}
                    </p>

                  </div>

                  <div>

                    <p className="text-slate-400">
                      Severity
                    </p>

                    <p className="font-semibold">
                      {complaint.severity}
                    </p>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  </main>

</>


);
}
