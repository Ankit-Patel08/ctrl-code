import { useState, useCallback } from "react";
import { Users, Plus } from "lucide-react";
import { C, styles } from "../constants/theme";
import { groupsApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../hooks/useToast";
import { Modal, Input, Button, Toast, LoadingPane, ErrorMsg, Badge } from "../components/UI";

export default function GroupsView() {
  const { toast, show: showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", dailyGoal: 1 });
  const [inviteCode, setInviteCode] = useState("");
  const [formError, setFormError] = useState("");

  const fn = useCallback(() => groupsApi.getGroups(), []);
  const { data: groups, loading, error, refetch } = useApi(fn, []);

  // ── Create group ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name.trim()) { setFormError("Group name is required."); return; }
    setCreating(true); setFormError("");
    try {
      await groupsApi.createGroup(createForm);
      await refetch();
      setShowCreate(false);
      setCreateForm({ name: "", dailyGoal: 1 });
      showToast("✓ Group created successfully!");
    } catch (err) {
      setFormError(err?.error || "Failed to create group.");
    } finally {
      setCreating(false);
    }
  };

  // ── Join group ───────────────────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!inviteCode.trim()) { setFormError("Enter an invite code."); return; }
    setJoining(true); setFormError("");
    try {
      await groupsApi.joinGroup(inviteCode.trim().toUpperCase());
      await refetch();
      setShowJoin(false);
      setInviteCode("");
      showToast("✓ Joined group!");
    } catch (err) {
      setFormError(err?.error || "Invalid invite code.");
    } finally {
      setJoining(false);
    }
  };

  // ── Leave group ──────────────────────────────────────────────────────────────
  const handleLeave = async (id, name) => {
    if (!window.confirm(`Leave "${name}"?`)) return;
    try {
      await groupsApi.leaveGroup(id);
      await refetch();
      showToast(`Left ${name}.`, C.muted);
    } catch (err) {
      showToast(err?.error || "Could not leave group.", C.red);
    }
  };

  return (
    <div>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Accountability Groups</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Stay consistent with your crew</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setShowJoin(true); setFormError(""); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: "transparent", color: C.muted, border: `1px solid ${C.border}` }}
          >
            <Users size={13} /> Join Group
          </button>
          <button
            onClick={() => { setShowCreate(true); setFormError(""); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: C.amber, color: "#000", border: "none" }}
          >
            <Plus size={13} /> Create Group
          </button>
        </div>
      </div>

      {error && <ErrorMsg message={error} />}
      {loading && <LoadingPane label="Loading groups..." />}

      {/* Group cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {groups?.length === 0 && (
            <div style={{ ...styles.card, gridColumn: "1/-1", textAlign: "center", padding: 60, color: C.muted }}>
              <Users size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 14 }}>You're not in any groups yet.</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Create one or join with an invite code.</div>
            </div>
          )}

          {groups?.map((g) => (
            <div key={g.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    Invite: <span style={{ color: C.teal, fontWeight: 600 }}>{g.inviteCode}</span>
                  </div>
                </div>
                <Badge color={C.green}>{g.todayActive}/{g.members} active today</Badge>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Members", value: g.members },
                  { label: "My Streak", value: `${g.myStreak}d`, color: C.amber },
                  { label: "Top Streak", value: `${g.topStreak}d`, color: C.purple },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center", padding: "10px 0", background: C.surface, borderRadius: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: color || C.text }}>{value}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Activity dots */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>TODAY'S ACTIVITY</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {Array.from({ length: g.members }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: i < g.todayActive ? C.green : C.dim,
                        opacity: i < g.todayActive ? 1 : 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLeave(g.id, g.name)}
                style={{ fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Leave group →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Group">
        {formError && <ErrorMsg message={formError} />}
        <Input
          label="GROUP NAME"
          placeholder="DSA Grinders 🔥"
          value={createForm.name}
          onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Input
          label="DAILY GOAL (problems)"
          type="number"
          min={1}
          value={createForm.dailyGoal}
          onChange={(e) => setCreateForm((p) => ({ ...p, dailyGoal: Number(e.target.value) }))}
        />
        <Button loading={creating} style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={handleCreate}>
          Create Group
        </Button>
      </Modal>

      {/* Join modal */}
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join Group">
        {formError && <ErrorMsg message={formError} />}
        <Input
          label="INVITE CODE"
          placeholder="GRD-X4K2"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <Button loading={joining} style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={handleJoin}>
          Join
        </Button>
      </Modal>
    </div>
  );
}
