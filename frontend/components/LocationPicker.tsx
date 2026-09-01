"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import { useEffect,useState } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  onLocationSelect: (
    lat: number,
    lng: number
  ) => void;
}

function LocationMarker({
  selectedPosition,
  onLocationSelect,
}: {
  selectedPosition: [number, number] | null;
  onLocationSelect: (
    lat: number,
    lng: number
  ) => void;
}) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      onLocationSelect(lat, lng);
    },
  });

  if (!selectedPosition) return null;

  return (
    <Marker position={selectedPosition} />
  );
}

export default function LocationPicker({
  onLocationSelect,
}: Props) {
  const [search, setSearch] =
  useState("");

const [debouncedSearch,
  setDebouncedSearch] =
  useState("");

const [suggestions, setSuggestions] =
  useState<any[]>([]);

const [center, setCenter] =
  useState<[number, number]>(
    [23.2323, 87.8615]
  );

const [selectedPosition,
  setSelectedPosition] =
  useState<[number, number] | null>(
    null
  );
  

useEffect(() => {

  const timer =
    setTimeout(() => {

      setDebouncedSearch(
        search
      );

    }, 500);

  return () =>
    clearTimeout(timer);

}, [search]);

useEffect(() => {

  if (
    debouncedSearch.length >= 3
  ) {

    handleSearch(
      debouncedSearch
    );

  } else {

    setSuggestions([]);

  }

}, [debouncedSearch]);



  const handleSearch = async (
  value: string
) => {

  if (value.length < 3) {

    setSuggestions([]);

    return;

  }

  try {

    const response =
      await fetch(
        `http://127.0.0.1:8000/location/search?q=${encodeURIComponent(value)}`
      );

    if (!response.ok) {

      throw new Error(
        "Location search failed"
      );

    }

    const data =
      await response.json();

    setSuggestions(data);

  } catch (error) {

    console.error(
      "Location Search Error:",
      error
    );

    setSuggestions([]);

  }

};

    
  return (
  <div>

    <div className="relative mb-4">

      <input
        type="text"
        placeholder="Search location..."
        value={search}
        onChange={(e) =>
  setSearch(
    e.target.value
  )
}
        className="
        w-full
        bg-slate-900
        text-white
        border
        border-slate-700
        p-3
        rounded-xl
        placeholder:text-slate-400
        "
      />

      {suggestions.length > 0 && (

        <div
          className="
          absolute
          bg-slate-900
          border
          border-slate-700
          rounded-xl
          w-full
          max-h-60
          overflow-y-auto
          z-[9999]
          shadow-2xl
          "
        >

          {suggestions.map((item) => (

            <div
              key={item.place_id}
              className="
              p-3
              cursor-pointer
              text-white
              hover:bg-slate-800
              transition
              border-b
              border-slate-800
              "
              onClick={() => {

                const lat = parseFloat(
                  item.lat
                );

                const lng = parseFloat(
                  item.lon
                );

                setCenter([
                  lat,
                  lng,
                ]);

                setSelectedPosition([
                  lat,
                  lng,
                ]);

                onLocationSelect(
                  lat,
                  lng
                );

                setSearch(
                  item.display_name
                );

                setSuggestions([]);

              }}
            >

              {item.display_name}

            </div>

          ))}

        </div>

      )}

    </div>

    <MapContainer
      key={`${center[0]}-${center[1]}`}
      center={center}
      zoom={15}
      style={{
        height: "450px",
        width: "100%",
      }}
    >

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker
        selectedPosition={
          selectedPosition
        }
        onLocationSelect={(
          lat,
          lng
        ) => {

          setSelectedPosition([
            lat,
            lng,
          ]);

          onLocationSelect(
            lat,
            lng
          );

        }}
      />

    </MapContainer>

  </div>
);
}