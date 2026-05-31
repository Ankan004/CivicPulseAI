"use client";

import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

const ComplaintMap = dynamic(
  () => import("../../components/ComplaintMap"),
  {
    ssr: false,
  }
);

export default function MapPage() {
  return (
    <>
      <Navbar />

      <main className="p-10">
        <h1 className="text-4xl font-bold mb-6">
          Complaint Map
        </h1>

        <ComplaintMap />
      </main>
    </>
  );
}