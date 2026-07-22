import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Mail, User, AlertTriangle, Cpu, Globe, CheckCircle2 } from "lucide-react";

export function AuthPage() {
  const { login, signup, demoLogin, activeTelemetry } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Glow Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 z-10">
        
        {/* Left Info Panel */}
        <div className="md:col-span-5 glass-panel p-8 flex flex-col justify-between border-white/10">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 glass-card bg-indigo-500/20 border-indigo-500/40 text-indigo-400 rounded-xl">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">SOC Threat Engine</h1>
                <p className="text-xs text-slate-400">Real-Time Authentication Monitoring</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Enterprise security platform with automated threat detection for brute force attacks, impossible travel velocity, unrecognized devices, and anomaly patterns.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg glass-card text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Haversine Speed Velocity Checks (&gt;800 km/h)</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg glass-card text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>5-Min Brute Force Burst Sliders</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg glass-card text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Device Fingerprinting & Auto Account Lock</span>
              </div>
            </div>
          </div>

          {/* Active Telemetry Card */}
          {activeTelemetry && (
            <div className="mt-8 pt-4 border-t border-white/10 text-xs">
              <div className="text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detected Client Telemetry</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg space-y-1 font-mono text-[11px] text-slate-300">
                <div><span className="text-slate-500">IP:</span> {activeTelemetry.ip}</div>
                <div><span className="text-slate-500">LOC:</span> {activeTelemetry.location?.city}, {activeTelemetry.location?.country}</div>
                <div className="truncate"><span className="text-slate-500">DEV:</span> {activeTelemetry.deviceInfo}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 glass-panel p-8 flex flex-col justify-center border-white/15">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLoginMode ? "Sign In to Console" : "Create SecOps Account"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError("");
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              {isLoginMode ? "Need an account? Sign Up" : "Existing user? Sign In"}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl glass-card glow-severity-high border-red-500/40 text-red-200 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@soc.io"
                  className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full glass-button-primary py-3 text-sm flex items-center justify-center space-x-2 mt-2"
            >
              {submitting ? (
                <span>Authenticating Telemetry...</span>
              ) : (
                <>
                  <span>{isLoginMode ? "Authenticate & Enter Dashboard" : "Create SecOps Profile"}</span>
                  <Lock className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 mb-3 text-center uppercase tracking-wider font-semibold">
              ⚡ Quick Demo Profiles (One-Click Launch)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => demoLogin("admin")}
                className="p-2.5 rounded-xl glass-card hover:border-indigo-400 text-left transition"
              >
                <div className="text-xs font-semibold text-white">Sarah Jenkins</div>
                <div className="text-[10px] text-indigo-300">SecOps Admin (admin@soc.io)</div>
              </button>
              <button
                type="button"
                onClick={() => demoLogin("secops")}
                className="p-2.5 rounded-xl glass-card hover:border-indigo-400 text-left transition"
              >
                <div className="text-xs font-semibold text-white">Alex Mercer</div>
                <div className="text-[10px] text-cyan-300">SecOps Analyst (alex.cyber@company.com)</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
