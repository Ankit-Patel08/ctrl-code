import { useState } from "react";
import { Check, LogOut } from "lucide-react";
import { C, styles } from "../constants/theme";
import { usersApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { Input, Button, Toast, ErrorMsg } from "../components/UI";

const NUDGE_STYLES = ["motivational", "strict", "friendly", "competitive"];

export default function SettingsView() {
  const { user, refreshUser, logout } = useAuth();
  const { toast, show: showToast } = useToast();

  const [profile, setProfile] = useState({
    username: user?.username || "",
    email: user?.email || "",
    leetcodeUsername: user?.leetcodeUsername || "",
    timezone: user?.timezone || "Asia/Kolkata",
  });
  const [prefs, setPrefs] = useState({
    email: user?.notificationPrefs?.email ?? true,
    nudgeStyle: user?.notificationPrefs?.nudgeStyle ?? "motivational",
    emailTime: user?.notificationPrefs?.emailTime ?? "20:00",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [prefsError, setPrefsError] = useState("");

  const setP = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));

  // ── Save profile ─────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setSavingProfile(true); setProfileError("");
    try {
      await usersApi.updateMe(profile);
      await refreshUser();
      showToast("✓ Profile updated!");
    } catch (err) {
      setProfileError(err?.error || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save notification prefs ──────────────────────────────────────────────────
  const savePrefs = async () => {
    setSavingPrefs(true); setPrefsError("");
    try {
      await usersApi.updateNotifications(prefs);
      await refreshUser();
      showToast("✓ Notification preferences saved!");
    } catch (err) {
      setPrefsError(err?.error || "Failed to save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (!window.confirm("Sign out?")) return;
    await logout();
  };

  return (
    <div>
      <Toast toast={toast} />

      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Settings</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Profile card */}
        <div style={styles.card}>
          <div style={styles.h2}>Profile</div>
          {profileError && <ErrorMsg message={profileError} />}
          <Input label="USERNAME" value={profile.username} onChange={setP("username")} />
          <Input label="EMAIL" type="email" value={profile.email} onChange={setP("email")} />
          <Input label="LEETCODE USERNAME" value={profile.leetcodeUsername} onChange={setP("leetcodeUsername")} />
          <Input label="TIMEZONE" value={profile.timezone} onChange={setP("timezone")} />
          <Button loading={savingProfile} onClick={saveProfile}>
            {!savingProfile && <Check size={13} />}
            {savingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Notifications card */}
        <div style={styles.card}>
          <div style={styles.h2}>Notifications</div>
          {prefsError && <ErrorMsg message={prefsError} />}

          {/* Nudge style selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, letterSpacing: "0.08em" }}>NUDGE STYLE</div>
            {NUDGE_STYLES.map((style) => (
              <div
                key={style}
                onClick={() => setPrefs((p) => ({ ...p, nudgeStyle: style }))}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px",
                  background: prefs.nudgeStyle === style ? `${C.amber}15` : C.surface,
                  borderRadius: 7, marginBottom: 6, cursor: "pointer",
                  border: `1px solid ${prefs.nudgeStyle === style ? C.amberDim : C.border}`,
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${prefs.nudgeStyle === style ? C.amber : C.muted}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {prefs.nudgeStyle === style && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber }} />
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: prefs.nudgeStyle === style ? C.amber : C.text, textTransform: "capitalize" }}>
                  {style}
                </div>
              </div>
            ))}
          </div>

          {/* Email toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Email Reminders</div>
              <div style={{ fontSize: 11, color: C.muted }}>Daily inactivity alerts</div>
            </div>
            <div
              onClick={() => setPrefs((p) => ({ ...p, email: !p.email }))}
              style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                background: prefs.email ? C.amber : C.dim,
                position: "relative", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3, left: prefs.email ? 23 : 3,
                transition: "left 0.2s",
              }} />
            </div>
          </div>

          {/* Reminder time */}
          <div style={{ marginTop: 16 }}>
            <Input
              label="REMINDER TIME (24h)"
              type="time"
              value={prefs.emailTime}
              onChange={(e) => setPrefs((p) => ({ ...p, emailTime: e.target.value }))}
            />
          </div>

          <Button loading={savingPrefs} onClick={savePrefs}>
            {!savingPrefs && <Check size={13} />}
            {savingPrefs ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: 32, padding: "20px 24px", background: "#EF444408", border: `1px solid #EF444420`, borderRadius: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 12 }}>Danger Zone</div>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: "transparent", color: C.red, border: `1px solid #EF444440` }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );
}
