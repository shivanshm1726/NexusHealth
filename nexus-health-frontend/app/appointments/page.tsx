"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CalendarDays, Clock, Video, MapPin, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const [a, setA] = useState<any[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);

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

  const sc: Record<string,string> = {
    PENDING_PAYMENT: "bg-amber-50 text-amber-600",
    CONFIRMED: "bg-emerald-50 text-emerald-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-slate-100 text-slate-500",
    CANCELLED: "bg-red-50 text-red-500"
  };

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
            <CardContent className="p-6 flex items-center justify-between">
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
            </CardContent>
          </Card>
        ))}</div>
      )}
    </div>
  );
}
