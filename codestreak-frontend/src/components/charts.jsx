import { Flame, Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { C } from "../constants/theme";

// ── Activity Heatmap ──────────────────────────────────────────────────────────
export function Heatmap({ data = {} }) {
  const today = new Date();
  const cells = [];
  for (let i = 181; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, count: data[key] || 0 });
  }

  const getColor = (count) => {
    if (count === 0) return C.dim;
    if (count === 1) return C.amberDim;
    if (count <= 2) return "#B45309";
    if (count <= 3) return C.amber;
    return "#FCD34D";
  };

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 3, width: "fit-content" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {week.map(({ key, count }) => (
              <div
                key={key}
                title={`${key}: ${count} solved`}
                style={{
                  width: 11, height: 11, borderRadius: 2,
                  background: getColor(count),
                  cursor: "default",
                  transition: "transform 0.1s",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: C.muted, fontSize: 10 }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <div key={n} style={{ width: 11, height: 11, borderRadius: 2, background: getColor(n) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ── Consistency Ring ──────────────────────────────────────────────────────────
export function ConsistencyRing({ score = 0 }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? C.green : score >= 60 ? C.amber : C.red;

  return (
    <div style={{ position: "relative", width: 128, height: 128 }}>
      <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.dim} strokeWidth={8} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{score}</span>
        <span style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em" }}>SCORE</span>
      </div>
    </div>
  );
}

// ── Streak Flame ──────────────────────────────────────────────────────────────
export function StreakFlame({ count = 0 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Flame size={40} style={{ color: C.amber, filter: "drop-shadow(0 0 8px #F59E0B60)" }} />
      <div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.amber, lineHeight: 1 }}>{count}</div>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>DAY STREAK</div>
      </div>
    </div>
  );
}

// ── Leaderboard Row ───────────────────────────────────────────────────────────
export function LeaderRow({ entry }) {
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 16px", borderRadius: 8,
      background: entry.isMe ? "rgba(245,158,11,0.08)" : "transparent",
      border: entry.isMe ? `1px solid ${C.amberDim}` : "1px solid transparent",
      marginBottom: 6,
    }}>
      <div style={{ width: 28, textAlign: "center", fontWeight: 700, fontSize: 14, color: rankColors[entry.rank - 1] || C.muted }}>
        {entry.rank <= 3
          ? <Trophy size={16} style={{ color: rankColors[entry.rank - 1] }} />
          : `#${entry.rank}`}
      </div>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: entry.isMe ? C.amberDim : C.dim,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: entry.isMe ? C.amber : C.muted, flexShrink: 0,
      }}>
        {entry.avatar}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: entry.isMe ? C.amber : C.text }}>{entry.username}</div>
        <div style={{ fontSize: 10, color: C.muted }}>
          <Flame size={10} style={{ display: "inline", marginRight: 3, color: C.amber }} />
          {entry.streak}d streak
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{entry.score}</div>
        <div style={{
          fontSize: 10,
          color: entry.delta > 0 ? C.green : entry.delta < 0 ? C.red : C.muted,
          display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end",
        }}>
          {entry.delta > 0 ? <ArrowUp size={9} /> : entry.delta < 0 ? <ArrowDown size={9} /> : null}
          {entry.delta !== 0 ? Math.abs(entry.delta) : "—"}
        </div>
      </div>
    </div>
  );
}

// ── Custom Chart Tooltip ──────────────────────────────────────────────────────
export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 700 }}>
          {p.dataKey}: {p.value}
        </div>
      ))}
    </div>
  );
}
