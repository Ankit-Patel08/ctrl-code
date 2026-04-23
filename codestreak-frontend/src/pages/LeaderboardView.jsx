import { useState, useCallback } from "react";
import { C, styles } from "../constants/theme";
import { leaderboardApi } from "../api";
import { useApi } from "../hooks/useApi";
import { LeaderRow } from "../components/charts";
import { LoadingPane, ErrorMsg } from "../components/UI";

export default function LeaderboardView() {
  const [period, setPeriod] = useState("weekly");

  const fn = useCallback(() => leaderboardApi.getLeaderboard(period), [period]);
  const { data: leaderboard, loading, error } = useApi(fn, []);

  const me = leaderboard?.find((e) => e.isMe);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Leaderboard</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Ranked by problems solved</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["weekly", "monthly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 7, cursor: "pointer",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                border: "none", textTransform: "uppercase",
                ...(period === p
                  ? { background: C.amber, color: "#000" }
                  : { background: "transparent", color: C.muted, border: `1px solid ${C.border}` }),
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {me && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>YOUR RANK</span>
            <span style={{ ...styles.statValue, fontSize: 24, color: C.amber }}>#{me.rank}</span>
            <span style={{ fontSize: 11, color: me.delta >= 0 ? C.green : C.red }}>
              {me.delta > 0 ? `↑${me.delta}` : me.delta < 0 ? `↓${Math.abs(me.delta)}` : "—"} from last {period === "weekly" ? "week" : "month"}
            </span>
          </div>
          {leaderboard?.[0] && (
            <div style={styles.statCard}>
              <span style={styles.statLabel}>TOP PERFORMER</span>
              <span style={{ ...styles.statValue, fontSize: 20, color: C.purple }}>{leaderboard[0].username}</span>
              <span style={{ fontSize: 11, color: C.green }}>{leaderboard[0].score} problems this {period === "weekly" ? "week" : "month"}</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, padding: "0 16px 12px", letterSpacing: "0.08em" }}>
          <span>RANK · USER</span>
          <span>SCORE · CHANGE</span>
        </div>

        {error && <ErrorMsg message={error} />}
        {loading ? (
          <LoadingPane label="Fetching leaderboard..." />
        ) : (
          leaderboard?.map((entry) => <LeaderRow key={entry.username} entry={entry} />)
        )}
      </div>
    </div>
  );
}
