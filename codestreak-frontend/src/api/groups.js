import client from "./client";

// GET /api/groups
// Returns: [{ id, name, members, todayActive, inviteCode, myStreak, topStreak }]
export const getGroups = () => client.get("/groups").then((r) => r.data);

// POST /api/groups  body: { name, dailyGoal }
export const createGroup = (data) =>
  client.post("/groups", data).then((r) => r.data);

// POST /api/groups/join  body: { inviteCode }
export const joinGroup = (inviteCode) =>
  client.post("/groups/join", { inviteCode }).then((r) => r.data);

// DELETE /api/groups/:id/leave
export const leaveGroup = (id) =>
  client.delete(`/groups/${id}/leave`).then((r) => r.data);
