import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, usersApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while hydrating from token

  // On mount: if a token exists, fetch current user profile
  useEffect(() => {
    const token = localStorage.getItem("cs_token");
    if (!token) { setLoading(false); return; }

    usersApi.getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("cs_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem("cs_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    localStorage.setItem("cs_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    localStorage.removeItem("cs_token");
    setUser(null);
  }, []);

  // Call this after profile/settings updates so the header stays fresh
  const refreshUser = useCallback(async () => {
    const updated = await usersApi.getMe();
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
