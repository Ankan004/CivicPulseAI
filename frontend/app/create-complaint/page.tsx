"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

import { apiUrl } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

const LocationPicker = dynamic(
  () => import("../../components/LocationPicker"),
  {
    ssr: false,
  }
);

export default function CreateComplaintPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [priority, setPriority] = useState("medium");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [image, setImage] = useState<File | null>(null);

  const [imageAnalysis, setImageAnalysis] =
    useState<any>(null);

  const [analyzingImage, setAnalyzingImage] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [confidence, setConfidence] =
    useState<number | null>(null);

  const [finalCategory, setFinalCategory] =
    useState("");

  const [consensus, setConsensus] =
    useState("");


  // ==========================================================
  // AUTHENTICATION GUARD
  // ==========================================================

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [router]);


  // ==========================================================
  // AI TEXT ANALYSIS
  // ==========================================================

  const analyzeWithAI = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await axios.post(
        apiUrl("/ai/classify"),
        {
          title,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategory(response.data.category);

      setSeverity(
        response.data.severity
      );

      setPriority(
        response.data.priority
      );

      setConfidence(
        response.data.category_confidence
      );

      alert("🤖 AI Analysis Complete!");

    } catch (error) {
      console.error(error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      alert("AI Analysis Failed");
    }
  };


  // ==========================================================
  // IMAGE ANALYSIS
  // ==========================================================

  const analyzeImage = async () => {
    if (!image) {
      alert("Please select an image first");
      return;
    }

    try {
      setAnalyzingImage(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const formData = new FormData();

      formData.append(
        "image",
        image
      );

      const response = await axios.post(
        apiUrl("/vision/analyze-image"),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      setImageAnalysis(
        response.data
      );

      setCategory(
        response.data.category
      );

      setSeverity(
        response.data.severity.toLowerCase()
      );

      setPriority(
        response.data.priority.toLowerCase()
      );

      setConfidence(
        response.data.confidence
      );

      if (
        category &&
        category.toLowerCase() ===
          response.data.category.toLowerCase()
      ) {
        setConsensus(
          "🟢 High Confidence Match"
        );
      } else {
        setConsensus(
          "🟡 Manual Review Recommended"
        );
      }

      setFinalCategory(
        response.data.category
      );

      alert(
`📷 Gemini Vision Analysis

Category:
${response.data.category}

Severity:
${response.data.severity}

Priority:
${response.data.priority}

Confidence:
${response.data.confidence}%

Description:
${response.data.description}`
      );

    } catch (error) {
      console.error(error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      alert(
        "Image Analysis Failed"
      );

    } finally {
      setAnalyzingImage(false);
    }
  };


  // ==========================================================
  // SUBMIT COMPLAINT
  // ==========================================================

  const submitComplaint = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login to submit a complaint."
      );

      router.replace("/login");

      return;
    }

    try {
      setSubmitting(true);

      let image_url = "";

      // ------------------------------------------------------
      // IMAGE UPLOAD
      // ------------------------------------------------------

      if (image) {
        const formData =
          new FormData();

        formData.append(
          "file",
          image
        );

        const uploadResponse =
          await axios.post(
            apiUrl("/upload/"),
            formData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        image_url =
          uploadResponse.data.image_url;
      }

      // ------------------------------------------------------
      // CREATE COMPLAINT
      // ------------------------------------------------------

      const response =
        await axios.post(
          apiUrl("/complaints/"),
          {
            title,
            description,
            category,
            latitude: Number(latitude),
            longitude: Number(longitude),
            image_url,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // ------------------------------------------------------
      // DUPLICATE DETECTION
      // ------------------------------------------------------

      if (
        response.data.message ===
        "Similar complaint already exists"
      ) {
        alert(
`⚠ Duplicate Complaint Found

Complaint ID:
${response.data.existing_complaint_id}

Title:
${response.data.existing_title}

Similarity:
${response.data.similarity_score}%

Status:
${response.data.status}`
        );

        return;
      }

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      alert(
        "✅ Complaint Created Successfully!"
      );

      setTitle("");
      setDescription("");
      setCategory("");
      setSeverity("medium");
      setPriority("medium");
      setLatitude("");
      setLongitude("");
      setImage(null);
      setImageAnalysis(null);
      setConfidence(null);
      setFinalCategory("");
      setConsensus("");

    } catch (error) {
      console.error(error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");

        router.replace("/login");

        return;
      }

      alert(
        "Failed to create complaint"
      );

    } finally {
      setSubmitting(false);
    }
  };


  // ==========================================================
  // WAIT FOR AUTH CHECK
  // ==========================================================

  if (!authorized) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center text-white">

        <div className="text-center">

          <div className="text-4xl mb-4">
            🔐
          </div>

          <p className="text-slate-400">
            Checking authentication...
          </p>

        </div>

      </main>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-10">

        <div className="mb-10">

          <h1 className="text-5xl font-bold mb-3">
            📝 Report Civic Issue
          </h1>

          <p className="text-slate-400">
            Submit complaints and let AI assist
            with categorization, severity analysis
            and risk assessment.
          </p>

        </div>


        <div
          className="
            max-w-6xl mx-auto
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-3xl
            p-8
            shadow-2xl
            space-y-6
          "
        >

          <input
            className="
              w-full
              bg-white/5
              border border-white/10
              rounded-xl
              p-4
              text-white
              placeholder:text-slate-400
            "
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />


          <textarea
            className="
              w-full
              bg-white/5
              border border-white/10
              rounded-xl
              p-4
              text-white
              placeholder:text-slate-400
            "
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />


          <input
            className="
              w-full
              bg-white/5
              border border-white/10
              rounded-xl
              p-4
              text-white
              placeholder:text-slate-400
            "
            placeholder="Category"
            value={category || ""}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          />


          {/* AI ANALYSIS */}

          <div
            className="
              bg-blue-500/10
              border border-blue-500/20
              backdrop-blur-xl
              rounded-2xl
              p-5
            "
          >

            <h3 className="font-bold text-lg mb-3">
              🤖 AI Analysis
            </h3>

            <div className="space-y-2">

              <p>
                <strong>
                  Category:
                </strong>{" "}
                {category}
              </p>

              {confidence !== null && (
                <p>
                  <strong>
                    Confidence:
                  </strong>{" "}
                  {confidence}%
                </p>
              )}

              <p>
                <strong>
                  Severity:
                </strong>{" "}
                <span className="text-orange-600 font-semibold">
                  {severity}
                </span>
              </p>

              <p>
                <strong>
                  Priority:
                </strong>{" "}
                <span className="text-red-600 font-semibold">
                  {priority}
                </span>
              </p>

            </div>

          </div>


          {/* IMAGE ANALYSIS */}

          {imageAnalysis && (
            <div
              className="
                bg-green-500/10
                border border-green-500/20
                backdrop-blur-xl
                rounded-2xl
                p-5
              "
            >

              <h3 className="font-bold text-lg mb-3">
                📷 AI Image Analysis
              </h3>

              <p>
                <strong>
                  Detected:
                </strong>{" "}
                {imageAnalysis.label}
              </p>

              <p>
                <strong>
                  Suggested Category:
                </strong>{" "}
                {imageAnalysis.category}
              </p>

              <p>
                <strong>
                  Confidence:
                </strong>{" "}
                {imageAnalysis.confidence}%
              </p>

            </div>
          )}


          {/* VERIFICATION */}

          {finalCategory && (
            <div
              className="
                bg-purple-500/10
                border border-purple-500/20
                backdrop-blur-xl
                rounded-2xl
                p-5
              "
            >

              <h3 className="font-bold text-lg mb-3">
                🧠 AI Verification Result
              </h3>

              <p>
                <strong>
                  Final Category:
                </strong>{" "}
                {finalCategory}
              </p>

              <p>
                <strong>
                  Verification:
                </strong>{" "}
                {consensus}
              </p>

            </div>
          )}


          {/* LOCATION */}

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


          {/* IMAGE UPLOAD */}

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


          {/* BUTTONS */}

          <div className="flex gap-4 flex-wrap">

            <button
              onClick={analyzeWithAI}
              className="
                bg-blue-600
                hover:bg-blue-700
                transition-all
                rounded-xl
                font-semibold
                text-white
                px-6
                py-3
              "
            >
              🤖 Analyze with AI
            </button>


            <button
              onClick={analyzeImage}
              disabled={analyzingImage}
              className="
                bg-green-600
                hover:bg-green-700
                disabled:bg-gray-500
                disabled:cursor-not-allowed
                transition-all
                rounded-xl
                font-semibold
                text-white
                px-6
                py-3
              "
            >
              {analyzingImage
                ? "🔄 Analyzing..."
                : "📷 Analyze Image"}
            </button>


            <button
              onClick={submitComplaint}
              disabled={submitting}
              className="
                bg-indigo-600
                hover:bg-indigo-700
                disabled:bg-gray-500
                disabled:cursor-not-allowed
                transition-all
                rounded-xl
                font-semibold
                text-white
                px-6
                py-3
              "
            >
              {submitting
                ? "⏳ Submitting..."
                : "Submit Complaint"}
            </button>

          </div>


          {/* IMAGE ANALYSIS LOADER */}

          {analyzingImage && (
            <div
              className="
                mt-5
                p-4
                rounded-xl
                bg-blue-50
                border
                border-blue-200
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  h-5
                  w-5
                  border-2
                  border-blue-500
                  border-t-transparent
                  rounded-full
                  animate-spin
                "
              />

              <span
                className="
                  text-blue-700
                  font-medium
                "
              >
                🤖 Gemini Vision is analyzing your image...
              </span>

            </div>
          )}


          {/* SUBMISSION LOADER */}

          {submitting && (
            <div
              className="
                mt-5
                p-4
                rounded-xl
                bg-indigo-50
                border
                border-indigo-200
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  h-5
                  w-5
                  border-2
                  border-indigo-500
                  border-t-transparent
                  rounded-full
                  animate-spin
                "
              />

              <span
                className="
                  text-indigo-700
                  font-medium
                "
              >
                📤 Uploading image and processing complaint...
              </span>

            </div>
          )}

        </div>

      </main>
    </>
  );
}