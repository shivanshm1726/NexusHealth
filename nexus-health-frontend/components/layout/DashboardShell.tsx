"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavItem { label: string; href: string; icon: React.ElementType; }

export default function DashboardShell({ children, navItems }: { children: React.ReactNode; navItems: NavItem[] }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const roleColors: Record<string, string> = {
    PATIENT: "bg-blue-50 text-blue-600",
    DOCTOR: "bg-emerald-50 text-emerald-600",
    RECEPTIONIST: "bg-amber-50 text-amber-600",
    ADMIN: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col fixed h-full shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">NexusHealth</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                  active
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}>
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3 px-1">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", roleColors[user.role] || "bg-slate-100 text-slate-500")}>{user.role}</span>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
