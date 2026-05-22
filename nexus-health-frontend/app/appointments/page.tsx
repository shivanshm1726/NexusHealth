"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CalendarDays, Clock, Video, MapPin, IndianRupee, Loader2, Pill, Sparkles, AlertTriangle, Lightbulb, Timer, ShieldAlert, Heart } from "lucide-react";
import { toast } from "sonner";

interface MedicationExplain {
  name: string;
  purpose: string;
  dosage: string;
  timing: string;
  sideEffects: string;
  advice: string;
}

interface ExplainResult {
  medications: MedicationExplain[];
  generalAdvice: string;
}

export default function AppointmentsPage() {
  const [a, setA] = useState<any[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Prescription Explainer state
  const [explainLoadingId, setExplainLoadingId] = useState<string | null>(null);
  const [explainResults, setExplainResults] = useState<Record<string, ExplainResult>>({});
  const [showExplainId, setShowExplainId] = useState<string | null>(null);

  useEffect(() => { api.get("/appointments/my").then(r => setA(r.data)).catch(() => {}); }, []);

  const handlePayment = async (apt: any) => {
    try {
      setPayingId(apt.id);
      
      // 1. Get Razorpay key
      const configRes = await api.get("/payments/config");
      const keyId = configRes.data.keyId;

      // 2. Create Order
      const orderRes = await api.post("/payments/create-order", { appointmentId: apt.id });
      const { orderId, amount, currency } = orderRes.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "NexusHealth",
        description: `Consultation Payment - ${apt.reason}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // 4. Verify Payment
            await api.post("/payments/verify", response);
            toast.success("Payment successful! Appointment confirmed.");
            setA(prev => prev.map(x => x.id === apt.id ? { ...x, status: "CONFIRMED" } : x));
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: "Patient Name",
          email: "patient@example.com",
          contact: "9999999999",
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/appointments/${id}`);
      setA(x => x.filter(z => z.id !== id));
      toast.success("Cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const decodePrescription = async (appointmentId: string, planText: string) => {
    // If already decoded, just toggle visibility
    if (explainResults[appointmentId]) {
      setShowExplainId(showExplainId === appointmentId ? null : appointmentId);
      return;
    }

    try {
      setExplainLoadingId(appointmentId);
      setShowExplainId(appointmentId);
      const res = await fetch("/api/ai/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescription: planText }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        setShowExplainId(null);
        return;
      }

      setExplainResults(prev => ({ ...prev, [appointmentId]: data }));
    } catch {
      toast.error("Failed to decode prescription. Please try again.");
      setShowExplainId(null);
    } finally {
      setExplainLoadingId(null);
    }
  };

  const sc: Record<string,string> = {
    PENDING_PAYMENT: "bg-amber-50 text-amber-600",
    CONFIRMED: "bg-emerald-50 text-emerald-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-slate-100 text-slate-500",
    CANCELLED: "bg-red-50 text-red-500"
  };

  const medIcons = ["💊", "💉", "🩹", "🧴", "🫁", "🧪"];

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="text-2xl font-bold text-slate-900 mb-8">My Appointments</h1>
      {a.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No appointments yet</p>
        </div>
      ) : (
        <div className="space-y-4">{a.map(apt => (
          <Card key={apt.id} className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-900">{apt.reason}</h3>
                    <Badge className={`${sc[apt.status]||""} border-0 font-medium`}>{apt.status}</Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-medium">
                      {apt.type==="ONLINE"?<><Video className="h-3 w-3 mr-1"/>Online</>:<><MapPin className="h-3 w-3 mr-1"/>Offline</>}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3"/>{apt.appointmentDate}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{apt.timeSlot}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3"/>{apt.amount}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {apt.status==="COMPLETED"&&apt.notes&& (
                    <Button size="sm" variant="outline" className="border-violet-200 text-violet-600 hover:bg-violet-50 font-medium" onClick={() => setExpandedNotesId(expandedNotesId === apt.id ? null : apt.id)}>
                      🩺 {expandedNotesId === apt.id ? "Hide Clinical Records" : "View Clinical Records"}
                    </Button>
                  )}
                  {apt.status==="PENDING_PAYMENT"&& (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium" onClick={() => handlePayment(apt)} disabled={payingId === apt.id}>
                      {payingId === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay Now"}
                    </Button>
                  )}
                  {apt.status==="CONFIRMED"&&apt.type==="ONLINE"&& (
                    <Link href={`/consultation/${apt.id}`} className={buttonVariants({ size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium" })}>
                      <Video className="w-4 h-4 mr-2" />Join Call
                    </Link>
                  )}
                  {apt.status!=="COMPLETED"&&apt.status!=="CANCELLED"&&
                    <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 font-medium" onClick={() => handleCancel(apt.id)}>Cancel</Button>}
                </div>
              </div>
              
              {/* Expandable SOAP Note View */}
              {expandedNotesId === apt.id && apt.notes && (() => {
                try {
                  const soap = JSON.parse(apt.notes);
                  return (
                    <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 border border-violet-100/60 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="col-span-full border-b border-violet-100 pb-3 flex justify-between items-center">
                        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          📋 AI Medical Scribe Summaries
                        </h4>
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-100/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Verified Records
                        </span>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">🗣️ Subjective (Your symptoms)</span>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{soap.subjective}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">🔬 Objective (Clinical findings)</span>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{soap.objective}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">🩺 Assessment (Doctor&apos;s diagnosis)</span>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{soap.assessment}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-600">📝 Plan &amp; Prescriptions (Next steps)</span>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{soap.plan}</p>
                      </div>

                      {soap.summary && (
                        <div className="col-span-full p-4 rounded-xl bg-violet-50/60 border border-violet-100/50 mt-1">
                          <span className="text-xs font-bold text-violet-700">📌 Overview Summary:</span>
                          <p className="text-sm text-slate-700 mt-1">{soap.summary}</p>
                        </div>
                      )}

                      {/* Prescription Explainer Section */}
                      {soap.plan && soap.plan !== "Not documented." && soap.plan !== "Not documented in this consultation." && (
                        <div className="col-span-full mt-1">
                          {/* Decode Button */}
                          <Button
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium h-11 text-sm rounded-xl"
                            onClick={() => decodePrescription(apt.id, soap.plan)}
                            disabled={explainLoadingId === apt.id}
                          >
                            {explainLoadingId === apt.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Decoding your prescription...
                              </>
                            ) : showExplainId === apt.id && explainResults[apt.id] ? (
                              <>
                                <Pill className="h-4 w-4 mr-2" />
                                Hide Prescription Details
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                💊 Decode &amp; Explain Prescription
                              </>
                            )}
                          </Button>

                          {/* Loading Skeleton */}
                          {explainLoadingId === apt.id && (
                            <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                              {[1, 2].map(i => (
                                <div key={i} className="p-4 rounded-xl bg-white border border-teal-100 shadow-sm">
                                  <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-teal-100 rounded-full w-1/3"></div>
                                    <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                                    <div className="h-3 bg-slate-100 rounded-full w-2/3"></div>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                      <div className="h-3 bg-amber-50 rounded-full"></div>
                                      <div className="h-3 bg-blue-50 rounded-full"></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Decoded Prescription Results */}
                          {showExplainId === apt.id && explainResults[apt.id] && !explainLoadingId && (
                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                              {/* Header */}
                              <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                                    <Pill className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                                    Your Prescription Explained
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles className="h-2.5 w-2.5" /> AI Decoded
                                </span>
                              </div>

                              {/* Medication Cards */}
                              {explainResults[apt.id].medications.map((med, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden"
                                >
                                  {/* Accent bar */}
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-l-xl" />
                                  
                                  {/* Drug name + purpose */}
                                  <div className="pl-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <h5 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                          <span>{medIcons[idx % medIcons.length]}</span>
                                          {med.name}
                                        </h5>
                                        <p className="text-xs text-teal-600 font-medium mt-0.5">{med.purpose}</p>
                                      </div>
                                      {med.dosage && med.dosage !== "N/A" && (
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                          {med.dosage}
                                        </span>
                                      )}
                                    </div>

                                    {/* Details grid */}
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      {/* Timing */}
                                      <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100/60">
                                        <Timer className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">When to Take</span>
                                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{med.timing}</p>
                                        </div>
                                      </div>

                                      {/* Side Effects */}
                                      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/60 border border-amber-100/60">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Side Effects</span>
                                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{med.sideEffects}</p>
                                        </div>
                                      </div>

                                      {/* Advice */}
                                      <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/60 border border-blue-100/60">
                                        <Lightbulb className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Pro Tip</span>
                                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{med.advice}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* General Advice Footer */}
                              {explainResults[apt.id].generalAdvice && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 via-cyan-50 to-sky-50 border border-teal-100/60 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                      <Heart className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700">General Health Advice</span>
                                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{explainResults[apt.id].generalAdvice}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Disclaimer */}
                              <div className="flex items-center gap-2 px-1">
                                <ShieldAlert className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                  AI-generated explanation for your understanding. Always follow your doctor&apos;s exact instructions. If in doubt, consult your pharmacist.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      📄 Physical Notes: {apt.notes}
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        ))}</div>
      )}
    </div>
  );
}
