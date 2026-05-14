"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Users, Clock, CheckCircle, Video } from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [a, setA] = useState<any[]>([]);
  useEffect(() => { api.get("/appointments/my").then(r => setA(r.data)).catch(() => {}); }, []);
  const today = a.filter(x => x.appointmentDate === new Date().toISOString().split("T")[0]);
  const upcoming = a.filter(x => x.appointmentDate >= new Date().toISOString().split("T")[0] && (x.status === "CONFIRMED" || x.status === "PENDING_PAYMENT"));

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Doctor Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome, Dr. {user?.fullName?.split(" ").pop()}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[{l:"Today",v:today.length,i:CalendarDays,c:"text-emerald-400"},{l:"Upcoming",v:a.filter(x=>x.status==="CONFIRMED").length,i:Clock,c:"text-cyan-400"},{l:"Completed",v:a.filter(x=>x.status==="COMPLETED").length,i:CheckCircle,c:"text-violet-400"},{l:"Patients",v:new Set(a.map(x=>x.patientId)).size,i:Users,c:"text-amber-400"}].map(s=>(
          <Card key={s.l} className="bg-slate-900/50 border-slate-800"><CardContent className="p-6"><s.i className={`h-8 w-8 ${s.c} mb-2`}/><p className="text-2xl font-bold text-white">{s.v}</p><p className="text-sm text-slate-400">{s.l}</p></CardContent></Card>))}
      </div>
      <Card className="bg-slate-900/50 border-slate-800"><CardHeader><CardTitle className="text-white">Upcoming Appointments</CardTitle></CardHeader>
        <CardContent>{upcoming.length===0?<p className="text-slate-500 py-6 text-center">No upcoming appointments</p>:<div className="space-y-3">{upcoming.map(apt=>(<div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800"><div><p className="font-medium text-white">{apt.reason}</p><p className="text-sm text-slate-400">{apt.appointmentDate} at {apt.timeSlot}</p></div><div className="flex items-center gap-2"><span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{apt.status}</span>{apt.status==="CONFIRMED"&&apt.type==="ONLINE"&&<Link href={`/consultation/${apt.id}`} className={buttonVariants({ size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white" })}><Video className="w-4 h-4 mr-2" />Join Call</Link>}</div></div>))}</div>}</CardContent>
      </Card>
    </div>
  );
}
