/**
 * Seed & Demo Data Generator Script
 * Generates sample users, historical login attempts, and triggers demo threat events.
 */

const fs = require('fs');
const path = require('path');

const sampleUsers = [
  {
    id: "user_alex_dev",
    email: "alex.cyber@company.com",
    name: "Alex Mercer",
    role: "SecOps Lead",
    locked: false,
    knownDevices: [
      "Chrome 126.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "Firefox 125.0 (Windows NT 10.0; Win64; x64)"
    ],
    knownLocations: [
      { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
      { city: "New York", country: "United States", lat: 40.7128, lng: -74.006 }
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user_sarah_admin",
    email: "admin@soc.io",
    name: "Sarah Jenkins",
    role: "admin",
    locked: false,
    knownDevices: [
      "Chrome 126.0 (Windows NT 10.0; Win64; x64)"
    ],
    knownLocations: [
      { city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 }
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user_target_victim",
    email: "target.user@corp.internal",
    name: "Target Victim Account",
    role: "Analyst",
    locked: true,
    lockedReason: "Account automatically locked due to High Severity Brute Force Threat",
    knownDevices: [
      "Safari 17.4 (Macintosh; Intel Mac OS X 14_4_1)"
    ],
    knownLocations: [
      { city: "Austin", country: "United States", lat: 30.2672, lng: -97.7431 }
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const sampleLoginAttempts = [
  // 1. Success login from SF
  {
    id: "attempt_001",
    userId: "user_alex_dev",
    email: "alex.cyber@company.com",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    ip: "198.51.100.42",
    device: "Chrome 126.0 (Macintosh; Intel Mac OS X 10_15_7)",
    location: { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
    status: "success"
  },
  // 2. Impossible Travel attempt: Tokyo 10 mins after SF
  {
    id: "attempt_002",
    userId: "user_alex_dev",
    email: "alex.cyber@company.com",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    ip: "203.0.113.195",
    device: "Chrome 126.0 (Macintosh; Intel Mac OS X 10_15_7)",
    location: { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
    status: "success"
  },
  // 3. Brute Force series (5 rapid failures)
  {
    id: "attempt_bf1",
    userId: "user_target_victim",
    email: "target.user@corp.internal",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    ip: "185.220.101.5",
    device: "Python-urllib/3.10 (Bot/Scanner)",
    location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    status: "failed"
  },
  {
    id: "attempt_bf2",
    userId: "user_target_victim",
    email: "target.user@corp.internal",
    timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    ip: "185.220.101.5",
    device: "Python-urllib/3.10 (Bot/Scanner)",
    location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    status: "failed"
  },
  {
    id: "attempt_bf3",
    userId: "user_target_victim",
    email: "target.user@corp.internal",
    timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    ip: "185.220.101.5",
    device: "Python-urllib/3.10 (Bot/Scanner)",
    location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    status: "failed"
  },
  {
    id: "attempt_bf4",
    userId: "user_target_victim",
    email: "target.user@corp.internal",
    timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    ip: "185.220.101.5",
    device: "Python-urllib/3.10 (Bot/Scanner)",
    location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    status: "failed"
  },
  {
    id: "attempt_bf5",
    userId: "user_target_victim",
    email: "target.user@corp.internal",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    ip: "185.220.101.5",
    device: "Python-urllib/3.10 (Bot/Scanner)",
    location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    status: "failed"
  },
  // 4. Unusual Time (3:14 AM)
  {
    id: "attempt_ut1",
    userId: "user_sarah_admin",
    email: "admin@soc.io",
    timestamp: new Date(new Date().setHours(3, 14, 0, 0)).toISOString(),
    ip: "82.165.197.1",
    device: "Chrome 126.0 (Windows NT 10.0; Win64; x64)",
    location: { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
    status: "success"
  },
  // 5. New Device
  {
    id: "attempt_nd1",
    userId: "user_sarah_admin",
    email: "admin@soc.io",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    ip: "103.21.244.0",
    device: "Opera 109.0 (Linux x86_64; Ubuntu)",
    location: { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
    status: "success"
  }
];

const sampleAlerts = [
  {
    id: "alert_001",
    userId: "user_alex_dev",
    email: "alex.cyber@company.com",
    type: "impossible_travel",
    severity: "high",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    details: {
      distanceKm: 8270,
      timeDiffMinutes: 10,
      impliedSpeedKmh: 49620,
      fromLocation: "San Francisco, United States",
      toLocation: "Tokyo, Japan",
      reason: "Authentication from Tokyo, Japan occurred 10 mins after San Francisco, United States (8,270 km away). Implied travel speed: 49,620 km/h."
    },
    resolved: false
  },
  {
    id: "alert_002",
    userId: "user_target_victim",
    email: "target.user@corp.internal",
    type: "brute_force",
    severity: "high",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    details: {
      failedCount: 5,
      timeWindow: "5 minutes",
      targetEmail: "target.user@corp.internal",
      lastIp: "185.220.101.5",
      reason: "5 consecutive failed login attempts detected within 5 minutes."
    },
    resolved: false
  },
  {
    id: "alert_003",
    userId: "user_sarah_admin",
    email: "admin@soc.io",
    type: "new_device",
    severity: "medium",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    details: {
      device: "Opera 109.0 (Linux x86_64; Ubuntu)",
      ip: "103.21.244.0",
      location: "Sydney, Australia",
      reason: "Login detected from unrecognized device signature: Opera 109.0 on Linux x86_64."
    },
    resolved: false
  },
  {
    id: "alert_004",
    userId: "user_sarah_admin",
    email: "admin@soc.io",
    type: "unusual_time",
    severity: "low",
    timestamp: new Date(new Date().setHours(3, 14, 0, 0)).toISOString(),
    details: {
      hour: 3,
      formattedTime: "03:14:00 AM",
      reason: "Login detected at unusual hour (03:14 AM), outside typical user activity window."
    },
    resolved: true
  }
];

console.log("=== REAL-TIME AUTH MONITORING SEED DATA GENERATOR ===");
console.log(`Generated ${sampleUsers.length} sample users.`);
console.log(`Generated ${sampleLoginAttempts.length} sample login attempts.`);
console.log(`Generated ${sampleAlerts.length} sample threat alerts.`);

const exportPath = path.join(__dirname, 'seed-data.json');
fs.writeFileSync(exportPath, JSON.stringify({
  users: sampleUsers,
  loginAttempts: sampleLoginAttempts,
  alerts: sampleAlerts
}, null, 2));

console.log(`Saved seed JSON dataset to: ${exportPath}`);
console.log("Data can be seeded to live Firestore or loaded in demo frontend mode.");
