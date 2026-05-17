"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Mail, Lock, User, Phone, Loader2, Stethoscope, Shield, Video, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register, registerDoctor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pName, setPName] = useState(""); const [pEmail, setPEmail] = useState(""); const [pPassword, setPPassword] = useState(""); const [pPhone, setPPhone] = useState("");
  const [dName, setDName] = useState(""); const [dEmail, setDEmail] = useState(""); const [dPassword, setDPassword] = useState(""); const [dSpec, setDSpec] = useState(""); const [dQual, setDQual] = useState("");

  const handlePatient = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true);
    try { await register({ fullName: pName, email: pEmail, password: pPassword, phone: pPhone }); toast.success("Account created!"); }
    catch (err: any) { toast.error(err.response?.data?.message || "Failed"); } finally { setLoading(false); } };

  const handleDoctor = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true);
    try { await registerDoctor({ fullName: dName, email: dEmail, password: dPassword, specialization: dSpec, qualification: dQual }); toast.success("Submitted!"); }
    catch (err: any) { toast.error(err.response?.data?.message || "Failed"); } finally { setLoading(false); } };

  const fc = "h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Blue Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="NexusHealth Logo" className="h-12 w-auto object-contain bg-white/80 p-2 rounded-xl backdrop-blur" />
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">Start your healthcare journey today</h2>
          <p className="text-blue-100 text-lg mb-12 max-w-md">Create your account and get instant access to world-class healthcare services.</p>
          <div className="space-y-5">
            {[
              { icon: Video, text: "HD Video Consultations" },
              { icon: Calendar, text: "Smart Appointment Scheduling" },
              { icon: Shield, text: "End-to-End Encrypted" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center"><f.icon className="h-4 w-4 text-blue-200" /></div>
                <span className="text-blue-50 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <img src="/logo.png" alt="NexusHealth Logo" className="h-10 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500">Choose your role to get started</p>
          </div>

          <Tabs defaultValue="patient">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 mb-6 h-11">
              <TabsTrigger value="patient" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium">
                <User className="h-4 w-4 mr-2" />Patient
              </TabsTrigger>
              <TabsTrigger value="doctor" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium">
                <Stethoscope className="h-4 w-4 mr-2" />Doctor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <form onSubmit={handlePatient} className="space-y-4">
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Full Name</Label><Input placeholder="John Doe" value={pName} onChange={e=>setPName(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Email</Label><Input type="email" placeholder="you@example.com" value={pEmail} onChange={e=>setPEmail(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Phone</Label><Input placeholder="9876543210" value={pPhone} onChange={e=>setPPhone(e.target.value)} className={fc} /></div>
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Password</Label><Input type="password" placeholder="Min 8 characters" value={pPassword} onChange={e=>setPPassword(e.target.value)} className={fc} required minLength={8} /></div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold shadow-lg shadow-blue-600/25" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="doctor">
              <form onSubmit={handleDoctor} className="space-y-4">
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Full Name</Label><Input placeholder="Dr. Jane" value={dName} onChange={e=>setDName(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Email</Label><Input type="email" value={dEmail} onChange={e=>setDEmail(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Specialization</Label><Input placeholder="Cardiology" value={dSpec} onChange={e=>setDSpec(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Qualification</Label><Input placeholder="MBBS, MD" value={dQual} onChange={e=>setDQual(e.target.value)} className={fc} /></div>
                <div className="space-y-2"><Label className="text-slate-700 font-medium">Password</Label><Input type="password" value={dPassword} onChange={e=>setDPassword(e.target.value)} className={fc} required minLength={8} /></div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold shadow-lg shadow-blue-600/25" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register as Doctor"}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-slate-500 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
