import client from "./client";

// GET /api/users/me  →  { username, email, leetcodeUsername, timezone, streakData, stats, notificationPrefs }
export const getMe = () => client.get("/users/profile").then((r) => r.data);

// PUT /api/users/me
export const updateMe = (data) =>
  client.put("/users/me", data).then((r) => r.data);

// PUT /api/users/me/notifications
export const updateNotifications = (prefs) =>
  client.put("/users/me/notifications", prefs).then((r) => r.data);

// POST /api/users/me/freeze  →  uses one streak freeze
export const freezeStreak = () =>
  client.post("/users/me/freeze").then((r) => r.data);

// POST /api/users/me/sync  →  triggers LeetCode sync, returns updated stats
export const syncLeetCode = () =>
  client.post("/activity/sync").then((r) => r.data);
