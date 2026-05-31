"use client";

import { useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

const LocationPicker = dynamic(
  () =>
    import(
      "../../components/LocationPicker"
    ),
  {
    ssr: false,
  }
);

export default function CreateComplaintPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const submitComplaint = async () => {
    try {
      const token =
        localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8000/complaints/",
        {
          title,
          description,
          category,
          latitude:
            Number(latitude),
          longitude:
            Number(longitude),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Complaint Created Successfully!"
      );

      setTitle("");
      setDescription("");
      setCategory("");
      setLatitude("");
      setLongitude("");
    } catch (error) {
      console.error(error);
      alert(
        "Failed to create complaint"
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-black p-10">
        <h1 className="text-4xl font-bold mb-6">
          Create Complaint
        </h1>

        <div className="max-w-3xl space-y-4">
          <input
            className="w-full border p-3 rounded"
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <textarea
            className="w-full border p-3 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <input
            className="w-full border p-3 rounded"
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          />

          <input
            className="w-full border p-3 rounded"
            placeholder="Latitude"
            value={latitude}
            readOnly
          />

          <input
            className="w-full border p-3 rounded"
            placeholder="Longitude"
            value={longitude}
            readOnly
          />

          <h2 className="text-xl font-bold">
            Search or Select Location
          </h2>

          <LocationPicker
            onLocationSelect={(
              lat,
              lng
            ) => {
              setLatitude(
                lat.toString()
              );

              setLongitude(
                lng.toString()
              );
            }}
          />

          <button
            onClick={submitComplaint}
            className="bg-black text-white px-6 py-3 rounded"
          >
            Submit Complaint
          </button>
        </div>
      </main>
    </>
  );
}