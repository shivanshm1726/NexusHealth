"use client";
import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DAYS=["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
export default function SchedulePage() {
  const [dur,setDur]=useState(30); const [saving,setSaving]=useState(false);
  const [sch,setSch]=useState(DAYS.map(d=>({dayOfWeek:d,startTime:d==="SATURDAY"||d==="SUNDAY"?"":"09:00",endTime:d==="SATURDAY"||d==="SUNDAY"?"":"17:00",isActive:d!=="SATURDAY"&&d!=="SUNDAY"})));
  const up=(i:number,f:string,v:any)=>setSch(s=>s.map((d,j)=>j===i?{...d,[f]:v}:d));

  const save=async()=>{setSaving(true);try{await api.put("/doctors/schedule",{slotDuration:dur,schedules:sch.filter(s=>s.isActive)});toast.success("Saved!")}catch{toast.error("Failed")}finally{setSaving(false)}};

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-8">Manage Schedule</h1>
      <Card className="bg-slate-900/50 border-slate-800 mb-6"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Clock className="h-5 w-5 text-emerald-400"/>Slot Duration</CardTitle></CardHeader>
        <CardContent><div className="flex items-center gap-4"><Input type="number" value={dur} onChange={e=>setDur(+e.target.value)} className="w-24 bg-slate-800/50 border-slate-700 text-white" min={10}/><span className="text-slate-400">minutes</span></div></CardContent></Card>
      <Card className="bg-slate-900/50 border-slate-800"><CardHeader><CardTitle className="text-white">Weekly Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {sch.map((d,i)=>(<div key={d.dayOfWeek} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/20">
            <Switch checked={d.isActive} onCheckedChange={v=>up(i,"isActive",v)}/>
            <span className={`w-28 text-sm font-medium ${d.isActive?"text-white":"text-slate-600"}`}>{d.dayOfWeek.charAt(0)+d.dayOfWeek.slice(1).toLowerCase()}</span>
            {d.isActive&&<div className="flex items-center gap-2"><Input type="time" value={d.startTime} onChange={e=>up(i,"startTime",e.target.value)} className="w-32 bg-slate-800/50 border-slate-700 text-white text-sm"/><span className="text-slate-500">to</span><Input type="time" value={d.endTime} onChange={e=>up(i,"endTime",e.target.value)} className="w-32 bg-slate-800/50 border-slate-700 text-white text-sm"/></div>}
          </div>))}
          <Button onClick={save} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full mt-4" disabled={saving}>{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<><Save className="h-4 w-4 mr-2"/>Save</>}</Button>
        </CardContent></Card>
    </div>
  );
}
