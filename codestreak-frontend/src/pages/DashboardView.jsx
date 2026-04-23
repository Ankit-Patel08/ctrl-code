import { useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { RefreshCw, Shield, Code, Check, AlertTriangle, Flame, Star, Calendar } from "lucide-react";
import { C, styles } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useToast } from "../hooks/useToast";
import { activityApi, usersApi } from "../api";
import { Heatmap, ConsistencyRing, StreakFlame, CustomTooltip } from "../components/charts";
import { Toast, LoadingPane, ErrorMsg } from "../components/UI";

const GOALS_PREVIEW = [
  { id: 1, title: "Solve 500 problems", targetProblems: 500, current: 312, deadline: "2026-08-01" },
  { id: 2, title: "Complete 60-day streak", targetProblems: 60, current: 23, deadline: "2026-06-01", isStreak: true },
];

export default function DashboardView() {
  const { user, setUser, refreshUser } = useAuth();
  const { toast, show: showToast } = useToast();

  // ── API calls ────────────────────────────────────────────────────────────────
  const calendarFn = useCallback(() => activityApi.getCalendar(26), []);
  const recentFn   = useCallback(() => activityApi.getRecentActivity(30), []);

  const { data: calendar, loading: calLoading } = useApi(calendarFn, {});
  const { data: recentActivity, loading: actLoading } = useApi(recentFn, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleSync = async () => {
    try {
      const res=await usersApi.syncLeetCode();
      // await refreshUser();
      setUser(res.user);
      showToast("✓ Activity synced from LeetCode");
    } catch (err) {
      console.log(err);
      
      
      
      showToast(`✗ Sync failed: ${err?.error || "Try again"}`, C.red);
    }
  };

  const handleFreeze = async () => {
    try {
      await usersApi.freezeStreak();
      await refreshUser();
      showToast("❄ Streak freeze applied! Your streak is safe.", C.teal);
    } catch (err) {
      showToast(`✗ ${err?.error || "Freeze failed"}`, C.red);
    }
  };

  if (!user) return <LoadingPane label="Loading profile..." />;

  const { streakData, stats, username } = user;
  const todaySolved = Array.isArray(recentActivity) && recentActivity.length > 0
    ? recentActivity[recentActivity.length - 1]?.solved || 0
    : 0;

  return (
    <div>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>
            GM, <span style={{ color: C.amber }}>{username}</span> 👋
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {streakData?.freezesAvailable > 0 && (
            <button onClick={handleFreeze} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: C.teal + "20", color: C.teal, border: `1px solid ${C.teal}40` }}>
              <Shield size={13} /> Freeze ({streakData.freezesAvailable})
            </button>
          )}
          <button onClick={handleSync} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: "transparent", color: C.muted, border: `1px solid ${C.border}` }}>
            <RefreshCw size={13} /> Sync LeetCode
          </button>
        </div>
      </div>

      {/* Today banner */}
      <div style={{
        ...styles.card, marginBottom: 24,
        background: todaySolved > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
        borderColor: todaySolved > 0 ? "#22C55E40" : "#EF444440",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: todaySolved > 0 ? "#22C55E20" : "#EF444420", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {todaySolved > 0
              ? <Check size={20} style={{ color: C.green }} />
              : <AlertTriangle size={20} style={{ color: C.red }} />}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: todaySolved > 0 ? C.green : C.red }}>
              {todaySolved > 0 ? `Today: ${todaySolved} problem${todaySolved > 1 ? "s" : ""} solved ✓` : "No problems solved yet today"}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              {todaySolved > 0 ? "Your streak is safe. Keep pushing!" : "Solve at least 1 problem to keep your streak alive."}
            </div>
          </div>
        </div>
        {todaySolved === 0 && (
          <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, background: C.amber, color: "#000", fontWeight: 600, fontSize: 12, textDecoration: "none" }}>
            <Code size={13} /> Solve Now
          </a>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "CURRENT STREAK", value: streakData?.current ?? 0, unit: "days", icon: <Flame size={16} />, color: C.amber },
          { label: "LONGEST STREAK", value: streakData?.longest ?? 0, unit: "days", icon: <Star size={16} />, color: C.purple },
          { label: "TOTAL SOLVED", value: stats?.totalSolved ?? 0, unit: "problems", icon: <Code size={16} />, color: C.teal },
          { label: "ACTIVE DAYS", value: stats?.activeDays ?? 0, unit: "total", icon: <Calendar size={16} />, color: C.green },
        ].map(({ label, value, unit, icon, color }) => (
          <div key={label} style={styles.statCard}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={styles.statLabel}>{label}</span>
              <span style={{ color }}>{icon}</span>
            </div>
            <div style={{ ...styles.statValue, color }}>{value}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={styles.card}>
          <div style={styles.h2}>30-Day Activity</div>
          {actLoading
            ? <LoadingPane label="Fetching activity..." />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={recentActivity || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.amber} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="solved" stroke={C.amber} fill="url(#amberGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </div>

        <div style={{ ...styles.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={styles.h2}>Consistency</div>
          <ConsistencyRing score={stats?.consistencyScore ?? 0} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.muted }}>
              {(stats?.consistencyScore ?? 0) >= 80 ? "🔥 Excellent consistency"
               : (stats?.consistencyScore ?? 0) >= 60 ? "👍 Good progress" : "⚠ Needs improvement"}
            </div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>Based on last 30 days</div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            {[
              { l: "Easy", v: stats?.easySolved ?? 0, c: C.green },
              { l: "Med",  v: stats?.mediumSolved ?? 0, c: C.amber },
              { l: "Hard", v: stats?.hardSolved ?? 0, c: C.red },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.08em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ ...styles.card, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={styles.h2}>Activity Heatmap — Last 26 Weeks</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${C.amber}20`, color: C.amber, border: `1px solid ${C.amber}40` }}>
            <Flame size={10} /> {Object.values(calendar || {}).filter((v) => v > 0).length} active days
          </span>
        </div>
        {calLoading ? <LoadingPane label="Loading heatmap..." /> : <Heatmap data={calendar || {}} />}
      </div>

      {/* Streak + Goals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={styles.card}>
          <div style={styles.h2}>Streak Status</div>
          <StreakFlame count={streakData?.current ?? 0} />
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Personal Best", value: `${streakData?.longest ?? 0} days`, color: C.purple },
              { label: "Freezes Available", value: streakData?.freezesAvailable ?? 0, color: C.teal },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.h2}>Goal Progress</div>
          {GOALS_PREVIEW.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / goal.targetProblems) * 100));
            return (
              <div key={goal.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: C.text }}>{goal.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: C.dim, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? C.green : C.amber, borderRadius: 3, transition: "width 1s ease" }} />
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
                  {goal.current} / {goal.targetProblems} {goal.isStreak ? "days" : "problems"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
