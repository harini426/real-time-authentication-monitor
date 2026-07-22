/**
 * Telemetry Service
 * Collects client IP address, geolocation (city, country, lat, lng), and browser/device fingerprint.
 */

export const getClientTelemetry = async () => {
  // 1. Device Info (Browser / OS)
  const userAgent = navigator.userAgent;
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (userAgent.includes("Firefox/")) {
    browser = `Firefox ${userAgent.split("Firefox/")[1].split(" ")[0]}`;
  } else if (userAgent.includes("Edg/")) {
    browser = `Edge ${userAgent.split("Edg/")[1].split(" ")[0]}`;
  } else if (userAgent.includes("Chrome/")) {
    browser = `Chrome ${userAgent.split("Chrome/")[1].split(" ")[0]}`;
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    browser = `Safari ${userAgent.split("Version/")[1]?.split(" ")[0] || ""}`;
  } else if (userAgent.includes("OPR/") || userAgent.includes("Opera/")) {
    browser = `Opera`;
  }

  if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

  const deviceInfo = `${browser} on ${os} (${window.screen.width}x${window.screen.height})`;

  // 2. Fetch IP and Geolocation
  let ip = "198.51.100.42";
  let location = {
    city: "San Francisco",
    country: "United States",
    lat: 37.7749,
    lng: -122.4194
  };

  try {
    const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      if (data.ip) ip = data.ip;
      if (data.city && data.country_name) {
        location = {
          city: data.city,
          country: data.country_name,
          lat: data.latitude || 37.7749,
          lng: data.longitude || -122.4194
        };
      }
    }
  } catch (err) {
    console.warn("IP Geolocation API primary call failed/timed out, trying fallback...", err);
    try {
      const fallbackRes = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(2000) });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.ip) ip = fallbackData.ip;
      }
    } catch (e) {
      console.warn("IP fallback call also failed, using default telemetry.", e);
    }
  }

  return {
    ip,
    location,
    deviceInfo,
    userAgent
  };
};

/**
 * Distance calculation utility using Haversine formula
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
