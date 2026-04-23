import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { C, font } from "./constants/theme";
import Sidebar from "./components/Layout/Sidebar";
import AuthScreen from "./pages/AuthScreen";
import DashboardView from "./pages/DashboardView";
import LeaderboardView from "./pages/LeaderboardView";
import GroupsView from "./pages/GroupsView";
import GoalsView from "./pages/GoalsView";
import SettingsView from "./pages/SettingsView";
import { LoadingPane } from "./components/UI";

// ── Inner app (has access to AuthContext) ──────────────────────────────────────
function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("dashboard");

  // Hydrating from stored token
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <LoadingPane label="INITIALISING..." />
      </div>
    );
  }

  // Not authenticated → show auth screen
  if (!user) return <AuthScreen />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":   return <DashboardView />;
      case "leaderboard": return <LeaderboardView />;
      case "groups":      return <GroupsView />;
      case "goals":       return <GoalsView />;
      case "settings":    return <SettingsView />;
      default:            return <DashboardView />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: font, display: "flex" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        a { color: inherit; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        button { font-family: inherit; }
      `}</style>

      <Sidebar page={page} onNavigate={setPage} />

      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        {renderPage()}
      </main>
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
