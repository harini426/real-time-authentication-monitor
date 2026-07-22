import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Zap, X, ShieldAlert, AlertTriangle, Compass, Laptop, Clock, CheckCircle2 } from "lucide-react";

export function AttackSimulatorModal({ onClose }) {
  const { recordLoginAttempt } = useAuth();
  const [runningAttack, setRunningAttack] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  /**
   * 1. Simulate Brute Force Attack
   */
  const handleSimulateBruteForce = async () => {
    setRunningAttack("brute_force");
    setStatusMessage("Launching 5 rapid failed login bursts for target.user@corp.internal...");

    for (let i = 1; i <= 5; i++) {
      await recordLoginAttempt({
        userId: "user_target_victim",
        email: "target.user@corp.internal",
        status: "failed",
        ip: "185.220.101.5",
        device: "Python-urllib/3.10 (Botnet Scanner)",
        location: { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 }
      });
      await new Promise((res) => setTimeout(res, 300));
    }

    setStatusMessage("⚡ Brute Force attack executed! High-severity alert triggered and target account automatically locked.");
    setRunningAttack(null);
  };

  /**
   * 2. Simulate Impossible Travel Attack
   */
  const handleSimulateImpossibleTravel = async () => {
    setRunningAttack("impossible_travel");
    setStatusMessage("Simulating initial login from San Francisco, USA...");

    // Step A: San Francisco Login
    await recordLoginAttempt({
      userId: "user_alex_dev",
      email: "alex.cyber@company.com",
      status: "success",
      ip: "198.51.100.42",
      device: "Chrome 126.0 (Macintosh)",
      location: { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 }
    });

    await new Promise((res) => setTimeout(res, 1000));
    setStatusMessage("Simulating instant subsequent login from Tokyo, Japan (8,270 km away)...");

    // Step B: Tokyo Login 1 minute later
    await recordLoginAttempt({
      userId: "user_alex_dev",
      email: "alex.cyber@company.com",
      status: "success",
      ip: "203.0.113.195",
      device: "Chrome 126.0 (Macintosh)",
      location: { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 }
    });

    setStatusMessage("✈️ Impossible Travel anomaly executed! Speed (>49,000 km/h) detected & high-severity alert created!");
    setRunningAttack(null);
  };

  /**
   * 3. Simulate New Device Fingerprint
   */
  const handleSimulateNewDevice = async () => {
    setRunningAttack("new_device");
    setStatusMessage("Simulating login from unrecognized browser signature (Opera 109 on Linux)...");

    await recordLoginAttempt({
      userId: "user_sarah_admin",
      email: "admin@soc.io",
      status: "success",
      ip: "103.21.244.0",
      device: "Opera 109.0 (Linux x86_64; Ubuntu 24.04)",
      location: { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 }
    });

    setStatusMessage("💻 Unrecognized Device signature detected! Medium-severity alert created.");
    setRunningAttack(null);
  };

  /**
   * 4. Simulate Unusual Operating Time
   */
  const handleSimulateUnusualTime = async () => {
    setRunningAttack("unusual_time");
    setStatusMessage("Simulating authentication attempt forced at 03:14 AM local time...");

    const lateNightDate = new Date();
    lateNightDate.setHours(3, 14, 0, 0);

    await recordLoginAttempt({
      userId: "user_alex_dev",
      email: "alex.cyber@company.com",
      timestamp: lateNightDate.toISOString(),
      status: "success",
      ip: "82.165.197.1",
      device: "Chrome 126.0 (Macintosh)",
      location: { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 }
    });

    setStatusMessage("🌙 Off-Hours Anomaly detected! Low-severity alert created.");
    setRunningAttack(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel p-6 border-red-500/30 relative shadow-2xl animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg glass-card transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cyber Attack Simulation Suite</h2>
            <p className="text-xs text-slate-400">
              Trigger live simulated security threats to demonstrate the real-time detection engine & SOC dashboard.
            </p>
          </div>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div className="mb-6 p-3.5 rounded-xl glass-card bg-indigo-500/10 border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Simulation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Card 1: Brute Force */}
          <div className="p-4 rounded-xl glass-card border-red-500/20 hover:border-red-500/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">High Severity</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">⚡ Brute Force Attack</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Fires 5 rapid failed login attempts within seconds. Triggers automated high-severity alert and locks the target account.
              </p>
            </div>
            <button
              onClick={handleSimulateBruteForce}
              disabled={Boolean(runningAttack)}
              className="w-full py-2 px-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold hover:bg-red-500/30 transition flex items-center justify-center space-x-1.5"
            >
              <span>{runningAttack === "brute_force" ? "Executing Bursts..." : "Launch Brute Force"}</span>
            </button>
          </div>

          {/* Card 2: Impossible Travel */}
          <div className="p-4 rounded-xl glass-card border-red-500/20 hover:border-red-500/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">High Severity</span>
                <Compass className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">✈️ Impossible Travel</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Logins from San Francisco then Tokyo 10 seconds later (8,270 km away). Triggers speed check (&gt;800 km/h limit).
              </p>
            </div>
            <button
              onClick={handleSimulateImpossibleTravel}
              disabled={Boolean(runningAttack)}
              className="w-full py-2 px-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold hover:bg-red-500/30 transition flex items-center justify-center space-x-1.5"
            >
              <span>{runningAttack === "impossible_travel" ? "Calculating Telemetry..." : "Launch Impossible Travel"}</span>
            </button>
          </div>

          {/* Card 3: New Device */}
          <div className="p-4 rounded-xl glass-card border-amber-500/20 hover:border-amber-500/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Medium Severity</span>
                <Laptop className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">💻 Unrecognized Device</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Logins from an unknown device signature (Opera on Linux). Flags new device fingerprinting anomaly.
              </p>
            </div>
            <button
              onClick={handleSimulateNewDevice}
              disabled={Boolean(runningAttack)}
              className="w-full py-2 px-3 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold hover:bg-amber-500/30 transition flex items-center justify-center space-x-1.5"
            >
              <span>{runningAttack === "new_device" ? "Fingerprinting..." : "Trigger New Device"}</span>
            </button>
          </div>

          {/* Card 4: Unusual Time */}
          <div className="p-4 rounded-xl glass-card border-cyan-500/20 hover:border-cyan-500/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Low Severity</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">🌙 Off-Hours Anomaly</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Triggers an authentication event forced at 03:14 AM outside standard user activity windows.
              </p>
            </div>
            <button
              onClick={handleSimulateUnusualTime}
              disabled={Boolean(runningAttack)}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 transition flex items-center justify-center space-x-1.5"
            >
              <span>{runningAttack === "unusual_time" ? "Injecting Time..." : "Trigger Off-Hours Login"}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
}
