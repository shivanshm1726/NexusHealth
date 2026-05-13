"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Stethoscope, CalendarDays, IndianRupee } from "lucide-react";

export default function AdminDashboard() {
  const [s, setS] = useState({ users: 0, doctors: 0, appointments: 0 });
  useEffect(() => { api.get("/admin/dashboard").then(r => setS(r.data)).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{l:"Users",v:s.users,i:Users,c:"text-emerald-400"},{l:"Doctors",v:s.doctors,i:Stethoscope,c:"text-cyan-400"},{l:"Appointments",v:s.appointments,i:CalendarDays,c:"text-violet-400"},{l:"Revenue",v:"₹0",i:IndianRupee,c:"text-amber-400"}].map(c=>(
          <Card key={c.l} className="bg-slate-900/50 border-slate-800"><CardContent className="p-6"><c.i className={`h-8 w-8 ${c.c} mb-2`}/><p className="text-2xl font-bold text-white">{c.v}</p><p className="text-sm text-slate-400">{c.l}</p></CardContent></Card>))}
      </div>
    </div>
  );
}
