const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Haversine formula to calculate distance in km between two lat/lng pairs
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
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

/**
 * Cloud Function Trigger: Runs whenever a new login attempt document is created in Firestore
 */
exports.detectAuthThreats = functions.firestore
  .document("loginAttempts/{attemptId}")
  .onCreate(async (snap, context) => {
    const attempt = snap.data();
    if (!attempt) return null;

    const { userId, email, timestamp, ip, location, status } = attempt;
    const deviceInfo = attempt.deviceInfo || attempt.device || "Unknown Device";
    const attemptTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp || Date.now());

    console.log(`Processing login attempt for ${email || userId} (Status: ${status})`);

    const alertsToCreate = [];
    let lockAccount = false;

    // -------------------------------------------------------------
    // RULE 1: BRUTE FORCE DETECTION
    // Query last 5 minutes of attempts for this email/userId where status="failed"
    // -------------------------------------------------------------
    try {
      const fiveMinsAgo = new Date(attemptTime.getTime() - 5 * 60 * 1000);
      let query = db
        .collection("loginAttempts")
        .where("status", "==", "failed")
        .where("timestamp", ">=", fiveMinsAgo);

      if (userId) {
        query = query.where("userId", "==", userId);
      } else if (email) {
        query = query.where("email", "==", email);
      }

      const failedSnap = await query.get();
      const failedCount = failedSnap.size;

      if (failedCount >= 5) {
        console.warn(`[THREAT DETECTED] Brute Force attack on ${email || userId}: ${failedCount} failures in 5 min`);
        alertsToCreate.push({
          userId: userId || null,
          email: email || "unknown",
          type: "brute_force",
          severity: "high",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: {
            failedCount,
            timeWindow: "5 minutes",
            targetEmail: email,
            lastIp: ip,
            reason: `${failedCount} consecutive failed login attempts detected within 5 minutes.`
          },
          resolved: false
        });
        lockAccount = true;
      }
    } catch (err) {
      console.error("Error evaluating Brute Force rule:", err);
    }

    // -------------------------------------------------------------
    // RULE 2: IMPOSSIBLE TRAVEL DETECTION (On successful login)
    // Compare current login location & timestamp with previous successful login
    // -------------------------------------------------------------
    if (status === "success" && location && location.lat && location.lng) {
      try {
        let prevQuery = db
          .collection("loginAttempts")
          .where("status", "==", "success")
          .where("timestamp", "<", attemptTime)
          .orderBy("timestamp", "desc")
          .limit(1);

        if (userId) {
          prevQuery = prevQuery.where("userId", "==", userId);
        } else if (email) {
          prevQuery = prevQuery.where("email", "==", email);
        }

        const prevSnap = await prevQuery.get();
        if (!prevSnap.empty) {
          const prevAttempt = prevSnap.docs[0].data();
          const prevLoc = prevAttempt.location;
          const prevTime = prevAttempt.timestamp?.toDate
            ? prevAttempt.timestamp.toDate()
            : new Date(prevAttempt.timestamp);

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
              // Threshold: implied speed > 800 km/h and distance > 50 km
              if (speedKmh > 800 && distanceKm > 50) {
                console.warn(
                  `[THREAT DETECTED] Impossible Travel for ${email}: ${Math.round(speedKmh)} km/h speed implied`
                );
                alertsToCreate.push({
                  userId: userId || null,
                  email: email || "unknown",
                  type: "impossible_travel",
                  severity: "high",
                  timestamp: admin.firestore.FieldValue.serverTimestamp(),
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
                    )} km away). Required travel speed: ${Math.round(speedKmh)} km/h.`
                  },
                  resolved: false
                });
                lockAccount = true;
              }
            }
          }
        }
      } catch (err) {
        console.error("Error evaluating Impossible Travel rule:", err);
      }
    }

    // -------------------------------------------------------------
    // RULE 3: NEW DEVICE DETECTION (On successful login)
    // Compare deviceInfo against user's knownDevices in Firestore
    // -------------------------------------------------------------
    if (status === "success" && userId) {
      try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const knownDevices = userData.knownDevices || [];
          const deviceStr = typeof deviceInfo === "string" ? deviceInfo : JSON.stringify(deviceInfo);

          const isKnown = knownDevices.some((d) =>
            typeof d === "string" ? d.includes(deviceStr) || deviceStr.includes(d) : d.raw === deviceStr
          );

          if (!isKnown) {
            console.warn(`[THREAT DETECTED] New Unrecognized Device for ${email}: ${deviceStr}`);
            alertsToCreate.push({
              userId: userId,
              email: email || userData.email || "unknown",
              type: "new_device",
              severity: "medium",
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              details: {
                device: deviceStr,
                ip: ip || "Unknown",
                location: location ? `${location.city || ""}, ${location.country || ""}` : "Unknown",
                reason: `Login detected from unrecognized device/browser signature: "${deviceStr}"`
              },
              resolved: false
            });

            // Automatically add device to knownDevices after user doc updated or auto-add
            await userRef.update({
              knownDevices: admin.firestore.FieldValue.arrayUnion(deviceStr)
            });
          }
        }
      } catch (err) {
        console.error("Error evaluating New Device rule:", err);
      }
    }

    // -------------------------------------------------------------
    // RULE 4: UNUSUAL TIME DETECTION
    // Check if login hour (0-23) falls outside standard range (1 AM - 5 AM)
    // -------------------------------------------------------------
    try {
      const loginHour = attemptTime.getHours();
      if (loginHour >= 1 && loginHour <= 5) {
        console.warn(`[THREAT DETECTED] Unusual Time Login for ${email}: ${loginHour}:00`);
        alertsToCreate.push({
          userId: userId || null,
          email: email || "unknown",
          type: "unusual_time",
          severity: "low",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: {
            hour: loginHour,
            formattedTime: attemptTime.toLocaleTimeString(),
            reason: `Login detected at unusual hour (${loginHour}:00 AM), outside typical user activity window.`
          },
          resolved: false
        });
      }
    } catch (err) {
      console.error("Error evaluating Unusual Time rule:", err);
    }

    // -------------------------------------------------------------
    // WRITE ALERTS & AUTO-RESPONSE
    // -------------------------------------------------------------
    const batch = db.batch();

    for (const alert of alertsToCreate) {
      const alertRef = db.collection("alerts").doc();
      batch.set(alertRef, alert);
    }

    if (lockAccount && userId) {
      const userRef = db.collection("users").doc(userId);
      batch.update(userRef, { locked: true, lockedReason: "Automated threat detection response (High Severity Alert)" });
    }

    if (alertsToCreate.length > 0 || lockAccount) {
      await batch.commit();
      console.log(`Created ${alertsToCreate.length} alert(s) and lockAccount=${lockAccount}`);
    }

    return null;
  });
