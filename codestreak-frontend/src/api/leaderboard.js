import client from "./client";

// GET /api/leaderboard?period=weekly|monthly
// Returns: [{ rank, username, score, streak, avatar, delta, isMe }]
export const getLeaderboard = (period = "weekly") =>
  client.get(`/leaderboard?period=${period}`).then((r) => r.data);
