import client from "./client";

// GET /api/activity/calendar?weeks=26
// Returns: { "2025-01-01": 3, "2025-01-02": 0, ... }
export const getCalendar = (weeks = 26) =>
  client.get(`/activity/calendar?weeks=${weeks}`).then((r) => r.data);

// GET /api/activity/recent?days=30
// Returns: [{ date: "Jan 1", solved: 3, streak: 5 }, ...]
export const getRecentActivity = (days = 30) =>
  client.get(`/activity/recent?days=${days}`).then((r) => r.data);
