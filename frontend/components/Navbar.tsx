"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center gap-6">
      <Link
        href="/dashboard"
        className="hover:text-gray-300"
      >
        Dashboard
      </Link>

      <Link
        href="/create-complaint"
        className="hover:text-gray-300"
      >
        Create Complaint
      </Link>

      <Link
        href="/my-complaints"
        className="hover:text-gray-300"
      >
        My Complaints
      </Link>

      <button
        onClick={logout}
        className="ml-auto bg-red-500 px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}