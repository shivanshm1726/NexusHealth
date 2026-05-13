"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { toast } from "sonner";

export default function AdminDoctors() {
  const [p, setP] = useState<any[]>([]); const [a, setA] = useState<any[]>([]);
  useEffect(() => { api.get("/admin/doctors/pending").then(r => setP(r.data)).catch(() => {}); api.get("/doctors").then(r => setA(r.data)).catch(() => {}); }, []);
  const approve = async (id: string) => { try { await api.patch(`/admin/doctors/${id}/approve`); setP(x => x.filter(d => d.id !== id)); toast.success("Approved!"); } catch { toast.error("Failed"); } };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Manage Doctors</h1>
      {p.length > 0 && <Card className="bg-slate-900/50 border-slate-800 mb-6"><CardHeader><CardTitle className="text-white">Pending ({p.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">{p.map(doc => (<div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-3"><Avatar className="h-10 w-10 bg-amber-500/20"><AvatarFallback className="text-amber-400">{doc.fullName?.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium text-white">{doc.fullName}</p><p className="text-sm text-slate-400">{doc.specialization}</p></div></div>
          <Button size="sm" className="bg-emerald-500" onClick={() => approve(doc.id)}><Check className="h-4 w-4 mr-1" />Approve</Button>
        </div>))}</CardContent></Card>}
      <Card className="bg-slate-900/50 border-slate-800"><CardHeader><CardTitle className="text-white">Approved ({a.length})</CardTitle></CardHeader>
        <CardContent>{a.length === 0 ? <p className="text-slate-500 text-center py-6">None</p> : <div className="space-y-3">{a.map(doc => (<div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800">
          <div className="flex items-center gap-3"><Avatar className="h-10 w-10 bg-emerald-500/20"><AvatarFallback className="text-emerald-400">{doc.fullName?.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium text-white">{doc.fullName}</p><p className="text-sm text-slate-400">{doc.specialization}</p></div></div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-0">Active</Badge></div>))}</div>}</CardContent></Card>
    </div>
  );
}
