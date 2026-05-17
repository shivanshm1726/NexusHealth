"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Stethoscope, CalendarDays, IndianRupee } from "lucide-react";

export default function AdminDashboard() {
  const [s, setS] = useState({
    users: 0,
    doctors: 0,
    appointments: 0,
    revenue: 0,
  });

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((r) => setS(r.data))
      .catch(() => {});
  }, []);

  const stats = [
    { l: "Users", v: s.users, i: Users, color: "blue" },
    { l: "Doctors", v: s.doctors, i: Stethoscope, color: "emerald" },
    { l: "Appointments", v: s.appointments, i: CalendarDays, color: "violet" },
    {
      l: "Total Revenue",
      v: `₹${Number(s.revenue).toLocaleString("en-IN")}`,
      i: IndianRupee,
      color: "amber",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((c) => (
          <Card key={c.l} className="bg-white border-slate-200/80 shadow-sm">
            <CardContent className="p-6">
              <div className={`h-10 w-10 rounded-xl bg-${c.color}-50 flex items-center justify-center mb-3`}>
                <c.i className={`h-5 w-5 text-${c.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.v}</p>
              <p className="text-sm text-slate-500">{c.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
