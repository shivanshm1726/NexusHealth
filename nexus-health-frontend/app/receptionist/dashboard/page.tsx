"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, CheckCircle, IndianRupee } from "lucide-react";

export default function ReceptionistDashboard() {
  const [a, setA] = useState<any[]>([]);
  useEffect(() => { api.get("/appointments").then(r => setA(r.data)).catch(() => {}); }, []);
  const today = new Date().toISOString().split("T")[0];
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Receptionist Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[{l:"Today",v:a.filter(x=>x.appointmentDate===today).length,i:CalendarDays,c:"text-emerald-400"},{l:"Pending",v:a.filter(x=>x.status==="PENDING_PAYMENT").length,i:IndianRupee,c:"text-amber-400"},{l:"Confirmed",v:a.filter(x=>x.status==="CONFIRMED").length,i:CheckCircle,c:"text-cyan-400"},{l:"Total",v:a.length,i:Users,c:"text-violet-400"}].map(s=>(
          <Card key={s.l} className="bg-slate-900/50 border-slate-800"><CardContent className="p-6"><s.i className={`h-8 w-8 ${s.c} mb-2`}/><p className="text-2xl font-bold text-white">{s.v}</p><p className="text-sm text-slate-400">{s.l}</p></CardContent></Card>))}
      </div>
      <Card className="bg-slate-900/50 border-slate-800"><CardHeader><CardTitle className="text-white">All Appointments</CardTitle></CardHeader>
        <CardContent>{a.length===0?<p className="text-slate-500 text-center py-6">None</p>:<div className="space-y-3">{a.slice(0,20).map(apt=>(<div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800"><div><p className="font-medium text-white">{apt.reason}</p><p className="text-sm text-slate-400">{apt.appointmentDate} · {apt.timeSlot}</p></div><Badge className="bg-emerald-500/10 text-emerald-400 border-0">{apt.status}</Badge></div>))}</div>}</CardContent></Card>
    </div>
  );
}
