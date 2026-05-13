"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminUsers() {
  const [u, setU] = useState<any[]>([]);
  useEffect(() => { api.get("/admin/users").then(r => setU(r.data)).catch(() => {}); }, []);
  const rc: Record<string, string> = { ADMIN: "bg-violet-500/10 text-violet-400", DOCTOR: "bg-cyan-500/10 text-cyan-400", RECEPTIONIST: "bg-amber-500/10 text-amber-400", PATIENT: "bg-emerald-500/10 text-emerald-400" };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">All Users</h1>
      <Card className="bg-slate-900/50 border-slate-800"><CardHeader><CardTitle className="text-white">{u.length} Users</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{u.map(user => (<div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800">
          <div className="flex items-center gap-3"><Avatar className="h-10 w-10 bg-slate-800"><AvatarFallback className="text-slate-400">{user.fullName?.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium text-white">{user.fullName}</p><p className="text-sm text-slate-500">{user.email}</p></div></div>
          <Badge className={`${rc[user.role] || ""} border-0`}>{user.role}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
