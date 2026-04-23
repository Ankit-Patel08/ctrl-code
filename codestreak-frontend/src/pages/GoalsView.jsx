import { useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { C, styles } from "../constants/theme";
import { goalsApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { Modal, Input, Button, Toast, Badge, LoadingPane, ErrorMsg } from "../components/UI";
import { CustomTooltip } from "../components/charts";

export default function GoalsView() {
  const { user } = useAuth();
  const { toast, show: showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [newGoal, setNewGoal] = useState({ title: "", targetProblems: "", deadline: "" });

  const fn = useCallback(() => goalsApi.getGoals(), []);
  const { data: goals, loading, error, refetch } = useApi(fn, []);

  // ── Create ───────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newGoal.title.trim() || !newGoal.targetProblems) {
      setFormError("Title and target are required.");
      return;
    }
    setSaving(true); setFormError("");
    try {
      await goalsApi.createGoal({
        ...newGoal,
        targetProblems: Number(newGoal.targetProblems),
      });
      await refetch();
      setShowAdd(false);
      setNewGoal({ title: "", targetProblems: "", deadline: "" });
      showToast("✓ Goal created!");
    } catch (err) {
      setFormError(err?.error || "Failed to save goal.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete goal "${title}"?`)) return;
    try {
      await goalsApi.deleteGoal(id);
      await refetch();
      showToast("Goal removed.", C.muted);
    } catch (err) {
      showToast(err?.error || "Could not delete goal.", C.red);
    }
  };

  const stats = user?.stats;
  const barData = [
    { name: "Easy",   count: stats?.easySolved   ?? 0, color: C.green },
    { name: "Medium", count: stats?.mediumSolved  ?? 0, color: C.amber },
    { name: "Hard",   count: stats?.hardSolved    ?? 0, color: C.red },
  ];

  return (
    <div>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Goals & Milestones</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Set targets, track progress</div>
        </div>
        <button
          onClick={() => { setShowAdd(true); setFormError(""); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, background: C.amber, color: "#000", border: "none" }}
        >
          <Plus size={13} /> Add Goal
        </button>
      </div>

      {error && <ErrorMsg message={error} />}
      {loading && <LoadingPane label="Loading goals..." />}

      {/* Goal cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          {goals?.length === 0 && (
            <div style={{ ...styles.card, gridColumn: "1/-1", textAlign: "center", padding: 60, color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 14 }}>No goals yet. Create one to track your progress.</div>
            </div>
          )}

          {goals?.map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / goal.targetProblems) * 100));
            const remaining = goal.targetProblems - goal.current;
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000)
              : null;

            return (
              <div key={goal.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{goal.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge color={pct >= 80 ? C.green : C.amber}>{pct}%</Badge>
                    <Trash2
                      size={14}
                      style={{ color: C.muted, cursor: "pointer" }}
                      onClick={() => handleDelete(goal.id, goal.title)}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 32, fontWeight: 700, color: C.amber, marginBottom: 12 }}>
                  {goal.current}
                  <span style={{ fontSize: 16, color: C.muted }}>/{goal.targetProblems}</span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, background: C.dim, borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${C.amber}, ${C.teal})`,
                    borderRadius: 4,
                    transition: "width 1s ease",
                  }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted }}>
                  <span>{remaining} remaining</span>
                  {daysLeft !== null && (
                    <span style={{ color: daysLeft < 30 ? C.red : C.muted }}>{daysLeft}d left</span>
                  )}
                </div>

                {/* Daily pace hint */}
                {daysLeft !== null && daysLeft > 0 && remaining > 0 && (
                  <div style={{ marginTop: 12, padding: "8px 12px", background: C.surface, borderRadius: 7, fontSize: 11, color: C.teal }}>
                    💡 Solve {Math.ceil(remaining / daysLeft)} problems/day to hit your deadline
                  </div>
                )}

                {goal.deadline && (
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 8 }}>
                    Deadline: {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Problem distribution bar chart */}
      {stats && (
        <div style={styles.card}>
          <div style={styles.h2}>Problem Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 12 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add goal modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Goal">
        {formError && <ErrorMsg message={formError} />}
        <Input
          label="GOAL TITLE"
          placeholder="Solve 500 problems"
          value={newGoal.title}
          onChange={(e) => setNewGoal((p) => ({ ...p, title: e.target.value }))}
        />
        <Input
          label="TARGET (problems or days)"
          type="number"
          min={1}
          placeholder="500"
          value={newGoal.targetProblems}
          onChange={(e) => setNewGoal((p) => ({ ...p, targetProblems: e.target.value }))}
        />
        <Input
          label="DEADLINE (optional)"
          type="date"
          value={newGoal.deadline}
          onChange={(e) => setNewGoal((p) => ({ ...p, deadline: e.target.value }))}
        />
        <Button
          loading={saving}
          style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          onClick={handleCreate}
        >
          Save Goal
        </Button>
      </Modal>
    </div>
  );
}
