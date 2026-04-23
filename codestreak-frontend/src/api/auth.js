import client from "./client";

// POST /api/auth/register
export const register = (data) =>
  client.post("/auth/register", data).then((r) => r.data);

// POST /api/auth/login
export const login = (data) =>
  client.post("/auth/login", data).then((r) => r.data);

// POST /api/auth/logout
export const logout = () =>
  client.post("/auth/logout").then((r) => r.data);
