"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, CalendarDays, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [s, setS] = useState({
    users: 0,
    doctors: 0,
    appointments: 0,
    revenue: 0,
    revenueByDoctor: [],
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Revenue by Doctor</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {s.revenueByDoctor?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.revenueByDoctor} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="doctorName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No revenue data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
