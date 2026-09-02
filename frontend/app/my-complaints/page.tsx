"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";

import {
  isAuthenticated,
} from "@/lib/auth";

import {
  apiUrl,
} from "@/lib/api";


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

  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    /*
     * ======================================================
     * AUTHENTICATION CHECK
     * ======================================================
     *
     * Visitors are not allowed to access
     * My Complaints.
     *
     * If the token is missing or expired,
     * redirect to login immediately.
     */

    if (!isAuthenticated()) {

      router.replace("/login");

      return;
    }


    fetchComplaints();

  }, [router]);


  const fetchComplaints = async () => {

    try {

      const token =
        localStorage.getItem("token");


      if (!token) {

        router.replace("/login");

        return;
      }


      const response =
        await axios.get(
          apiUrl(
            "/complaints/my-complaints"
          ),
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


    } catch (error) {

      console.error(
        "Failed to fetch complaints:",
        error
      );


      /*
       * If backend rejects the token,
       * send the user back to login.
       */

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


    } finally {

      setLoading(false);

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


  /*
   * ========================================================
   * LOADING SCREEN
   * ========================================================
   */

  if (loading) {

    return (
      <>

        <Navbar />

        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center">

          <div className="text-center">

            <div className="text-4xl mb-4">
              ⏳
            </div>

            <p className="text-slate-400">
              Loading your complaints...
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