import { Activity, Trophy, Users, Target, Settings } from "lucide-react";
import { Flame } from "lucide-react";
import { C, font } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { id: "dashboard",   label: "Dashboard",   Icon: Activity },
  { id: "leaderboard", label: "Leaderboard", Icon: Trophy },
  { id: "groups",      label: "Groups",      Icon: Users },
  { id: "goals",       label: "Goals",       Icon: Target },
  { id: "settings",    label: "Settings",    Icon: Settings },
];

export default function Sidebar({ page, onNavigate }) {
  const { user } = useAuth();

  return (
    <div
      style={{
        width: 220,
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
        fontFamily: font,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 20px 28px", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.amber, letterSpacing: "0.08em" }}>
          ⚡ CODESTREAK
        </div>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.15em", marginTop: 2 }}>
          HABIT ENGINE
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {NAV.map(({ id, label, Icon }) => {
          const active = page === id;
          return (
            <div
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 20px", cursor: "pointer",
                color: active ? C.amber : C.muted,
                background: active ? "rgba(245,158,11,0.08)" : "transparent",
                borderLeft: `2px solid ${active ? C.amber : "transparent"}`,
                fontSize: 13, letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </div>
          );
        })}
      </nav>

      {/* User badge */}
      {user && (
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: C.amberDim,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: C.amber,
              }}
            >
              {user.username?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user.username}</div>
              <div style={{ fontSize: 10, color: C.muted }}>
                <Flame size={9} style={{ display: "inline", color: C.amber, marginRight: 2 }} />
                {user.streakData?.current ?? 0}d streak
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
