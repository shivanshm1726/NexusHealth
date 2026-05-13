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

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800/50 flex flex-col fixed h-full">
        <div className="p-5 border-b border-slate-800/50">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">NexusHealth</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  active ? "bg-emerald-500/10 text-emerald-400 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}>
                <item.icon className="h-4 w-4" />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 bg-emerald-500/20">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm">{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
