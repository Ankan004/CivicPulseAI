"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

const LocationPicker = dynamic(
  () => import("../../components/LocationPicker"),
  {
    ssr: false,
  }
);

export default function DisasterCenter() {
  const [weather, setWeather] =
    useState<any>(null);

  const [risk, setRisk] =
    useState<any>(null);

  const [latitude, setLatitude] =
    useState("23.2324");

  const [longitude, setLongitude] =
    useState("87.8615");

  useEffect(() => {
    fetchData();
  }, [latitude, longitude]);

  const fetchData = async () => {
    try {
      const weatherResponse =
        await axios.get(
          `https://civicpulseai-production.up.railway.app/weather/current?lat=${latitude}&lon=${longitude}`
        );

      const riskResponse =
        await axios.get(
          `https://civicpulseai-production.up.railway.app/disaster/risk?lat=${latitude}&lon=${longitude}`
        );

      setWeather(
        weatherResponse.data
      );

      setRisk(
        riskResponse.data
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!weather || !risk) {
    return (
      <p className="p-10">
        Loading...
      </p>
    );
  }

  return (
  <>
    <Navbar />

    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-28 px-10 pb-10">
      <div className="mb-10">

  <h1 className="text-5xl font-bold mb-3">
    🌍 CivicPulse Disaster Center
  </h1>

  <p className="text-slate-400">
    AI-powered disaster monitoring,
    weather intelligence and civic risk analysis.
  </p>

</div>

      {/* Location Selector */}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          📍 Select Location
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
      </div>

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
mb-8
">
        <p>
          📍 Location:
          <strong>
            {" "}
            {
              weather.location
                ?.name
            }
          </strong>
        </p>

        <p>
          Region:
          {" "}
          {
            weather.location
              ?.region
          }
        </p>
      </div>

      {/* Weather Intelligence */}

      <h2 className="text-2xl font-bold mb-4">
        Weather Intelligence
      </h2>

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
">
        <WeatherCard
          title="🌡 Temperature"
          value={`${weather.current.temp_c}°C`}
        />

        <WeatherCard
          title="💧 Humidity"
          value={`${weather.current.humidity}%`}
        />

        <WeatherCard
          title="🌬 Wind Speed"
          value={`${weather.current.wind_kph} km/h`}
        />

        <WeatherCard
          title="⚙ Pressure"
          value={`${weather.current.pressure_mb}`}
        />
      </div>

      {/* Disaster Risk Prediction */}

      <h2 className="text-2xl font-bold mb-4">
        Disaster Risk Prediction
      </h2>

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
">
        <RiskCard
          title="🌊 Flood Risk"
          value={
            risk.flood_risk
          }
        />

        <RiskCard
          title="⛈ Thunderstorm Risk"
          value={
            risk.thunderstorm_risk
          }
        />

        <RiskCard
          title="🔥 Heatwave Risk"
          value={
            risk.heatwave_risk
          }
        />
      </div>

      {/* Civic Intelligence */}

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
mb-10
">
        <h2 className="text-2xl font-bold mb-4">
          📊 Nearby Civic Issues
        </h2>

        <p className="mb-2">
          🚰 Drainage
          Complaints:
          {" "}
          {risk.drainage_complaints ??
            0}
        </p>

        <p>
          💧 Water
          Complaints:
          {" "}
          {risk.water_complaints ??
            0}
        </p>
        <p>
          🛣 Road Complaints:
          {" "}
          {risk.road_complaints ?? 0}
        </p>
      </div>

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
mb-10
">

  <h2 className="text-xl font-bold mb-4">
    🤖 AI Explanation
  </h2>

  {(risk?.heatwave_risk ?? 0) >= 70 && (
    <div className="mb-4">

      <p className="font-semibold text-red-600">
        🔥 Heatwave Risk is High
      </p>

      <ul className="list-disc ml-6 mt-2">

        <li>
          Temperature is
          {" "}
          {weather?.current?.temp_c ?? 0}°C
        </li>

        {(weather?.current?.temp_c ?? 0) > 35 && (
  <li>
    Temperature exceeds safe comfort levels
  </li>
)}

        <li>
          Risk of heat stress increases
        </li>

      </ul>

    </div>
  )}
  <div className="mb-4">

  <p className="font-semibold text-green-600">
    🌊 Flood Risk Analysis
  </p>

  <ul className="list-disc ml-6 mt-2"></ul>
  </div>

  

  <ul className="list-disc ml-6 mt-2">
    
    <li>
      Nearby drainage complaints:
      {" "}
      {risk?.drainage_complaints ?? 0}
    </li>

    <li>
      Nearby water complaints:
      {" "}
      {risk?.water_complaints ?? 0}
    </li>

    <li>
      Nearby road complaints:
      {" "}
      {risk?.road_complaints ?? 0}
    </li>

    <li>
      Current humidity:
      {" "}
      {weather?.current?.humidity ?? 0}
      %
    </li>

    <li>
      Calculated flood risk:
      {" "}
      {risk?.flood_risk ?? 0}
      %
    </li>

  </ul>

</div>



      {/* AI Alerts */}

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
mb-10
">
        <h2 className="text-2xl font-bold mb-4">
          ⚠ AI Alerts
        </h2>

        {risk.flood_risk >
          70 && (
          <p className="text-red-600 mb-2">
            🌊 High Flood
            Risk detected.
            Stay alert for
            waterlogging.
          </p>
        )}

        {risk.thunderstorm_risk >
          70 && (
          <p className="text-yellow-600 mb-2">
            ⛈ High
            Thunderstorm
            Risk. Avoid
            outdoor
            activities.
          </p>
        )}

        {risk.heatwave_risk >
          70 && (
          <p className="text-orange-600 mb-2">
            🔥 High
            Heatwave Risk.
            Stay hydrated
            and avoid
            direct
            sunlight.
          </p>
        )}

        {risk.flood_risk <=
          70 &&
          risk.thunderstorm_risk <=
            70 &&
          risk.heatwave_risk <=
            70 && (
            <p className="text-green-600">
              ✅ No major
              disaster
              threats
              detected.
            </p>
          )}
      </div>

      {/* Government Recommendations */}

      <div className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-6
shadow-xl
">
        <h2 className="text-2xl font-bold mb-4">
          🏛 Government
          Recommendations
        </h2>

        {risk.flood_risk >
          70 && (
          <ul className="list-disc pl-6 mb-4">
            <li>
              Inspect
              drainage
              systems
            </li>
            <li>
              Deploy water
              pumps
            </li>
            <li>
              Alert
              residents in
              low-lying
              areas
            </li>
          </ul>
        )}

        {risk.thunderstorm_risk >
          70 && (
          <ul className="list-disc pl-6 mb-4">
            <li>
              Prepare
              emergency
              response
              teams
            </li>
            <li>
              Inspect power
              infrastructure
            </li>
            <li>
              Issue public
              weather
              warnings
            </li>
          </ul>
        )}

        {risk.heatwave_risk >
          70 && (
          <ul className="list-disc pl-6">
            <li>
              Open cooling
              centers
            </li>
            <li>
              Increase
              drinking
              water
              availability
            </li>
            <li>
              Issue heat
              advisories
            </li>
          </ul>
        )}
      </div>
    </main>
    </>
  );
}

function WeatherCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div
      className="
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      rounded-2xl
      p-6
      shadow-xl
      "
    >

      <h3
        className="
        font-semibold
        mb-3
        text-slate-300
        "
      >
        {title}
      </h3>

      <p
        className="
        text-4xl
        font-bold
        text-white
        "
      >
        {value}
      </p>

    </div>

  );
}

function RiskCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  let color =
    "text-green-400";

  if (value > 70) {

    color =
      "text-red-400";

  } else if (
    value > 40
  ) {

    color =
      "text-yellow-400";

  }

  return (

    <div
      className="
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      rounded-2xl
      p-6
      shadow-xl
      "
    >

      <h3
        className="
        font-semibold
        mb-3
        text-slate-300
        "
      >
        {title}
      </h3>

      <p
        className={`text-5xl font-bold ${color}`}
      >
        {value}%
      </p>

    </div>

  );
}