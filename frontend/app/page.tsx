import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6">

        {/* Background Glow */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl text-center">

          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-blue-400/30 bg-white/5 backdrop-blur">
            🚀 AI-Powered Smart Governance Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">

            CivicPulse

            <span className="block text-blue-400">
              Smart City Intelligence
            </span>

          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            Report civic issues, predict urban risks,
            and empower municipalities with AI-driven
            decision making.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">

            <Link
              href="/register"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
            >
              Create Free Account
            </Link>

            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl border border-slate-600 hover:bg-white/10 transition"
            >
              Explore Platform
            </Link>

          </div>

        </div>

      </section>
      {/* Stats Section */}

<section className="py-24 px-6">

  <div className="max-w-6xl mx-auto">

    <div className="grid md:grid-cols-4 gap-6">

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-4xl font-bold text-blue-400">
          1200+
        </h3>
        <p className="text-slate-300 mt-2">
          Complaints Tracked
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-4xl font-bold text-cyan-400">
          3500+
        </h3>
        <p className="text-slate-300 mt-2">
          AI Analyses
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-4xl font-bold text-green-400">
          900+
        </h3>
        <p className="text-slate-300 mt-2">
          Issues Resolved
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-4xl font-bold text-red-400">
          15
        </h3>
        <p className="text-slate-300 mt-2">
          Active Hotspots
        </p>
      </div>

    </div>

  </div>

</section>
{/* Features */}

<section className="py-24 px-6">

  <div className="max-w-6xl mx-auto">

    <h2 className="text-5xl font-bold text-center mb-16">
      Platform Features
    </h2>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-105 transition">

        <h3 className="text-xl font-semibold mb-3">
          🤖 AI Analysis
        </h3>

        <p className="text-slate-300">
          Automatically classify complaints,
          severity and priority.
        </p>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-105 transition">

        <h3 className="text-xl font-semibold mb-3">
          🗺 Risk Mapping
        </h3>

        <p className="text-slate-300">
          Identify civic hotspots and
          high-risk zones instantly.
        </p>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-105 transition">

        <h3 className="text-xl font-semibold mb-3">
          🌦 Disaster Intelligence
        </h3>

        <p className="text-slate-300">
          Weather-aware disaster
          prediction system.
        </p>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-105 transition">

        <h3 className="text-xl font-semibold mb-3">
          📊 Municipality Dashboard
        </h3>

        <p className="text-slate-300">
          Analytics, exports,
          charts and insights.
        </p>

      </div>

    </div>

  </div>

</section>
<section className="py-24 px-6">

  <div className="max-w-5xl mx-auto text-center">

    <h2 className="text-5xl font-bold mb-16">
      How It Works
    </h2>

    <div className="grid md:grid-cols-4 gap-6">

      <div>
        <div className="text-5xl mb-4">
          1️⃣
        </div>
        <h3 className="font-semibold">
          Report Issue
        </h3>
      </div>

      <div>
        <div className="text-5xl mb-4">
          2️⃣
        </div>
        <h3 className="font-semibold">
          AI Analysis
        </h3>
      </div>

      <div>
        <div className="text-5xl mb-4">
          3️⃣
        </div>
        <h3 className="font-semibold">
          Municipality Review
        </h3>
      </div>

      <div>
        <div className="text-5xl mb-4">
          4️⃣
        </div>
        <h3 className="font-semibold">
          Resolution Tracking
        </h3>
      </div>

    </div>

  </div>

</section>
<footer className="border-t border-white/10 py-10 text-center text-slate-400">

  <h3 className="text-2xl font-bold text-white mb-3">
    CivicPulse
  </h3>

  <p>
    AI-Powered Smart City Intelligence Platform
  </p>

</footer>
    </main>
  );
}