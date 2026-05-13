"use client";
import DashboardShell from "@/components/layout/DashboardShell";
import { LayoutDashboard, Search, CalendarDays, MessageCircle } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Find Doctors", href: "/doctors", icon: Search },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Chat", href: "/chat", icon: MessageCircle },
];

export default function L({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={nav}>{children}</DashboardShell>;
}
