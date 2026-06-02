"use client";

import { useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

const LocationPicker = dynamic(
  () => import("../../components/LocationPicker"),
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

  const [image, setImage] =
    useState<File | null>(null);

  const submitComplaint = async () => {
    try {
      const token =
        localStorage.getItem("token");

      let image_url = "";

      if (image) {
        const formData =
          new FormData();

        formData.append(
          "file",
          image
        );

        const uploadResponse =
          await axios.post(
            "http://127.0.0.1:8000/upload/",
            formData
          );

        image_url =
          uploadResponse.data.image_url;
      }

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
          image_url,
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
      setImage(null);
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

          <div>
            <label className="block mb-2 font-medium">
              Upload Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(
                  e.target.files?.[0] ||
                    null
                )
              }
              className="w-full border p-3 rounded"
            />
          </div>

          <button
            onClick={
              submitComplaint
            }
            className="bg-black text-white px-6 py-3 rounded"
          >
            Submit Complaint
          </button>
        </div>
      </main>
    </>
  );
}