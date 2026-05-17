"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Clock, Video, MapPin, Loader2, IndianRupee } from "lucide-react";
import { toast } from "sonner";

export default function DoctorProfilePage() {
  const { id } = useParams(); const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [slots, setSlots] = useState<{time:string;available:boolean}[]>([]);
  const [date,setDate]=useState(""); const [selectedSlot,setSelectedSlot]=useState(""); const [reason,setReason]=useState(""); const [type,setType]=useState<"ONLINE"|"OFFLINE">("ONLINE"); const [booking,setBooking]=useState(false);

  useEffect(() => { api.get(`/doctors/${id}`).then(r => setDoctor(r.data)).catch(() => toast.error("Not found")); }, [id]);
  useEffect(() => { if (date && id) { api.get(`/doctors/${id}/slots?date=${date}`).then(r => setSlots(r.data)).catch(() => setSlots([])); }}, [date, id]);

  const handleBook = async () => {
    if (!selectedSlot || !reason || !date) { toast.error("Fill all fields"); return; }
    setBooking(true);
    try { await api.post("/appointments", { doctorId: id, appointmentDate: date, timeSlot: selectedSlot, reason, type, amount: doctor?.consultationFee || 500 }); toast.success("Booked!"); router.push("/appointments"); }
    catch (err:any) { toast.error(err.response?.data?.message || "Failed"); } finally { setBooking(false); }
  };

  if (!doctor) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl">
      <Card className="bg-white border-slate-200/80 shadow-sm mb-6">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl font-bold">{doctor.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{doctor.fullName}</h1>
              <Badge className="bg-blue-50 text-blue-600 border-0 mt-1 font-medium">{doctor.specialization}</Badge>
              {doctor.qualification && <p className="text-sm text-slate-500 mt-2">{doctor.qualification}</p>}
              <p className="text-lg font-semibold text-slate-900 mt-3 flex items-center gap-1"><IndianRupee className="h-4 w-4" />{doctor.consultationFee}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-blue-600" />Book Appointment</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex gap-3">
            <Button onClick={()=>setType("ONLINE")} className={type==="ONLINE"?"bg-blue-600 text-white shadow-sm":"bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}>
              <Video className="h-4 w-4 mr-2" />Online
            </Button>
            <Button onClick={()=>setType("OFFLINE")} className={type==="OFFLINE"?"bg-blue-600 text-white shadow-sm":"bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}>
              <MapPin className="h-4 w-4 mr-2" />Offline
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Date</Label>
            <Input type="date" min={today} value={date} onChange={e=>{setDate(e.target.value);setSelectedSlot("")}}
              className="bg-white border-slate-200 text-slate-900 max-w-xs h-11 focus:border-blue-500" />
          </div>
          {date && <div className="space-y-2"><Label className="text-slate-700 font-medium">Available Slots</Label>
            {slots.length===0 ? <p className="text-sm text-slate-400">No slots for this date</p> :
            <div className="flex flex-wrap gap-2">{slots.map(s => <Button key={s.time} size="sm" disabled={!s.available} onClick={()=>setSelectedSlot(s.time)}
              className={selectedSlot===s.time
                ?"bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                :s.available
                  ?"bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  :"opacity-40 bg-slate-50 border border-slate-100 text-slate-400"}>
              <Clock className="h-3 w-3 mr-1" />{s.time}</Button>)}</div>}
          </div>}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Reason for Visit</Label>
            <Textarea placeholder="Describe symptoms..." value={reason} onChange={e=>setReason(e.target.value)}
              className="bg-white border-slate-200 text-slate-900 focus:border-blue-500" />
          </div>
          <Button onClick={handleBook} disabled={booking||!selectedSlot||!reason}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full h-12 font-semibold shadow-lg shadow-blue-600/25">
            {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : `Book Appointment — ₹${doctor.consultationFee}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
