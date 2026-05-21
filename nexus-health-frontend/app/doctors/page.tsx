"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Stethoscope, IndianRupee, BrainCircuit, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DoctorsPage() {
  const searchParams = useSearchParams();
  const aiSpecialty = searchParams.get("specialty");

  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState(aiSpecialty || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/doctors").then(r => { setDoctors(r.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  // If AI sent a specialty via query param, pre-fill the filter
  useEffect(() => {
    if (aiSpecialty) {
      setSpecialtyFilter(aiSpecialty);
    }
  }, [aiSpecialty]);

  const filtered = doctors.filter(d => {
    const matchesSearch = d.fullName.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = !specialtyFilter || d.specialization.toLowerCase().includes(specialtyFilter.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  const clearSpecialtyFilter = () => {
    setSpecialtyFilter("");
    // Update the URL without the query param
    window.history.replaceState({}, "", "/doctors");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Find a Doctor</h1>
      <p className="text-slate-500 mb-6">Browse specialists and book an appointment</p>

      {/* AI Specialty Filter Banner */}
      {specialtyFilter && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <BrainCircuit className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm text-slate-600">
              AI recommended: <span className="font-semibold text-blue-600">{specialtyFilter}</span> specialists
            </span>
          </div>
          <button
            onClick={clearSpecialtyFilter}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-white border-slate-200 text-slate-900 max-w-md h-11 focus:border-blue-500 focus:ring-blue-500/20" />
      </div>
      {loading ? <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />)}</div>
      : filtered.length === 0 ? <div className="text-center py-20"><Stethoscope className="h-12 w-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-500">No doctors found{specialtyFilter ? ` for "${specialtyFilter}"` : ""}</p>
        {specialtyFilter && <Button onClick={clearSpecialtyFilter} variant="outline" className="mt-4 border-slate-200 text-slate-600 hover:bg-slate-50">Show All Doctors</Button>}
      </div>
      : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(doc => (
          <Card key={doc.id} className="bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-lg font-semibold">{doc.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">{doc.fullName}</h3>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-0 mt-1 font-medium">{doc.specialization}</Badge>
                </div>
              </div>
              {doc.qualification && <p className="text-xs text-slate-400 mb-2">{doc.qualification}</p>}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-600 flex items-center gap-1 font-medium"><IndianRupee className="h-3.5 w-3.5" />{doc.consultationFee}</span>
                <Link href={`/doctors/${doc.userId}`}><Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium">Book</Button></Link>
              </div>
            </CardContent>
          </Card>
        ))}</div>}
    </div>
  );
}
