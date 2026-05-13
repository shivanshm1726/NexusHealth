"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays, Video, ArrowRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  useEffect(() => { api.get("/appointments/my").then(r => setAppointments(r.data)).catch(() => {}); }, []);
  const upcoming = appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING_PAYMENT");

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold text-white">Welcome, {user?.fullName?.split(" ")[0]} 👋</h1><p className="text-slate-400 mt-1">Your health journey overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/doctors", icon: Search, title: "Find a Doctor", sub: "Browse specialists", color: "emerald" },
          { href: "/appointments", icon: CalendarDays, title: "Appointments", sub: `${upcoming.length} upcoming`, color: "cyan" },
          { href: "/chat", icon: Video, title: "Chat Support", sub: "Talk to receptionist", color: "violet" },
        ].map(c => (
          <Link key={c.href} href={c.href}>
            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-${c.color}-500/10 flex items-center justify-center`}><c.icon className={`h-6 w-6 text-${c.color}-400`} /></div>
                <div><p className="font-semibold text-white">{c.title}</p><p className="text-sm text-slate-400">{c.sub}</p></div>
                <ArrowRight className="h-4 w-4 text-slate-600 ml-auto group-hover:text-emerald-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="bg-slate-900/50 border-slate-800">
        <div className="p-6"><h2 className="text-lg font-semibold text-white flex items-center gap-2"><Clock className="h-5 w-5 text-emerald-400" />Upcoming Appointments</h2></div>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-center py-10"><CalendarDays className="h-12 w-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-400 mb-4">No upcoming appointments</p><Link href="/doctors"><Button className="bg-emerald-500 hover:bg-emerald-600">Book Now</Button></Link></div>
          ) : (
            <div className="space-y-3">{upcoming.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800">
                <div><p className="font-medium text-white">{a.reason}</p><p className="text-sm text-slate-400">{a.appointmentDate} at {a.timeSlot}</p></div>
                <span className={`text-xs px-2 py-1 rounded-full ${a.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{a.status}</span>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
