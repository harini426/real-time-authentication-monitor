import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Zap, Lock, LogOut, UserCheck, ShieldAlert, Cpu } from "lucide-react";

export function Navbar({ onOpenSimulator, activeTab, setActiveTab }) {
  const { currentUser, role, setRole, logout, alerts } = useAuth();

  const unresolvedHighAlerts = alerts.filter((a) => !a.resolved && a.severity === "high").length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel rounded-none border-x-0 border-t-0 border-b-white/10 px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Branding */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 text-white shadow-lg shadow-indigo-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base tracking-wide">SOC Threat Sentinel</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE STREAM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Real-Time Authentication Monitoring & Threat Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 pl-6 border-l border-white/10">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              SOC Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "users"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              User Access Control
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Attack Simulator Button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/40 text-red-200 text-xs font-bold hover:from-red-500/30 hover:to-amber-500/30 transition shadow-lg shadow-red-500/10 animate-pulse-glow"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Launch Cyber Attack Simulator</span>
          </button>

          {/* Unresolved High Threat Indicator */}
          {unresolvedHighAlerts > 0 && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
              <span>{unresolvedHighAlerts} High Threat(s)</span>
            </div>
          )}

          {/* User & Role Badge */}
          <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1.5">
                <span>{currentUser?.name || currentUser?.email || "SecOps Lead"}</span>
                {currentUser?.locked && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40">LOCKED</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">{role} Role</div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl glass-card hover:bg-red-500/20 hover:border-red-500/30 text-slate-300 hover:text-red-300 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
