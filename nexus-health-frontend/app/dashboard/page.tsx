"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays, ArrowRight, Clock, MessageCircle, BrainCircuit, Loader2, AlertTriangle, Stethoscope, Send, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface TriageResult {
  analysis: string;
  specialty: string;
  isEmergency: boolean;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  useEffect(() => { api.get("/appointments/my").then(r => setAppointments(r.data)).catch(() => {}); }, []);
  const upcoming = appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING_PAYMENT");

  // AI Symptom Checker state
  const [symptoms, setSymptoms] = useState("");
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageError, setTriageError] = useState("");

  const handleTriage = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setTriageError("Please describe your symptoms in more detail.");
      return;
    }
    setTriageLoading(true);
    setTriageError("");
    setTriageResult(null);
    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTriageError(data.error || "Something went wrong.");
      } else {
        setTriageResult(data);
      }
    } catch {
      setTriageError("Could not connect to the AI service. Please try again.");
    } finally {
      setTriageLoading(false);
    }
  };

  const clearTriage = () => {
    setTriageResult(null);
    setTriageError("");
    setSymptoms("");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName?.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Your health journey overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/doctors", icon: Search, title: "Find a Doctor", sub: "Browse specialists", color: "blue" },
          { href: "/appointments", icon: CalendarDays, title: "Appointments", sub: `${upcoming.length} upcoming`, color: "emerald" },
          { href: "/chat", icon: MessageCircle, title: "Chat Support", sub: "Talk to receptionist", color: "violet" },
        ].map(c => (
          <Link key={c.href} href={c.href}>
            <Card className="bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-${c.color}-50 flex items-center justify-center group-hover:bg-${c.color}-100 transition-colors`}>
                  <c.icon className={`h-6 w-6 text-${c.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <p className="text-sm text-slate-500">{c.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* AI Symptom Checker */}
      <Card className="bg-gradient-to-br from-blue-50 via-white to-violet-50 border-blue-200/60 shadow-sm mb-8 overflow-hidden">
        <div className="p-6 border-b border-blue-100/60">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            AI Symptom Checker
            <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wide">Beta</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Describe your symptoms and our AI will suggest the right specialist for you.</p>
        </div>
        <CardContent className="p-6">
          {/* Input area */}
          <div className="flex gap-3 items-start">
            <div className="flex-1 relative">
              <textarea
                value={symptoms}
                onChange={e => { setSymptoms(e.target.value); setTriageError(""); }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTriage(); } }}
                placeholder="e.g. I've had a persistent headache and blurry vision for the past 3 days..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all"
                disabled={triageLoading}
              />
            </div>
            <Button
              onClick={handleTriage}
              disabled={triageLoading || !symptoms.trim()}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-600/25 h-12 px-5 rounded-xl font-semibold"
            >
              {triageLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Sparkles className="h-4 w-4 mr-1.5" />Analyze</>
              )}
            </Button>
          </div>

          {/* Error */}
          {triageError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {triageError}
            </div>
          )}

          {/* Result */}
          {triageResult && (
            <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Emergency warning */}
              {triageResult.isEmergency && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 text-sm">⚠️ Emergency Warning</p>
                    <p className="text-sm text-red-600 mt-0.5">
                      Your symptoms may indicate a serious condition. Please call emergency services or visit the nearest hospital immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm mb-1">AI Analysis</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{triageResult.analysis}</p>
                    </div>
                  </div>
                  <button onClick={clearTriage} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Specialty recommendation and CTA */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Recommended specialty:</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {triageResult.specialty}
                    </span>
                  </div>
                  <Link href={`/doctors?specialty=${encodeURIComponent(triageResult.specialty)}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium text-xs h-8 px-4">
                      Find {triageResult.specialty.charAt(0) + triageResult.specialty.slice(1).toLowerCase()} Specialists
                      <ArrowRight className="h-3 w-3 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 text-center">
                ⚕️ This is AI-generated guidance, not a medical diagnosis. Always consult a qualified healthcare professional.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="bg-white border-slate-200/80 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />Upcoming Appointments
          </h2>
        </div>
        <CardContent className="p-6">
          {upcoming.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No upcoming appointments</p>
              <Link href="/doctors"><Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25">Book Now</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">{upcoming.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">{a.reason}</p>
                  <p className="text-sm text-slate-500">{a.appointmentDate} at {a.timeSlot}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{a.status}</span>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
