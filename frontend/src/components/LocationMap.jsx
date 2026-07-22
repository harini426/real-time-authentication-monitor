import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icon asset issue in React
const customMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function LocationMap({ loginAttempts }) {
  // Extract unique valid locations with coordinates
  const locationMap = new Map();

  loginAttempts.forEach((attempt) => {
    const loc = attempt.location;
    if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
      const key = `${loc.city || "Unknown"}_${loc.country || "Unknown"}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          city: loc.city || "Unknown City",
          country: loc.country || "Unknown Country",
          lat: loc.lat,
          lng: loc.lng,
          attemptsCount: 1,
          lastAttempt: attempt
        });
      } else {
        const item = locationMap.get(key);
        item.attemptsCount += 1;
      }
    }
  });

  const locations = Array.from(locationMap.values());
  const defaultCenter = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [20, 0];

  return (
    <div className="w-full h-72 rounded-xl overflow-hidden relative border border-white/10 shadow-inner">
      <MapContainer
        center={defaultCenter}
        zoom={2}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {locations.map((loc, idx) => (
          <Marker
            key={idx}
            position={[loc.lat, loc.lng]}
            icon={customMarkerIcon}
          >
            <Popup>
              <div className="p-1 text-xs">
                <div className="font-bold text-white mb-1">
                  📍 {loc.city}, {loc.country}
                </div>
                <div className="text-slate-300">
                  Authentication Events: <span className="font-semibold text-indigo-400">{loc.attemptsCount}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Last: {loc.lastAttempt.email} ({loc.lastAttempt.status})
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
