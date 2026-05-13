"use client";
import DashboardShell from "@/components/layout/DashboardShell";
import { LayoutDashboard, CalendarDays, MessageCircle } from "lucide-react";
const nav = [
  { label: "Dashboard", href: "/receptionist/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/receptionist/appointments", icon: CalendarDays },
  { label: "Chat", href: "/receptionist/chat", icon: MessageCircle },
];
export default function L({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={nav}>{children}</DashboardShell>;
}
