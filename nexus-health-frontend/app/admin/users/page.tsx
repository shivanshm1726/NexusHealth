"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminUsers() {
  const [u, setU] = useState<any[]>([]);
  useEffect(() => { api.get("/admin/users").then(r => setU(r.data)).catch(() => {}); }, []);
  const rc: Record<string, string> = {
    ADMIN: "bg-violet-50 text-violet-600",
    DOCTOR: "bg-emerald-50 text-emerald-600",
    RECEPTIONIST: "bg-amber-50 text-amber-600",
    PATIENT: "bg-blue-50 text-blue-600"
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">All Users</h1>
      <Card className="bg-white border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">{u.length} Users</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">{u.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold">{user.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{user.fullName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <Badge className={`${rc[user.role] || ""} border-0 font-medium`}>{user.role}</Badge>
            </div>
          ))}</div>
        </CardContent>
      </Card>
    </div>
  );
}
