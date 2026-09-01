"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserRole } from "../lib/auth";

export default function Navbar() {

const router = useRouter();

const [role, setRole] =
  useState("");

useEffect(() => {

  const userRole =
    getUserRole();

  setRole(
    userRole || ""
  );

}, []);

const logout = () => {

  localStorage.removeItem("token");

  router.push("/login");

};

return (


<nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">

  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">

    <Link
      href="/dashboard"
      className="text-2xl font-bold text-white"
    >
      🏛 CivicPulse
    </Link>

    <div className="hidden md:flex items-center gap-6 ml-10">

      <Link
        href="/dashboard"
        className="text-slate-300 hover:text-blue-400 transition"
      >
        Dashboard
      </Link>

      <Link
        href="/create-complaint"
        className="text-slate-300 hover:text-blue-400 transition"
      >
        Report Issue
      </Link>

      <Link
        href="/my-complaints"
        className="text-slate-300 hover:text-blue-400 transition"
      >
        My Complaints
      </Link>

      <Link
  href="/map"
  className="text-slate-300 hover:text-blue-400 transition"
>
  Complaint Map
</Link>

<Link
  href="/risk-map"
  className="text-slate-300 hover:text-blue-400 transition"
>
  Risk Map
</Link>

      <Link
        href="/disaster-center"
        className="text-slate-300 hover:text-blue-400 transition"
      >
        Disaster Center
      </Link>

      <Link
        href="/assistant"
        className="text-slate-300 hover:text-blue-400 transition"
      >
        AI Assistant
      </Link>
    
      {role === "admin" && (

  <Link
    href="/admin"
    className="text-slate-300 hover:text-blue-400 transition"
  >
    Admin
  </Link>

)}
      

    </div>

    <button
      onClick={logout}
      className="ml-auto bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-xl text-white"
    >
      Logout
    </button>

  </div>

</nav>


);
}
