"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays, Video, ArrowRight, Clock, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  useEffect(() => { api.get("/appointments/my").then(r => setAppointments(r.data)).catch(() => {}); }, []);
  const upcoming = appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING_PAYMENT");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName?.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Your health journey overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/doctors", icon: Search, title: "Find a Doctor", sub: "Browse specialists", color: "blue" },
          { href: "/appointments", icon: CalendarDays, title: "Appointments", sub: `${upcoming.length} upcoming`, color: "emerald" },
          { href: "/chat", icon: MessageCircle, title: "Chat Support", sub: "Talk to receptionist", color: "violet" },
        ].map(c => (
          <Link key={c.href} href={c.href}>
            <Card className="bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-${c.color}-50 flex items-center justify-center group-hover:bg-${c.color}-100 transition-colors`}>
                  <c.icon className={`h-6 w-6 text-${c.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <p className="text-sm text-slate-500">{c.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-white border-slate-200/80 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />Upcoming Appointments
          </h2>
        </div>
        <CardContent className="p-6">
          {upcoming.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No upcoming appointments</p>
              <Link href="/doctors"><Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25">Book Now</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">{upcoming.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">{a.reason}</p>
                  <p className="text-sm text-slate-500">{a.appointmentDate} at {a.timeSlot}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{a.status}</span>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
