import { X, RefreshCw } from "lucide-react";
import { C, btn as btnStyle, badge as badgeStyle, font } from "../../constants/theme";

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ variant = "primary", loading, children, style, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{ ...btnStyle(variant), opacity: loading || props.disabled ? 0.7 : 1, ...style }}
    >
      {loading && <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, letterSpacing: "0.08em" }}>
          {label}
        </div>
      )}
      <input
        {...props}
        style={{
          width: "100%",
          background: C.surface,
          border: `1px solid ${error ? C.red : C.border}`,
          borderRadius: 7,
          padding: "9px 12px",
          color: C.text,
          fontSize: 13,
          outline: "none",
          fontFamily: font,
          boxSizing: "border-box",
          ...style,
        }}
      />
      {error && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 28,
          width: 420,
          maxWidth: "90vw",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          <X size={18} style={{ cursor: "pointer", color: C.muted }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ color, children }) {
  return <span style={badgeStyle(color)}>{children}</span>;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed", bottom: 24, right: 24,
        background: C.card,
        border: `1px solid ${toast.color}40`,
        borderRadius: 10,
        padding: "12px 20px",
        color: toast.color,
        fontSize: 13,
        fontWeight: 600,
        zIndex: 999,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {toast.msg}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color }) {
  return (
    <RefreshCw
      size={size}
      style={{ animation: "spin 1s linear infinite", color: color || C.amber }}
    />
  );
}

// ── ErrorMsg ──────────────────────────────────────────────────────────────────
export function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "#EF444420",
        border: `1px solid #EF444440`,
        borderRadius: 7,
        color: C.red,
        fontSize: 12,
        marginBottom: 16,
      }}
    >
      {message}
    </div>
  );
}

// ── LoadingPane ────────────────────────────────────────────────────────────────
export function LoadingPane({ label = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
      <Spinner size={28} />
      <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}
