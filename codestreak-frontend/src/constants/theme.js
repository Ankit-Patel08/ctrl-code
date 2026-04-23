export const C = {
  bg: "#0A0E1A",
  surface: "#0F1628",
  card: "#141C2E",
  border: "#1E2A42",
  amber: "#F59E0B",
  amberDim: "#92610A",
  teal: "#14B8A6",
  red: "#EF4444",
  green: "#22C55E",
  purple: "#8B5CF6",
  text: "#E2E8F0",
  muted: "#64748B",
  dim: "#334155",
};

export const font = "'DM Mono', 'Fira Code', 'Courier New', monospace";

export const styles = {
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "20px 24px",
  },
  statCard: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    color: C.muted,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  statValue: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  h2: {
    fontSize: 16,
    fontWeight: 600,
    color: C.text,
    marginBottom: 18,
    letterSpacing: "0.03em",
  },
};

export const badge = (color) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "3px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  background: `${color}20`,
  color: color,
  border: `1px solid ${color}40`,
});

export const btn = (variant = "primary") => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 18px",
  borderRadius: 7,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.05em",
  border: "none",
  transition: "all 0.15s",
  fontFamily: font,
  ...(variant === "primary"
    ? { background: C.amber, color: "#000" }
    : variant === "ghost"
    ? { background: "transparent", color: C.muted, border: `1px solid ${C.border}` }
    : { background: C.teal + "20", color: C.teal, border: `1px solid ${C.teal}40` }),
});
