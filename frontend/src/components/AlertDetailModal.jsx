import React from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, AlertTriangle, CheckCircle, Lock, Unlock, X, MapPin, Laptop, Clock, Activity, Compass } from "lucide-react";

export function AlertDetailModal({ alert, onClose }) {
  const { resolveAlert, toggleUserLock, usersList } = useAuth();

  if (!alert) return null;

  const targetUser = usersList.find((u) => u.email === alert.email || u.id === alert.userId);
  const isLocked = targetUser ? targetUser.locked : false;

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case "high":
        return "glow-severity-high text-red-200 border-red-500/40";
      case "medium":
        return "glow-severity-medium text-amber-200 border-amber-500/40";
      default:
        return "glow-severity-low text-cyan-200 border-cyan-500/40";
    }
  };

  const formatType = (t) => {
    switch (t) {
      case "brute_force":
        return "⚡ Brute Force Attack";
      case "impossible_travel":
        return "✈️ Impossible Travel Velocity Anomaly";
      case "new_device":
        return "💻 Unrecognized Device Signature";
      case "unusual_time":
        return "🌙 Off-Hours Anomaly";
      default:
        return t;
    }
  };

  const handleResolve = () => {
    resolveAlert(alert.id);
  };

  const handleToggleLock = () => {
    if (targetUser) {
      toggleUserLock(targetUser.id, !isLocked, `Manual action from alert detail (${alert.type})`);
    } else if (alert.email) {
      toggleUserLock(alert.email, !isLocked, `Manual action from alert detail (${alert.type})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel p-6 border-white/20 relative shadow-2xl animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg glass-card transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className={`p-3 rounded-2xl border ${getSeverityStyle(alert.severity)}`}>
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                alert.severity === "high" ? "bg-red-500/20 text-red-300 border border-red-500/40" :
                alert.severity === "medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              }`}>
                {alert.severity} SEVERITY
              </span>
              {alert.resolved ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Resolved
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-ping" /> Active Threat
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{formatType(alert.type)}</h2>
            <p className="text-xs text-slate-400">Target User: {alert.email}</p>
          </div>
        </div>

        {/* Threat Diagnostics Grid */}
        <div className="space-y-4 mb-6">
          
          {/* Reason Card */}
          <div className="p-4 rounded-xl glass-card bg-white/5 border-white/10">
            <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Detection Reason & Analysis</span>
            </div>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              {alert.details?.reason || "Anomaly triggered by real-time threat detection rule engine."}
            </p>
          </div>

          {/* Specific Diagnostics per Threat Type */}
          {alert.type === "impossible_travel" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl glass-card bg-black/20">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Implied Travel Speed</div>
                <div className="text-lg font-bold text-red-400 font-mono mt-0.5">
                  {alert.details?.impliedSpeedKmh?.toLocaleString() || "N/A"} <span className="text-xs text-slate-300">km/h</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">&gt; 800 km/h velocity limit</div>
              </div>
              <div className="p-3 rounded-xl glass-card bg-black/20">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Distance Delta</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                  {alert.details?.distanceKm?.toLocaleString() || "N/A"} <span className="text-xs text-slate-300">km</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Haversine geodesics</div>
              </div>
              <div className="p-3 rounded-xl glass-card bg-black/20 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Time Elapsed</div>
                <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                  {alert.details?.timeDiffMinutes} <span className="text-xs text-slate-300">mins</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Between logins</div>
              </div>
            </div>
          )}

          {alert.type === "brute_force" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl glass-card bg-black/20">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Failed Attempt Count</div>
                <div className="text-xl font-bold text-red-400 font-mono">{alert.details?.failedCount} Bursts</div>
              </div>
              <div className="p-3 rounded-xl glass-card bg-black/20">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Attacker IP Address</div>
                <div className="text-sm font-bold text-indigo-300 font-mono mt-1">{alert.details?.lastIp || "N/A"}</div>
              </div>
            </div>
          )}

          {/* Telemetry Metadata Table */}
          <div className="p-4 rounded-xl glass-card bg-black/30 text-xs space-y-2 font-mono">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">Alert ID:</span>
              <span className="text-slate-300">{alert.id}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-300">{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
            {alert.details?.fromLocation && (
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Previous Origin:</span>
                <span className="text-indigo-300">{alert.details.fromLocation}</span>
              </div>
            )}
            {alert.details?.toLocation && (
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Current Destination:</span>
                <span className="text-red-300">{alert.details.toLocation}</span>
              </div>
            )}
            {alert.details?.device && (
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Device Signature:</span>
                <span className="text-slate-300 truncate max-w-xs">{alert.details.device}</span>
              </div>
            )}
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={handleToggleLock}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              isLocked
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock Target User Account</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Lock Target User Account</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-3">
            {!alert.resolved && (
              <button
                onClick={handleResolve}
                className="glass-button-primary px-4 py-2.5 text-xs flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Alert Resolved</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-card text-xs font-medium text-slate-300 hover:text-white"
            >
              Close Diagnostics
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
