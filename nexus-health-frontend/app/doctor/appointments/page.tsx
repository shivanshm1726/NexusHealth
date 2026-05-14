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

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Appointments</h1>
      {a.length === 0 ? (
        <p className="text-slate-500 text-center py-20">No appointments</p>
      ) : (
        <div className="space-y-3">
          {a.map((apt) => (
            <Card key={apt.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{apt.reason}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
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
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-0">
                    {apt.status}
                  </Badge>
                  {apt.status === "CONFIRMED" && (
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => upd(apt.id, "IN_PROGRESS")}
                    >
                      Start
                    </Button>
                  )}
                  {apt.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600"
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
