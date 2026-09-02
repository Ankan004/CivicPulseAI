"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AssistantPage() {
  const [data, setData] = useState<any>(null);

  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  const [summaryLoading, setSummaryLoading] =
    useState(true);

  const [summaryError, setSummaryError] =
    useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  // ============================================================
  // LOAD PUBLIC ASSISTANT SUMMARY
  // ============================================================

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(false);

      const response = await axios.get(
        apiUrl("/assistant/summary")
      );

      setData(response.data);
    } catch (error) {
      console.error(
        "Failed to load assistant summary:",
        error
      );

      setSummaryError(true);
    } finally {
      setSummaryLoading(false);
    }
  };

  // ============================================================
  // ASK AI ASSISTANT
  // ============================================================

  const askAI = async () => {
    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion) {
      setAnswer(
        "Please enter a question about the civic complaints."
      );
      return;
    }

    try {
      setLoading(true);
      setAnswer("");

      // --------------------------------------------------------
      // Get JWT if user is logged in
      // --------------------------------------------------------

      const token = getToken();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      // --------------------------------------------------------
      // Ask Assistant
      // --------------------------------------------------------

      const response =
        await axios.post(
          apiUrl("/assistant/ask"),
          {
            question: trimmedQuestion,
          },
          {
            headers,
          }
        );

      setAnswer(
        response.data?.answer ||
          "The Assistant did not return a response."
      );
    } catch (error: any) {
      console.error(
        "Failed to get AI response:",
        error
      );

      // --------------------------------------------------------
      // Authentication required for Gemini fallback
      // --------------------------------------------------------

      if (
        error?.response?.status === 401
      ) {
        setAnswer(
          "🔐 Please login to use advanced AI Assistant analysis. Basic civic questions are available without login."
        );
      } else if (
        error?.response?.status === 403
      ) {
        setAnswer(
          "You do not have permission to use this AI feature."
        );
      } else {
        setAnswer(
          "⚠️ Failed to get AI response. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ENTER KEY
  // ============================================================

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Enter" &&
      !loading
    ) {
      askAI();
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-28 px-10 pb-10">

        <div className="max-w-6xl mx-auto">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="mb-10">

            <h1 className="text-5xl font-bold mb-3">
              🤖 CivicPulse AI Assistant
            </h1>

            <p className="text-slate-400">
              Ask questions about complaints,
              risk hotspots, priorities and
              city operations.
            </p>

          </div>

          {/* ================================================= */}
          {/* SUMMARY */}
          {/* ================================================= */}

          {summaryError ? (
            <div className="
              mb-8
              rounded-2xl
              border
              border-red-500/30
              bg-red-500/10
              p-5
              text-red-300
            ">
              ⚠️ Unable to load civic
              summary data.
            </div>
          ) : (
            <div className="
              grid
              md:grid-cols-3
              gap-6
              mb-8
            ">

              {/* TOTAL */}

              <div className="
                bg-white/5
                backdrop-blur-xl
                border border-white/10
                rounded-2xl
                p-6
                shadow-xl
              ">

                <h3 className="text-slate-400">
                  Total Complaints
                </h3>

                <p className="text-4xl font-bold mt-3">
                  {summaryLoading
                    ? "—"
                    : data?.total_complaints ?? 0}
                </p>

              </div>

              {/* HIGH PRIORITY */}

              <div className="
                bg-red-500/20
                border border-red-500/30
                rounded-2xl
                p-6
                shadow-xl
              ">

                <h3 className="text-slate-300">
                  High Priority
                </h3>

                <p className="text-4xl font-bold mt-3">
                  {summaryLoading
                    ? "—"
                    : data?.high_priority ?? 0}
                </p>

              </div>

              {/* PENDING */}

              <div className="
                bg-yellow-500/20
                border border-yellow-500/30
                rounded-2xl
                p-6
                shadow-xl
              ">

                <h3 className="text-slate-300">
                  Pending
                </h3>

                <p className="text-4xl font-bold mt-3">
                  {summaryLoading
                    ? "—"
                    : data?.pending ?? 0}
                </p>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* ASK AI */}
          {/* ================================================= */}

          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-6
            shadow-xl
          ">

            <h2 className="text-2xl font-bold mb-4">
              Ask Civic AI
            </h2>

            <input
              className="
                w-full
                bg-white/5
                border border-white/10
                rounded-xl
                p-4
                text-white
                placeholder:text-slate-400
                outline-none
                focus:border-blue-500
                transition
              "
              placeholder="Ask something..."
              value={question}
              onChange={(e) =>
                setQuestion(
                  e.target.value
                )
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              onClick={askAI}
              disabled={
                loading ||
                !question.trim()
              }
              className="
                mt-4
                bg-blue-600
                hover:bg-blue-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-all
                px-6
                py-3
                rounded-xl
                font-semibold
              "
            >
              {loading
                ? "🤖 Analyzing..."
                : "🤖 Ask AI"}
            </button>

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading && (
              <div className="
                mt-6
                p-4
                bg-blue-900/30
                border border-blue-500
                rounded-xl
                text-blue-300
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-4
                  h-4
                  border-2
                  border-blue-300
                  border-t-transparent
                  rounded-full
                  animate-spin
                " />

                <span>
                  AI is analyzing complaint data...
                </span>

              </div>
            )}

            {/* ================================================= */}
            {/* ANSWER */}
            {/* ================================================= */}

            {answer && (
              <div className="
                mt-6
                bg-blue-500/10
                border border-blue-500/20
                rounded-2xl
                p-5
              ">

                <h3 className="font-bold mb-3">
                  🤖 AI Response
                </h3>

                <p className="
                  text-slate-300
                  leading-8
                  whitespace-pre-wrap
                ">
                  {answer}
                </p>

              </div>
            )}

          </div>

          {/* ================================================= */}
          {/* SUGGESTED QUESTIONS */}
          {/* ================================================= */}

          <div className="
            mt-8
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-6
            shadow-xl
          ">

            <h2 className="text-2xl font-bold mb-5">
              Suggested Questions
            </h2>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  setQuestion(
                    "total complaints"
                  )
                }
                className="
                  bg-white/5
                  border border-white/10
                  px-4 py-2
                  rounded-full
                  hover:bg-white/10
                  transition
                "
              >
                Total Complaints
              </button>

              <button
                onClick={() =>
                  setQuestion(
                    "high priority complaints"
                  )
                }
                className="
                  bg-white/5
                  border border-white/10
                  px-4 py-2
                  rounded-full
                  hover:bg-white/10
                  transition
                "
              >
                High Priority Complaints
              </button>

              <button
                onClick={() =>
                  setQuestion(
                    "pending complaints"
                  )
                }
                className="
                  bg-white/5
                  border border-white/10
                  px-4 py-2
                  rounded-full
                  hover:bg-white/10
                  transition
                "
              >
                Pending Complaints
              </button>

              <button
                onClick={() =>
                  setQuestion(
                    "which category has the most complaints"
                  )
                }
                className="
                  bg-white/5
                  border border-white/10
                  px-4 py-2
                  rounded-full
                  hover:bg-white/10
                  transition
                "
              >
                Top Category
              </button>

              <button
                onClick={() =>
                  setQuestion(
                    "which area is highest risk"
                  )
                }
                className="
                  bg-white/5
                  border border-white/10
                  px-4 py-2
                  rounded-full
                  hover:bg-white/10
                  transition
                "
              >
                Highest Risk Area
              </button>

              <button
                onClick={() =>
                  setQuestion(
                    "hotspot analysis"
                  )
                }
                className="
                  bg-white/5
                  border border-white/10
                  px-4 py-2
                  rounded-full
                  hover:bg-white/10
                  transition
                "
              >
                Hotspot Analysis
              </button>

            </div>

          </div>

        </div>

      </main>
    </>
  );
}