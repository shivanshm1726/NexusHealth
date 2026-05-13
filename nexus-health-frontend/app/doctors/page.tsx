"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Stethoscope, IndianRupee } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/doctors").then(r => { setDoctors(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const filtered = doctors.filter(d => d.fullName.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Find a Doctor</h1>
      <p className="text-slate-400 mb-6">Browse specialists and book an appointment</p>
      <div className="relative mb-6"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-slate-900/50 border-slate-800 text-white max-w-md" /></div>
      {loading ? <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-900/50 animate-pulse" />)}</div>
      : filtered.length === 0 ? <div className="text-center py-20"><Stethoscope className="h-12 w-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-400">No doctors found</p></div>
      : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(doc => (
          <Card key={doc.id} className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-14 w-14 bg-emerald-500/20"><AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-lg">{doc.fullName.charAt(0)}</AvatarFallback></Avatar>
                <div><h3 className="font-semibold text-white">{doc.fullName}</h3><Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 mt-1">{doc.specialization}</Badge></div>
              </div>
              {doc.qualification && <p className="text-xs text-slate-500 mb-2">{doc.qualification}</p>}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-300 flex items-center gap-1"><IndianRupee className="h-3 w-3" />{doc.consultationFee}</span>
                <Link href={`/doctors/${doc.userId}`}><Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Book</Button></Link>
              </div>
            </CardContent>
          </Card>
        ))}</div>}
    </div>
  );
}
