"use client";
import DashboardShell from "@/components/layout/DashboardShell";
import { LayoutDashboard, Stethoscope, Users } from "lucide-react";
const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { label: "All Users", href: "/admin/users", icon: Users },
];
export default function L({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={nav}>{children}</DashboardShell>;
}
