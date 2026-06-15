import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { StudentMeta } from "@/types";
import { AuthAPI } from "@/services/api";
interface AuthContextValue {
  isAuthenticated: boolean;
  studentMeta: StudentMeta | null;
  login: (srn: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false, studentMeta: null,
  login: async () => {}, logout: () => {},
});
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [studentMeta, setStudentMeta] = useState<StudentMeta | null>(() => {
    try { const raw = localStorage.getItem("snpsu_meta"); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  });
  const isAuthenticated = !!studentMeta && !!localStorage.getItem("snpsu_token");
  const login = useCallback(async (srn: string, password: string) => {
    const data = await AuthAPI.login(srn, password);
    if (data.status !== "success") throw new Error("Login failed");
    localStorage.setItem("snpsu_token", data.access_token);
    localStorage.setItem("snpsu_meta", JSON.stringify(data.student_meta));
    setStudentMeta(data.student_meta);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("snpsu_token");
    localStorage.removeItem("snpsu_meta");
    setStudentMeta(null);
  }, []);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "snpsu_token" && !e.newValue) setStudentMeta(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <AuthContext.Provider value={{ isAuthenticated, studentMeta, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
