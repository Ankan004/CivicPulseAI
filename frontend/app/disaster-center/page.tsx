"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DisasterCenter() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    const response = await axios.get(
      "http://127.0.0.1:8000/weather/current"
    );

    setWeather(response.data);
  };

  if (!weather) {
    return <p>Loading...</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-6">
        Disaster Center
      </h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="border p-6 rounded">
          🌡 Temperature
          <h2 className="text-3xl font-bold">
            {weather.current.temp_c}°C
          </h2>
        </div>

        <div className="border p-6 rounded">
          💧 Humidity
          <h2 className="text-3xl font-bold">
            {weather.current.humidity}%
          </h2>
        </div>

        <div className="border p-6 rounded">
          🌬 Wind Speed
          <h2 className="text-3xl font-bold">
            {weather.current.wind_kph} km/h
          </h2>
        </div>

        <div className="border p-6 rounded">
          ⚙ Pressure
          <h2 className="text-3xl font-bold">
            {weather.current.pressure_mb}
          </h2>
        </div>
      </div>
    </main>
  );
}