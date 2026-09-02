"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getUserRole,
  isAuthenticated,
} from "../../lib/auth";

import { apiUrl } from "@/lib/api";

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

  const [authorized, setAuthorized] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [complaints, setComplaints] =
    useState<any[]>([]);

  const [hotspot, setHotspot] =
    useState("Loading...");

  const [recommendation, setRecommendation] =
    useState("Loading...");

  const [exporting, setExporting] =
    useState(false);


  // ==========================================================
  // ADMIN AUTHORIZATION CHECK
  // ==========================================================

  useEffect(() => {

    const checkAccess = () => {

      if (!isAuthenticated()) {

        router.replace("/login");

        return;
      }

      const role = getUserRole();

      if (role !== "admin") {

        router.replace("/dashboard");

        return;
      }

      setAuthorized(true);
      setCheckingAuth(false);

    };

    checkAccess();

  }, [router]);


  // ==========================================================
  // LOAD ADMIN DATA
  // ==========================================================

  useEffect(() => {

    if (!authorized) {
      return;
    }

    fetchComplaints();
    fetchHotspot();
    fetchRecommendation();

  }, [authorized]);


  // ==========================================================
  // FETCH AI RECOMMENDATION
  // ==========================================================

  const fetchRecommendation =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        if (!token) {

          router.replace("/login");

          return;
        }

        const response =
          await axios.post(
            apiUrl("/assistant/ask"),
            {
              question:
                "What should be fixed first?",
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setRecommendation(
          response.data.answer
        );

      } catch (error) {

        console.error(
          "Recommendation error:",
          error
        );

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          router.replace("/login");

          return;
        }

        setRecommendation(
          "Unable to load recommendation"
        );
      }
    };


  // ==========================================================
  // FETCH COMPLAINTS
  // ==========================================================

  const fetchComplaints =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        if (!token) {

          router.replace("/login");

          return;
        }

        const response =
          await axios.get(
            apiUrl("/complaints/"),
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setComplaints(
          response.data
        );


        // ====================================================
        // HOTSPOT CALCULATION
        // ====================================================

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
              `${complaint.latitude},${complaint.longitude}`;

            let score = 1;


            if (
              complaint.priority &&
              complaint.priority.toLowerCase() ===
                "high"
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


        console.log(
          "Hotspot Scores:",
          hotspotScores
        );


        setHotspot(
          `${bestLocation} (Risk Score: ${highestScore})`
        );


      } catch (error) {

        console.error(
          "Complaint fetch error:",
          error
        );


        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          router.replace("/login");

          return;
        }

      }

    };


  // ==========================================================
  // FETCH AI HOTSPOT
  // ==========================================================

  const fetchHotspot =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        if (!token) {

          router.replace("/login");

          return;
        }

        const response =
          await axios.post(
            apiUrl("/assistant/ask"),
            {
              question:
                "What is the highest risk hotspot?",
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setHotspot(
          response.data.answer
        );

      } catch (error) {

        console.error(
          "Hotspot error:",
          error
        );


        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          router.replace("/login");

          return;
        }


        setHotspot(
          "Unable to load hotspot"
        );

      }

    };


  // ==========================================================
  // UPDATE COMPLAINT STATUS
  // ==========================================================

  const updateStatus =
    async (
      complaintId: number,
      status: string
    ) => {

      try {

        const token =
          localStorage.getItem("token");


        if (!token) {

          router.replace("/login");

          return;
        }


        await axios.patch(
          apiUrl(
            `/complaints/${complaintId}/status`
          ),
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


        await fetchComplaints();


      } catch (error) {

        console.error(
          "Status update error:",
          error
        );


        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          router.replace("/login");

          return;
        }


        if (
          axios.isAxiosError(error) &&
          error.response?.status === 403
        ) {

          alert(
            "You are not authorized to update complaint status."
          );

          return;
        }


        alert(
          "Status update failed"
        );

      }

    };


  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  const exportCSV =
    async () => {

      const token =
        localStorage.getItem("token");


      if (!token) {

        router.replace("/login");

        return;
      }


      try {

        setExporting(true);


        const response =
          await axios.get(
            apiUrl(
              "/complaints/export/csv"
            ),
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              responseType: "blob",
            }
          );


        const blob =
          new Blob(
            [response.data],
            {
              type: "text/csv",
            }
          );


        const url =
          window.URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            "a"
          );


        link.href = url;

        link.download =
          "complaints.csv";


        document.body.appendChild(
          link
        );

        link.click();

        link.remove();


        window.URL.revokeObjectURL(
          url
        );


      } catch (error) {

        console.error(
          "CSV export error:",
          error
        );


        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          router.replace("/login");

          return;
        }


        if (
          axios.isAxiosError(error) &&
          error.response?.status === 403
        ) {

          alert(
            "You are not authorized to export complaints."
          );

          return;
        }


        alert(
          "CSV export failed."
        );


      } finally {

        setExporting(false);

      }

    };


  // ==========================================================
  // STATISTICS
  // ==========================================================

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


  // ==========================================================
  // CATEGORY DATA
  // ==========================================================

  const categoryData = [

    {
      name: "Road",

      value: complaints.filter(
        (c) =>
          c.category?.toLowerCase() ===
          "road"
      ).length,
    },

    {
      name: "Water",

      value: complaints.filter(
        (c) =>
          c.category?.toLowerCase() ===
          "water"
      ).length,
    },

    {
      name: "Electricity",

      value: complaints.filter(
        (c) =>
          c.category?.toLowerCase() ===
          "electricity"
      ).length,
    },

    {
      name: "Waste",

      value: complaints.filter(
        (c) =>
          c.category?.toLowerCase() ===
          "waste"
      ).length,
    },

  ];


  // ==========================================================
  // STATUS DATA
  // ==========================================================

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


  // ==========================================================
  // SEVERITY DATA
  // ==========================================================

  const severityData = [

    {
      name: "High",

      value: complaints.filter(
        (c) =>
          c.severity?.toLowerCase() ===
          "high"
      ).length,
    },

    {
      name: "Medium",

      value: complaints.filter(
        (c) =>
          c.severity?.toLowerCase() ===
          "medium"
      ).length,
    },

    {
      name: "Low",

      value: complaints.filter(
        (c) =>
          c.severity?.toLowerCase() ===
          "low"
      ).length,
    },

  ];


  // ==========================================================
  // AUTH CHECK SCREEN
  // ==========================================================

  if (
    checkingAuth ||
    !authorized
  ) {

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center text-white">

        <div className="text-center">

          <div className="text-4xl mb-4">
            🔐
          </div>

          <p className="text-slate-400">
            Checking admin access...
          </p>

        </div>

      </main>
    );

  }


  // ==========================================================
  // ADMIN PAGE
  // ==========================================================

  return (
    <>
      <Navbar />


      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

        <div className="max-w-7xl mx-auto">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-10">

            <h1 className="text-5xl font-bold mb-3">
              🧠 CivicPulse Admin Center
            </h1>

            <p className="text-slate-400">
              Monitor complaints, risk hotspots,
              AI insights and city operations.
            </p>

          </div>


          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

              <h2 className="font-bold">
                📊 Total Complaints
              </h2>

              <p className="text-3xl font-bold mt-2">
                {complaints.length}
              </p>

            </div>


            <div className="bg-red-500/20 border border-red-500/30 p-5 rounded-2xl shadow">

              <h2 className="font-bold">
                🚨 High Priority
              </h2>

              <p className="text-3xl font-bold mt-2">
                {highPriority}
              </p>

            </div>


            <div className="bg-yellow-500/20 border border-yellow-500/30 p-5 rounded-2xl shadow">

              <h2 className="font-bold">
                ⏳ Pending
              </h2>

              <p className="text-3xl font-bold mt-2">
                {pending}
              </p>

            </div>


            <div className="bg-green-500/20 border border-green-500/30 p-5 rounded-2xl shadow">

              <h2 className="font-bold">
                ✅ Resolved
              </h2>

              <p className="text-3xl font-bold mt-2">
                {resolved}
              </p>

            </div>

          </div>


          {/* ==================================================
              AI HOTSPOT
          ================================================== */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-8">

            <h2 className="font-bold text-xl mb-2">
              📍 AI Hotspot
            </h2>

            <p className="font-bold text-slate-200">
              {hotspot}
            </p>

          </div>


          {/* ==================================================
              AI RECOMMENDATION
          ================================================== */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-8">

            <h2 className="font-bold text-xl mb-2">
              🧠 AI Recommendation
            </h2>

            <p className="text-slate-300 leading-8 whitespace-pre-wrap">
              {recommendation}
            </p>

          </div>


          {/* ==================================================
              CATEGORY CHART
          ================================================== */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-8">

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


          {/* ==================================================
              STATUS CHART
          ================================================== */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-8">

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


          {/* ==================================================
              SEVERITY CHART
          ================================================== */}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-8">

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


          {/* ==================================================
              COMPLAINTS
          ================================================== */}

          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">

            <h2 className="text-2xl font-bold">
              📋 Complaints
            </h2>


            <button
              onClick={exportCSV}
              disabled={exporting}
              className="
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-gray-500
                disabled:cursor-not-allowed
                transition-all
                px-5
                py-3
                rounded-xl
                font-semibold
              "
            >

              {exporting
                ? "⏳ Exporting..."
                : "📥 Export Complaints CSV"}

            </button>

          </div>


          {/* ==================================================
              COMPLAINT LIST
          ================================================== */}

          <div className="space-y-4">

            {complaints.length === 0 ? (

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

                <p className="text-slate-400">
                  No complaints found.
                </p>

              </div>

            ) : (

              complaints.map(
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

                    <div className="flex justify-between items-start gap-4 flex-wrap">

                      <h2 className="text-2xl font-bold">
                        {complaint.title}
                      </h2>

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-semibold
                          text-white
                          ${
                            complaint.status ===
                            "pending"
                              ? "bg-yellow-500"
                              : complaint.status ===
                                "in_progress"
                              ? "bg-blue-500"
                              : complaint.status ===
                                "resolved"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        `}
                      >
                        {complaint.status}
                      </span>

                    </div>


                    <p className="text-slate-300 mt-3">
                      {complaint.description}
                    </p>


                    <div className="grid md:grid-cols-3 gap-4 mt-5">

                      <div>

                        <p className="text-slate-400 text-sm">
                          Category
                        </p>

                        <p className="font-semibold">
                          {complaint.category}
                        </p>

                      </div>


                      <div>

                        <p className="text-slate-400 text-sm">
                          Severity
                        </p>

                        <p className="font-semibold">
                          {complaint.severity}
                        </p>

                      </div>


                      <div>

                        <p className="text-slate-400 text-sm">
                          Priority
                        </p>

                        <p className="font-semibold">
                          {complaint.priority || "Medium"}
                        </p>

                      </div>

                    </div>


                    {/* STATUS CONTROLS */}

                    <div className="flex gap-2 mt-5 flex-wrap">

                      <button
                        onClick={() =>
                          updateStatus(
                            complaint.id,
                            "pending"
                          )
                        }
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg"
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
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
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
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg"
                      >
                        Resolved
                      </button>


                      <Link
                        href={`/complaints/${complaint.id}`}
                        className="bg-black hover:bg-slate-800 text-white px-3 py-2 rounded-lg"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </main>
    </>
  );
}