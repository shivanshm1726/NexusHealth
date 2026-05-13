"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

type Role = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<void>;
  registerDoctor: (data: { fullName: string; email: string; password: string; specialization: string; qualification?: string; consultationFee?: number }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_DASHBOARDS: Record<Role, string> = {
  PATIENT: "/dashboard",
  DOCTOR: "/doctor/dashboard",
  RECEPTIONIST: "/receptionist/dashboard",
  ADMIN: "/admin/dashboard",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const saveAuth = (data: { id: string; email: string; fullName: string; role: Role; accessToken: string; refreshToken: string }) => {
    const u: User = { id: data.id, email: data.email, fullName: data.fullName, role: data.role };
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveAuth(data);
    router.push(ROLE_DASHBOARDS[data.role as Role]);
  };

  const register = async (formData: { fullName: string; email: string; password: string; phone?: string }) => {
    const { data } = await api.post("/auth/register", formData);
    saveAuth(data);
    router.push("/dashboard");
  };

  const registerDoctor = async (formData: { fullName: string; email: string; password: string; specialization: string; qualification?: string; consultationFee?: number }) => {
    const { data } = await api.post("/auth/register/doctor", formData);
    saveAuth(data);
    router.push("/doctor/dashboard");
  };

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerDoctor, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
