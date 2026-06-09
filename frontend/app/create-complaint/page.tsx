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

  const [severity, setSeverity] =
    useState("medium");

  const [priority, setPriority] =
    useState("medium");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [image, setImage] =
    useState<File | null>(null);
  const [imageAnalysis, setImageAnalysis] =
  useState<any>(null);
  const [confidence,
setConfidence] =
  useState<number | null>(
    null
  );

const [finalCategory, setFinalCategory] =
  useState("");

const [consensus, setConsensus] =
  useState("");
  const analyzeWithAI = async () => {
    try {
      const response = await axios.post(
  "https://civicpulseai-production.up.railway.app/ai/classify",
  {
    title,
    description,
  }
);

      setCategory(
        response.data.category
      );

      setSeverity(
        response.data.severity
      );

      setPriority(
        response.data.priority
      );
      setConfidence(
  response.data
    .category_confidence
);

      alert(
        "🤖 AI Analysis Complete!"
      );
    } catch (error) {
      console.error(error);

      alert(
        "AI Analysis Failed"
      );
    }
  };
  const analyzeImage = async () => {

  if (!image) {
    alert(
      "Please select an image first"
    );
    return;
  }

  try {

    const formData =
      new FormData();

    formData.append(
      "file",
      image
    );

    const response =
      await axios.post(
        "https://civicpulseai-production.up.railway.app/image-ai/analyze",
        formData
      );
    console.log(response.data);
    setImageAnalysis(
  response.data
);

setCategory(
  response.data.category
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
      `📷 AI Image Analysis

Detected:
${response.data.label}

Category:
${response.data.category}

Confidence:
${response.data.confidence}%`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Image Analysis Failed"
    );
  }
};

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
            "https://civicpulseai-production.up.railway.app/upload/",
            formData
          );

        image_url =
          uploadResponse.data.image_url;
      }

      const response =
  await axios.post(
    "https://civicpulseai-production.up.railway.app/complaints/",
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
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

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
              setTitle(
                e.target.value
              )
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
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-400"
            placeholder="Category"
            value={category || ""}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          />

          {/* AI Analysis Card */}

          <div className="bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl rounded-2xl p-5 p-4 rounded">
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

{confidence && (

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
          {imageAnalysis && (
  <div className="bg-green-500/10
border border-green-500/20
backdrop-blur-xl
rounded-2xl
p-5 p-4 rounded">

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
{finalCategory && (
  <div className="bg-purple-500/10
border border-purple-500/20
backdrop-blur-xl
rounded-2xl
p-5 p-4 rounded">

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

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={analyzeWithAI}
              className="bg-blue-600
hover:bg-blue-700
transition-all
rounded-xl
font-semibold text-white px-6 py-3 rounded"
            >
              🤖 Analyze with AI
            </button>
            <button
             onClick={analyzeImage}
             className="bg-green-600
hover:bg-green-700
transition-all
rounded-xl
font-semibold text-white px-6 py-3 rounded"
>
             📷 Analyze Image
            </button>
            <button
              onClick={
                submitComplaint
              }
              className="bg-indigo-600
hover:bg-indigo-700
transition-all
rounded-xl
font-semibold text-white px-6 py-3 rounded"
            >
              Submit Complaint
            </button>
          </div>
        </div>
      </main>
    </>
  );
}