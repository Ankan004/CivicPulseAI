"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

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
          `http://127.0.0.1:8000/weather/current?lat=${latitude}&lon=${longitude}`
        );

      const riskResponse =
        await axios.get(
          `http://127.0.0.1:8000/disaster/risk?lat=${latitude}&lon=${longitude}`
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
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">
        🌍 Disaster Center
      </h1>

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

      <div className="bg-white rounded shadow p-4 mb-6">
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

      <div className="grid md:grid-cols-4 gap-6 mb-10">
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

      <div className="grid md:grid-cols-3 gap-6 mb-10">
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

      <div className="bg-white rounded shadow p-6 mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Civic Intelligence
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
      </div>

      {/* Risk Analysis */}

      <div className="bg-white rounded shadow p-6 mb-10">
        <h2 className="text-2xl font-bold mb-4">
          🧠 Risk Analysis
        </h2>

        <div className="space-y-2">
          <p>
            🌡 Temperature:
            {" "}
            {
              risk.temperature
            }
            °C
          </p>

          <p>
            💧 Humidity:
            {" "}
            {
              risk.humidity
            }
            %
          </p>

          <p>
            🌬 Wind Speed:
            {" "}
            {
              risk.wind_speed
            }
            {" "}
            km/h
          </p>

          <p>
            🚰 Drainage
            Complaints:
            {" "}
            {
              risk.drainage_complaints
            }
          </p>

          <p>
            💧 Water
            Complaints:
            {" "}
            {
              risk.water_complaints
            }
          </p>
        </div>
      </div>

      {/* AI Alerts */}

      <div className="bg-white rounded shadow p-6 mb-10">
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

      <div className="bg-white rounded shadow p-6">
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
    <div className="bg-white rounded shadow p-6">
      <h3 className="font-semibold mb-2">
        {title}
      </h3>

      <p className="text-3xl font-bold">
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
    "text-green-600";

  if (value > 70) {
    color =
      "text-red-600";
  } else if (
    value > 40
  ) {
    color =
      "text-yellow-600";
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <h3 className="font-semibold mb-2">
        {title}
      </h3>

      <p
        className={`text-4xl font-bold ${color}`}
      >
        {value}%
      </p>
    </div>
  );
}