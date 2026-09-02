"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const login = async () => {
    if (loading) return;

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        apiUrl("/auth/login"),
        {
          email: cleanEmail,
          password,
        }
      );

      const token = response.data?.access_token;

      if (!token) {
        throw new Error("Login token was not returned");
      }

      // Store JWT for authenticated API requests
      localStorage.setItem("token", token);

      // Go to public dashboard after successful login
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Invalid email or password");
        } else if (!error.response) {
          setError(
            "Unable to connect to the server. Please try again."
          );
        } else {
          setError(
            error.response.data?.detail ||
              "Login failed. Please try again."
          );
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-6">

      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏛 CivicPulse
          </h1>

          <p className="text-slate-300">
            Welcome Back
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 mb-4 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
          autoComplete="current-password"
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 mb-6 outline-none"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white py-4 rounded-xl font-semibold"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-slate-400 mt-6">
          Don't have an account?

          <Link
            href="/register"
            className="text-blue-400 ml-2 hover:text-blue-300"
          >
            Register
          </Link>
        </p>

      </div>
    </main>
  );
}