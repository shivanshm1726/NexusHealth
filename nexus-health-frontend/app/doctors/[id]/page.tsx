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

  if (!doctor) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl">
      <Card className="bg-slate-900/50 border-slate-800 mb-6"><CardContent className="p-8">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20 bg-emerald-500/20"><AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-2xl">{doctor.fullName?.charAt(0)}</AvatarFallback></Avatar>
          <div><h1 className="text-2xl font-bold text-white">{doctor.fullName}</h1><Badge className="bg-emerald-500/10 text-emerald-400 border-0 mt-1">{doctor.specialization}</Badge>
            {doctor.qualification && <p className="text-sm text-slate-400 mt-2">{doctor.qualification}</p>}
            <p className="text-lg font-semibold text-white mt-3 flex items-center gap-1"><IndianRupee className="h-4 w-4" />{doctor.consultationFee}</p></div>
        </div>
      </CardContent></Card>

      <Card className="bg-slate-900/50 border-slate-800"><CardHeader><CardTitle className="text-white flex items-center gap-2"><CalendarDays className="h-5 w-5 text-emerald-400" />Book Appointment</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Button onClick={()=>setType("ONLINE")} className={type==="ONLINE"?"bg-emerald-500 text-white":"bg-transparent border border-slate-700 text-slate-300"}><Video className="h-4 w-4 mr-2" />Online</Button>
            <Button onClick={()=>setType("OFFLINE")} className={type==="OFFLINE"?"bg-emerald-500 text-white":"bg-transparent border border-slate-700 text-slate-300"}><MapPin className="h-4 w-4 mr-2" />Offline</Button>
          </div>
          <div className="space-y-2"><Label className="text-slate-300">Date</Label><Input type="date" min={today} value={date} onChange={e=>{setDate(e.target.value);setSelectedSlot("")}} className="bg-slate-800/50 border-slate-700 text-white max-w-xs" /></div>
          {date && <div className="space-y-2"><Label className="text-slate-300">Slots</Label>
            {slots.length===0 ? <p className="text-sm text-slate-500">No slots for this date</p> :
            <div className="flex flex-wrap gap-2">{slots.map(s => <Button key={s.time} size="sm" disabled={!s.available} onClick={()=>setSelectedSlot(s.time)}
              className={selectedSlot===s.time?"bg-emerald-500 text-white":s.available?"bg-transparent border border-slate-700 text-slate-300":"opacity-40 bg-transparent border border-slate-800 text-slate-600"}>
              <Clock className="h-3 w-3 mr-1" />{s.time}</Button>)}</div>}
          </div>}
          <div className="space-y-2"><Label className="text-slate-300">Reason</Label><Textarea placeholder="Describe symptoms..." value={reason} onChange={e=>setReason(e.target.value)} className="bg-slate-800/50 border-slate-700 text-white" /></div>
          <Button onClick={handleBook} disabled={booking||!selectedSlot||!reason} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full h-12">
            {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : `Book — ₹${doctor.consultationFee}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
