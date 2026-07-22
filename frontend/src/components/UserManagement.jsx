import React from "react";
import { useAuth } from "../context/AuthContext";
import { Users, Lock, Unlock, Shield, Laptop, MapPin, CheckCircle, AlertTriangle } from "lucide-react";

export function UserManagement() {
  const { usersList, toggleUserLock } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>User Access & Identity Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor user security posture, registered device signatures, known geolocation origins, and account lock states.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl glass-card bg-indigo-500/10 border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          {usersList.length} Accounts Enrolled
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usersList.map((usr) => (
          <div
            key={usr.id || usr.email}
            className={`glass-card p-5 border flex flex-col justify-between transition ${
              usr.locked ? "border-red-500/40 bg-red-500/5 shadow-red-500/10" : "border-white/10"
            }`}
          >
            <div>
              {/* User Card Top */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{usr.name || usr.email.split("@")[0]}</h3>
                  <p className="text-xs text-indigo-300 font-mono">{usr.email}</p>
                </div>
                {usr.locked ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>ACTIVE</span>
                  </span>
                )}
              </div>

              {/* Role & Lock Reason */}
              <div className="text-xs space-y-1 mb-4">
                <div className="text-slate-400">
                  Role: <span className="text-white font-medium capitalize">{usr.role || "SecOps Analyst"}</span>
                </div>
                {usr.lockedReason && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px]">
                    <span className="font-semibold block">Lock Reason:</span>
                    <span>{usr.lockedReason}</span>
                  </div>
                )}
              </div>

              {/* Known Devices */}
              <div className="mb-3 pt-3 border-t border-white/5">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Trusted Device Fingerprints ({usr.knownDevices?.length || 0})</span>
                </div>
                <div className="space-y-1">
                  {(usr.knownDevices || []).slice(0, 2).map((dev, i) => (
                    <div key={i} className="text-[10px] font-mono text-slate-300 bg-black/30 p-1.5 rounded truncate">
                      {typeof dev === "string" ? dev : JSON.stringify(dev)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Locations */}
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Known Geolocation Origins</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(usr.knownLocations || []).map((loc, idx) => (
                    <span key={idx} className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                      {loc.city}, {loc.country}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => toggleUserLock(usr.id || usr.email, !usr.locked, "Manual Administrative Toggle")}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                  usr.locked
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                    : "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                }`}
              >
                {usr.locked ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Account Access</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Lock Account Access</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
