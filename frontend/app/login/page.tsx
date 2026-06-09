"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [error, setError] = useState("");

const router = useRouter();

const login = async () => {


setError("");

try {

  const response = await axios.post(
    "https://civicpulseai-production.up.railway.app//auth/login",
    {
      email,
      password,
    }
  );

  localStorage.setItem(
    "token",
    response.data.access_token
  );

  router.push("/dashboard");

} catch (error) {

  console.error(error);

  setError(
    "Invalid email or password"
  );
}


};

return ( <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-6">


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
      onChange={(e) =>
        setEmail(e.target.value)
      }
      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 mb-4 outline-none"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) =>
        setPassword(e.target.value)
      }
      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 mb-6 outline-none"
    />

    <button
      onClick={login}
      className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white py-4 rounded-xl font-semibold"
    >
      Sign In
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
