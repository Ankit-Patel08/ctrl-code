import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { C, font } from "../constants/theme";
import { Input, ErrorMsg } from "../components/UI";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", leetcodeUsername: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      // AuthContext sets user — App re-renders to main layout automatically
    } catch (err) {
      setError(err?.error || err?.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: font,
    }}>
      <div style={{ width: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.amber, letterSpacing: "0.1em" }}>
            ⚡ CODESTREAK
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6, letterSpacing: "0.12em" }}>
            HABIT ENGINE FOR COMPETITIVE CODERS
          </div>
        </div>

        {/* Card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32 }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", marginBottom: 24, background: C.surface, borderRadius: 8, padding: 4 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 6, border: "none",
                  background: mode === m ? C.amber : "transparent",
                  color: mode === m ? "#000" : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  fontFamily: font,
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <ErrorMsg message={error} />

          {mode === "register" && (
            <Input label="USERNAME" placeholder="alex_codes" value={form.username} onChange={set("username")} onKeyDown={handleKey} />
          )}
          <Input label="EMAIL" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onKeyDown={handleKey} />
          <Input label="PASSWORD" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={handleKey} />
          {mode === "register" && (
            <Input label="LEETCODE USERNAME (optional)" placeholder="your_lc_handle" value={form.leetcodeUsername} onChange={set("leetcodeUsername")} onKeyDown={handleKey} />
          )}

          <button
            onClick={submit}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "12px 0",
              background: C.amber, color: "#000",
              border: "none", borderRadius: 7,
              fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontFamily: font, marginTop: 8,
              transition: "opacity 0.15s",
            }}
          >
            {loading && <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "AUTHENTICATING..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
