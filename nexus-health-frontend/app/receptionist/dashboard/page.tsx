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

  const sc: Record<string, string> = {
    PENDING_PAYMENT: "bg-amber-50 text-amber-600",
    CONFIRMED: "bg-emerald-50 text-emerald-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-slate-100 text-slate-500",
    CANCELLED: "bg-red-50 text-red-500",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Receptionist Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {l:"Today",v:a.filter(x=>x.appointmentDate===today).length,i:CalendarDays,color:"blue"},
          {l:"Pending",v:a.filter(x=>x.status==="PENDING_PAYMENT").length,i:IndianRupee,color:"amber"},
          {l:"Confirmed",v:a.filter(x=>x.status==="CONFIRMED").length,i:CheckCircle,color:"emerald"},
          {l:"Total",v:a.length,i:Users,color:"violet"}
        ].map(s=>(
          <Card key={s.l} className="bg-white border-slate-200/80 shadow-sm">
            <CardContent className="p-6">
              <div className={`h-10 w-10 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-3`}>
                <s.i className={`h-5 w-5 text-${s.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.v}</p>
              <p className="text-sm text-slate-500">{s.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-white border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">All Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {a.length===0?<p className="text-slate-400 text-center py-6">None</p>:
          <div className="space-y-3">{a.slice(0,20).map(apt=>(
            <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-medium text-slate-900">{apt.reason}</p>
                <p className="text-sm text-slate-500">{apt.appointmentDate} · {apt.timeSlot}</p>
              </div>
              <Badge className={`${sc[apt.status] || ""} border-0 font-medium`}>{apt.status}</Badge>
            </div>
          ))}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
