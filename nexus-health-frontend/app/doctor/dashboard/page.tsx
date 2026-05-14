"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  Video,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [a, setA] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/appointments/my")
      .then((r) => setA(r.data))
      .catch(() => {});
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const today = a.filter((x) => x.appointmentDate === todayStr);
  const upcoming = a.filter(
    (x) =>
      x.appointmentDate >= todayStr &&
      (x.status === "CONFIRMED" || x.status === "PENDING_PAYMENT"),
  );
  const completedAppts = a.filter((x) => x.status === "COMPLETED");

  // Earnings calculations
  const completedToday = completedAppts.filter(
    (x) => x.appointmentDate === todayStr,
  );
  const todayEarnings = completedToday.reduce(
    (sum, x) => sum + Number(x.amount || 0),
    0,
  );
  const totalEarnings = completedAppts.reduce(
    (sum, x) => sum + Number(x.amount || 0),
    0,
  );

  // Most recent completed appointments (for breakdown)
  const recentCompleted = [...completedAppts]
    .sort((a, b) => {
      const diff =
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime();
      return diff !== 0 ? diff : b.timeSlot.localeCompare(a.timeSlot);
    })
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Doctor Dashboard</h1>
      <p className="text-slate-400 mb-8">
        Welcome, Dr. {user?.fullName?.split(" ").pop()}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            l: "Today",
            v: today.length,
            i: CalendarDays,
            c: "text-emerald-400",
          },
          {
            l: "Upcoming",
            v: a.filter((x) => x.status === "CONFIRMED").length,
            i: Clock,
            c: "text-cyan-400",
          },
          {
            l: "Completed",
            v: completedAppts.length,
            i: CheckCircle,
            c: "text-violet-400",
          },
          {
            l: "Patients",
            v: new Set(a.map((x) => x.patientId)).size,
            i: Users,
            c: "text-amber-400",
          },
        ].map((s) => (
          <Card key={s.l} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <s.i className={`h-8 w-8 ${s.c} mb-2`} />
              <p className="text-2xl font-bold text-white">{s.v}</p>
              <p className="text-sm text-slate-400">{s.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Today's Earnings */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3 rounded-xl bg-emerald-500/10 shrink-0">
              <IndianRupee className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Today's Earnings</p>
              <p className="text-3xl font-bold text-emerald-400">
                ₹{todayEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {completedToday.length} consultation
                {completedToday.length !== 1 ? "s" : ""} completed today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3 rounded-xl bg-violet-500/10 shrink-0">
              <TrendingUp className="h-7 w-7 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-violet-400">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {completedAppts.length} consultation
                {completedAppts.length !== 1 ? "s" : ""} completed overall
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings Breakdown */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-emerald-400" />
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCompleted.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">
              No completed consultations yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentCompleted.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800"
                >
                  <div>
                    <p className="font-medium text-white text-sm">
                      {apt.patientName || "Patient"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {apt.reason} &middot; {apt.appointmentDate} at{" "}
                      {apt.timeSlot}
                    </p>
                  </div>
                  <span className="text-emerald-400 font-semibold text-sm">
                    +₹{Number(apt.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">
              No upcoming appointments
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800"
                >
                  <div>
                    <p className="font-medium text-white">{apt.reason}</p>
                    <p className="text-sm text-slate-400">
                      {apt.appointmentDate} at {apt.timeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                      {apt.status}
                    </span>
                    {apt.status === "CONFIRMED" && apt.type === "ONLINE" && (
                      <Link
                        href={`/consultation/${apt.id}`}
                        className={buttonVariants({
                          size: "sm",
                          className: "bg-blue-600 hover:bg-blue-700 text-white",
                        })}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
