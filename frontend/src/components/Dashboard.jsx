import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  ShieldAlert, 
  Activity, 
  UserX, 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Filter, 
  Eye, 
  ChevronRight,
  TrendingUp,
  Server
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from "recharts";
import { LocationMap } from "./LocationMap";
import { AlertDetailModal } from "./AlertDetailModal";

export function Dashboard() {
  const { loginAttempts, alerts, usersList, resolveAlert } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");

  // Metrics Calculations
  const totalLogins = loginAttempts.length;
  const failedLogins = loginAttempts.filter((a) => a.status === "failed").length;
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const lockedUsersCount = usersList.filter((u) => u.locked).length;

  const uniqueLocationsSet = new Set(
    loginAttempts
      .map((a) => (a.location ? `${a.location.city || ""}, ${a.location.country || ""}` : null))
      .filter(Boolean)
  );
  const uniqueLocationsCount = uniqueLocationsSet.size;

  // Recharts Data Prep: Login Activity Over Time
  const attemptsByHour = {};
  loginAttempts.forEach((att) => {
    const time = new Date(att.timestamp);
    const hourLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!attemptsByHour[hourLabel]) {
      attemptsByHour[hourLabel] = { time: hourLabel, success: 0, failed: 0 };
    }
    if (att.status === "success") attemptsByHour[hourLabel].success += 1;
    else attemptsByHour[hourLabel].failed += 1;
  });
  const chartData = Object.values(attemptsByHour).reverse().slice(-12);

  // Severity Distribution Data
  const severityCounts = {
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length
  };
  const severityChartData = [
    { name: "High Severity", count: severityCounts.high, color: "#ef4444" },
    { name: "Medium Severity", count: severityCounts.medium, color: "#f59e0b" },
    { name: "Low Severity", count: severityCounts.low, color: "#06b6d4" }
  ];

  // Filtered Alerts
  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === "all") return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Logins */}
        <div className="glass-card p-4 border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Logins</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{totalLogins}</div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Real-time Stream</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Failed Attempts */}
        <div className="glass-card p-4 border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed Attempts</div>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{failedLogins}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {totalLogins > 0 ? `${Math.round((failedLogins / totalLogins) * 100)}% Failure Rate` : '0%'}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Active Threat Alerts */}
        <div className="glass-card p-4 border-red-500/30 bg-red-500/5 glow-severity-high flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-red-300 uppercase tracking-wider">Active Threats</div>
            <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{activeAlerts.length}</div>
            <div className="text-[10px] text-red-300 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              <span>Requires SecOps Action</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Unique Locations */}
        <div className="glass-card p-4 border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unique Locations</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{uniqueLocationsCount}</div>
            <div className="text-[10px] text-cyan-300 mt-1">Geographic Origins</div>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        {/* Locked Accounts */}
        <div className="glass-card p-4 border-white/10 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Lockouts</div>
            <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">{lockedUsersCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Automated Auto-Lock</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <UserX className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Timeline Chart (8 Cols) */}
        <div className="lg:col-span-8 glass-panel p-6 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <span>Authentication Activity Timeline</span>
              </h3>
              <p className="text-xs text-slate-400">Real-time breakdown of Successful vs Failed authentications</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Success
              </span>
              <span className="flex items-center gap-1.5 text-red-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Failed
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: "0.75rem",
                    backdropFilter: "blur(12px)",
                    color: "#fff"
                  }}
                />
                <Area type="monotone" dataKey="success" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Chart (4 Cols) */}
        <div className="lg:col-span-4 glass-panel p-6 border-white/10">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Threat Severity Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of active and historic alerts</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: "0.75rem",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. ALERTS & LIVE FEED ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-time Threat Alerts Feed (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span>Live Threat Alerts</span>
                </h3>
                <p className="text-xs text-slate-400">Real-time detection engine findings</p>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center space-x-1 glass-card p-1 rounded-lg">
                <button
                  onClick={() => setSeverityFilter("all")}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    severityFilter === "all" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSeverityFilter("high")}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    severityFilter === "high" ? "bg-red-500/30 text-red-300" : "text-slate-400 hover:text-white"
                  }`}
                >
                  High
                </button>
                <button
                  onClick={() => setSeverityFilter("medium")}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    severityFilter === "medium" ? "bg-amber-500/30 text-amber-300" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Med
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs glass-card">
                  No threat alerts found matching current filter.
                </div>
              ) : (
                filteredAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`glass-card p-4 rounded-xl cursor-pointer border transition ${
                      alt.severity === "high"
                        ? "glow-severity-high"
                        : alt.severity === "medium"
                        ? "glow-severity-medium"
                        : "glow-severity-low"
                    } ${alt.resolved ? "opacity-60" : ""}`}
                    onClick={() => setSelectedAlert(alt)}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          alt.severity === "high" ? "bg-red-500/20 text-red-300 border border-red-500/40" :
                          alt.severity === "medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                          "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        }`}>
                          {alt.severity}
                        </span>
                        <span className="text-xs font-bold text-white capitalize">
                          {alt.type.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(alt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                      {alt.details?.reason || "Anomaly flagged by detection engine."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                      <span className="text-indigo-300 font-mono">{alt.email}</span>
                      <div className="flex items-center space-x-2">
                        {!alt.resolved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveAlert(alt.id);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
                          >
                            Resolve
                          </button>
                        )}
                        <span className="text-slate-400 flex items-center gap-0.5">
                          Diagnostics <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Login Stream Table (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <span>Live Authentication Stream</span>
              </h3>
              <p className="text-xs text-slate-400">Reactive Firestore onSnapshot telemetry feed</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Showing {loginAttempts.slice(0, 15).length} latest events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2.5 font-semibold">Timestamp</th>
                  <th className="pb-2.5 font-semibold">User Email</th>
                  <th className="pb-2.5 font-semibold">IP Address</th>
                  <th className="pb-2.5 font-semibold">Location</th>
                  <th className="pb-2.5 font-semibold">Device</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {loginAttempts.slice(0, 15).map((att) => (
                  <tr key={att.id} className="hover:bg-white/5 transition">
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {new Date(att.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 text-white font-medium truncate max-w-[140px]">
                      {att.email}
                    </td>
                    <td className="py-2.5 text-indigo-300 text-[11px]">
                      {att.ip}
                    </td>
                    <td className="py-2.5 text-slate-300 text-[11px]">
                      {att.location ? `${att.location.city || ""}, ${att.location.country || ""}` : "Unknown"}
                    </td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[130px] text-[11px]">
                      {att.device || att.deviceInfo || "Unknown"}
                    </td>
                    <td className="py-2.5">
                      {att.status === "success" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          FAILED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. GEOLOCATION MAP ROW */}
      <div className="glass-panel p-6 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Global Threat & Authentication Coordinates</span>
            </h3>
            <p className="text-xs text-slate-400">Interactive geographic visualization of authentication origins</p>
          </div>
        </div>

        <LocationMap loginAttempts={loginAttempts} />
      </div>

      {/* Alert Diagnostics Modal */}
      {selectedAlert && (
        <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}

    </div>
  );
}
