import client from "./client";

// GET /api/goals
// Returns: [{ id, title, targetProblems, current, deadline, active, isStreak }]
export const getGoals = () => client.get("/goals").then((r) => r.data);

// POST /api/goals  body: { title, targetProblems, deadline }
export const createGoal = (data) =>
  client.post("/goals", data).then((r) => r.data);

// DELETE /api/goals/:id
export const deleteGoal = (id) =>
  client.delete(`/goals/${id}`).then((r) => r.data);

// PATCH /api/goals/:id  body: { active }
export const updateGoal = (id, data) =>
  client.patch(`/goals/${id}`, data).then((r) => r.data);
