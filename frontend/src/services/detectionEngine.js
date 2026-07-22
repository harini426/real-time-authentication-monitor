import { calculateHaversineDistance } from "./telemetryService";

/**
 * Client & Standalone Detection Engine
 * Evaluates a new login attempt against threat rules and returns generated alerts & account lock state.
 */
export function evaluateLoginAttempt(newAttempt, allAttempts = [], user = null) {
  const alertsToCreate = [];
  let lockAccount = false;

  const { userId, email, timestamp, ip, location, status, device, deviceInfo } = newAttempt;
  const deviceStr = typeof deviceInfo === "string" ? deviceInfo : (device || "Unknown Device");
  const attemptTime = new Date(timestamp);

  // -------------------------------------------------------------
  // 1. BRUTE FORCE DETECTION
  // Rule: >= 5 failed attempts within last 5 minutes for target email/userId
  // -------------------------------------------------------------
  const fiveMinsAgo = new Date(attemptTime.getTime() - 5 * 60 * 1000);
  const recentFailures = allAttempts.filter((a) => {
    const aTime = new Date(a.timestamp);
    const sameUser = (userId && a.userId === userId) || (email && a.email === email);
    return sameUser && a.status === "failed" && aTime >= fiveMinsAgo && aTime <= attemptTime;
  });

  // Including current attempt if it's failed
  const totalFailedCount = status === "failed"
    ? recentFailures.length + (recentFailures.some((f) => f.id === newAttempt.id) ? 0 : 1)
    : recentFailures.length;

  if (totalFailedCount >= 5) {
    alertsToCreate.push({
      id: `alert_bf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || null,
      email: email || "unknown",
      type: "brute_force",
      severity: "high",
      timestamp: new Date().toISOString(),
      details: {
        failedCount: totalFailedCount,
        timeWindow: "5 minutes",
        targetEmail: email,
        lastIp: ip,
        reason: `${totalFailedCount} consecutive failed login attempts detected within 5 minutes.`
      },
      resolved: false
    });
    lockAccount = true;
  }

  // -------------------------------------------------------------
  // 2. IMPOSSIBLE TRAVEL DETECTION (On successful login)
  // Rule: Implied travel speed > 800 km/h & distance > 50 km between consecutive logins
  // -------------------------------------------------------------
  if (status === "success" && location && location.lat && location.lng) {
    // Find most recent previous successful login for user
    const previousSuccessfulLogins = allAttempts
      .filter((a) => {
        const sameUser = (userId && a.userId === userId) || (email && a.email === email);
        const aTime = new Date(a.timestamp);
        return sameUser && a.status === "success" && aTime < attemptTime && a.id !== newAttempt.id;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (previousSuccessfulLogins.length > 0) {
      const prevAttempt = previousSuccessfulLogins[0];
      const prevLoc = prevAttempt.location;
      const prevTime = new Date(prevAttempt.timestamp);

      if (prevLoc && prevLoc.lat && prevLoc.lng) {
        const distanceKm = calculateHaversineDistance(
          prevLoc.lat,
          prevLoc.lng,
          location.lat,
          location.lng
        );
        const timeDiffHours = (attemptTime.getTime() - prevTime.getTime()) / (1000 * 3600);

        if (timeDiffHours > 0) {
          const speedKmh = distanceKm / timeDiffHours;
          if (speedKmh > 800 && distanceKm > 50) {
            alertsToCreate.push({
              id: `alert_it_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              userId: userId || null,
              email: email || "unknown",
              type: "impossible_travel",
              severity: "high",
              timestamp: new Date().toISOString(),
              details: {
                distanceKm: Math.round(distanceKm),
                timeDiffMinutes: Math.round(timeDiffHours * 60),
                impliedSpeedKmh: Math.round(speedKmh),
                fromLocation: `${prevLoc.city || "Unknown"}, ${prevLoc.country || "Unknown"}`,
                toLocation: `${location.city || "Unknown"}, ${location.country || "Unknown"}`,
                reason: `Authentication from ${location.city}, ${location.country} occurred ${Math.round(
                  timeDiffHours * 60
                )} mins after ${prevLoc.city}, ${prevLoc.country} (${Math.round(
                  distanceKm
                )} km away). Required speed: ${Math.round(speedKmh)} km/h.`
              },
              resolved: false
            });
            lockAccount = true;
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 3. NEW DEVICE DETECTION (On successful login)
  // Rule: Unrecognized device fingerprint compared to user's knownDevices
  // -------------------------------------------------------------
  if (status === "success" && user) {
    const knownDevices = user.knownDevices || [];
    const isKnown = knownDevices.some((d) =>
      typeof d === "string" ? d.toLowerCase().includes(deviceStr.toLowerCase()) || deviceStr.toLowerCase().includes(d.toLowerCase()) : false
    );

    if (!isKnown) {
      alertsToCreate.push({
        id: `alert_nd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: userId || user.id,
        email: email || user.email,
        type: "new_device",
        severity: "medium",
        timestamp: new Date().toISOString(),
        details: {
          device: deviceStr,
          ip: ip || "Unknown",
          location: location ? `${location.city || ""}, ${location.country || ""}` : "Unknown",
          reason: `Login detected from unrecognized device signature: "${deviceStr}"`
        },
        resolved: false
      });
    }
  }

  // -------------------------------------------------------------
  // 4. UNUSUAL TIME DETECTION
  // Rule: Login hour between 1 AM and 5 AM
  // -------------------------------------------------------------
  const loginHour = attemptTime.getHours();
  if (loginHour >= 1 && loginHour <= 5) {
    alertsToCreate.push({
      id: `alert_ut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || null,
      email: email || "unknown",
      type: "unusual_time",
      severity: "low",
      timestamp: new Date().toISOString(),
      details: {
        hour: loginHour,
        formattedTime: attemptTime.toLocaleTimeString(),
        reason: `Login detected at unusual hour (${loginHour}:00 AM), outside typical user activity window.`
      },
      resolved: false
    });
  }

  return {
    alertsToCreate,
    lockAccount
  };
}
