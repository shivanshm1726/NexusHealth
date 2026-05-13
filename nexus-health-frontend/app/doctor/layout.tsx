"use client";
import DashboardShell from "@/components/layout/DashboardShell";
import { LayoutDashboard, Clock, CalendarDays } from "lucide-react";
const nav = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "My Schedule", href: "/doctor/schedule", icon: Clock },
  { label: "Appointments", href: "/doctor/appointments", icon: CalendarDays },
];
export default function L({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={nav}>{children}</DashboardShell>;
}
