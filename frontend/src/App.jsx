import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { UserManagement } from "./components/UserManagement";
import { AttackSimulatorModal } from "./components/AttackSimulatorModal";
import { Shield } from "lucide-react";

function MainContent() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSimulator, setShowSimulator] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3 glass-panel p-8">
          <Shield className="w-10 h-10 text-indigo-400 animate-pulse" />
          <span className="text-sm font-semibold tracking-wider">Initializing SecOps Threat Sentinel...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onOpenSimulator={() => setShowSimulator(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "users" && <UserManagement />}
      </main>

      <footer className="w-full glass-panel rounded-none border-x-0 border-b-0 border-t-white/10 py-4 px-6 text-center text-xs text-slate-400">
        Real-Time Authentication Monitoring & Threat Detection System • Firebase & React Glassmorphism Architecture
      </footer>

      {showSimulator && (
        <AttackSimulatorModal onClose={() => setShowSimulator(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
