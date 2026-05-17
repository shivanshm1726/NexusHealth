"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DoctorAppointments() {
  const [a, setA] = useState<any[]>([]);
  useEffect(() => {
    api
      .get("/appointments/my")
      .then((r) => {
        const sorted = [...r.data].sort((a: any, b: any) => {
          const diff =
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime();
          if (diff !== 0) return diff;
          return b.timeSlot.localeCompare(a.timeSlot); // same date → later time first
        });
        setA(sorted);
      })
      .catch(() => {});
  }, []);
  const upd = async (id: string, s: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: s });
      setA((x) => x.map((z) => (z.id === id ? { ...z, status: s } : z)));
      toast.success("Updated");
    } catch {
      toast.error("Failed");
    }
  };

  const sc: Record<string, string> = {
    PENDING_PAYMENT: "bg-amber-50 text-amber-600",
    CONFIRMED: "bg-emerald-50 text-emerald-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-slate-100 text-slate-500",
    CANCELLED: "bg-red-50 text-red-500",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Appointments</h1>
      {a.length === 0 ? (
        <p className="text-slate-400 text-center py-20">No appointments</p>
      ) : (
        <div className="space-y-3">
          {a.map((apt) => (
            <Card key={apt.id} className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{apt.reason}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {apt.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {apt.timeSlot}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${sc[apt.status] || ""} border-0 font-medium`}>
                    {apt.status}
                  </Badge>
                  {apt.status === "CONFIRMED" && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
                      onClick={() => upd(apt.id, "IN_PROGRESS")}
                    >
                      Start
                    </Button>
                  )}
                  {apt.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium"
                      onClick={() => upd(apt.id, "COMPLETED")}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
