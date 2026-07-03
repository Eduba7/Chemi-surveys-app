import { useCallback, useEffect, useState } from "react";

interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "STAFF";
  jobTitle: string | null;
  phone: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = Boolean(localStorage.getItem("token")) && Boolean(user);

  const login = useCallback((token: string, userData: AuthUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  useEffect(() => {
    // Keeps state in sync if token is cleared elsewhere (e.g. another tab)
    const handler = () => {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return { user, isAuthenticated, login, logout };
}
