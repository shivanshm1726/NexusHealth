"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Clock, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aptRes, docRes] = await Promise.all([
        api.get("/admin/appointments"),
        api.get("/doctors")
      ]);
      // Sort by date descending
      const sortedApts = aptRes.data.sort((a: any, b: any) => 
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      );
      setAppointments(sortedApts);
      setDoctors(docRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.patch(`/admin/appointments/${id}/cancel`);
      toast.success("Appointment cancelled successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to cancel appointment");
    }
  };

  const openReassignDialog = (apt: any) => {
    setSelectedAppointment(apt);
    setSelectedDoctorId(apt.doctorId);
    setIsReassignOpen(true);
  };

  const handleReassign = async () => {
    if (!selectedDoctorId) {
      toast.error("Please select a doctor");
      return;
    }
    try {
      await api.patch(`/admin/appointments/${selectedAppointment.id}/reassign`, {
        doctorId: selectedDoctorId
      });
      toast.success("Doctor reassigned successfully");
      setIsReassignOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reassign doctor");
    }
  };

  const rc: Record<string, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-600",
    PENDING_PAYMENT: "bg-amber-50 text-amber-600",
    CANCELLED: "bg-red-50 text-red-600",
    COMPLETED: "bg-blue-50 text-blue-600"
  };

  const filtered = filter === "ALL" 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Master Appointment Log</h1>
      <Card className="bg-white border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-slate-900">{filtered.length} Appointments</CardTitle>
          <div className="flex gap-2">
            {["ALL", "CONFIRMED", "PENDING_PAYMENT", "COMPLETED", "CANCELLED"].map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className={filter === f ? "bg-slate-900 text-white" : "text-slate-600"}
              >
                {f.replace("_", " ")}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {filtered.map(apt => (
              <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl bg-slate-50 border border-slate-100 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold">{apt.patientName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Patient</p>
                      <p className="font-medium text-slate-900">{apt.patientName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-50 text-emerald-600 font-semibold">{apt.doctorName?.charAt(0) || "D"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Doctor</p>
                      <p className="font-medium text-slate-900">{apt.doctorName || "Unknown Doctor"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 min-w-[200px]">
                  <div className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400" /> {apt.appointmentDate}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {apt.timeSlot}</div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 min-w-[250px]">
                  <Badge className={`${rc[apt.status] || "bg-slate-100 text-slate-600"} border-0 font-medium px-3 py-1`}>
                    {apt.status}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Reassign Doctor"
                          onClick={() => openReassignDialog(apt)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Cancel Appointment"
                          onClick={() => cancelAppointment(apt.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-slate-400 py-8">No appointments found</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReassignOpen} onOpenChange={setIsReassignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Doctor</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 mb-4">
              Select a new doctor for {selectedAppointment?.patientName}'s appointment on {selectedAppointment?.appointmentDate} at {selectedAppointment?.timeSlot}.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Available Doctors</label>
              <select 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="" disabled>Select a doctor</option>
                {doctors.map(doc => (
                  <option key={doc.userId} value={doc.userId}>
                    Dr. {doc.fullName} ({doc.specialization || "General"})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignOpen(false)}>Cancel</Button>
            <Button onClick={handleReassign} className="bg-slate-900 text-white hover:bg-slate-800">
              Confirm Reassignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
