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
import { useNotification } from "@/contexts/NotificationContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [a, setA] = useState<any[]>([]);
  const { waitingPatients } = useNotification();

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
      (x.status === "CONFIRMED" || x.status === "PENDING_PAYMENT" || x.status === "IN_PROGRESS"),
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

  const statCards = [
    { l: "Today", v: today.length, i: CalendarDays, color: "blue" },
    { l: "Upcoming", v: a.filter((x) => x.status === "CONFIRMED").length, i: Clock, color: "emerald" },
    { l: "Completed", v: completedAppts.length, i: CheckCircle, color: "violet" },
    { l: "Patients", v: new Set(a.map((x) => x.patientId)).size, i: Users, color: "amber" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Doctor Dashboard</h1>
      <p className="text-slate-500 mb-8">
        Welcome, Dr. {user?.fullName?.split(" ").pop()}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
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

      {/* Earnings row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="bg-white border-slate-200/80 shadow-sm">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3 rounded-xl bg-emerald-50 shrink-0">
              <IndianRupee className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Today&apos;s Earnings</p>
              <p className="text-3xl font-bold text-emerald-600">
                ₹{todayEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {completedToday.length} consultation
                {completedToday.length !== 1 ? "s" : ""} completed today
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3 rounded-xl bg-violet-50 shrink-0">
              <TrendingUp className="h-7 w-7 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-violet-600">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {completedAppts.length} consultation
                {completedAppts.length !== 1 ? "s" : ""} completed overall
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings Breakdown */}
      <Card className="bg-white border-slate-200/80 shadow-sm mb-6">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-blue-600" />
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recentCompleted.length === 0 ? (
            <p className="text-slate-400 py-6 text-center">
              No completed consultations yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentCompleted.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {apt.patientName || "Patient"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {apt.reason} &middot; {apt.appointmentDate} at{" "}
                      {apt.timeSlot}
                    </p>
                  </div>
                  <span className="text-emerald-600 font-semibold text-sm">
                    +₹{Number(apt.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="bg-white border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {upcoming.length === 0 ? (
            <p className="text-slate-400 py-6 text-center">
              No upcoming appointments
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="font-medium text-slate-900">{apt.reason}</p>
                    <p className="text-sm text-slate-500">
                      {apt.appointmentDate} at {apt.timeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {waitingPatients[apt.id] && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Patient Waiting
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                      {apt.status}
                    </span>
                    {apt.status === "IN_PROGRESS" && (
                      <Link
                        href={`/consultation/${apt.id}`}
                        className={buttonVariants({
                          size: "sm",
                          className: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium",
                        })}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                      </Link>
                    )}
                    {apt.status === "CONFIRMED" && apt.type === "ONLINE" && (
                      <Link
                        href={`/consultation/${apt.id}`}
                        className={buttonVariants({
                          size: "sm",
                          className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium",
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
