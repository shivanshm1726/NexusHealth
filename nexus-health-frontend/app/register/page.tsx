"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Mail, Lock, User, Phone, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const fc = "bg-slate-800/50 border-slate-700 text-white";
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8"><Activity className="h-8 w-8 text-emerald-400" /><span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">NexusHealth</span></Link>
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <CardHeader className="text-center"><CardTitle className="text-2xl text-white">Create account</CardTitle><CardDescription className="text-slate-400">Choose your role</CardDescription></CardHeader>
          <CardContent>
            <Tabs defaultValue="patient">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-6"><TabsTrigger value="patient" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><User className="h-4 w-4 mr-2" />Patient</TabsTrigger><TabsTrigger value="doctor" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Stethoscope className="h-4 w-4 mr-2" />Doctor</TabsTrigger></TabsList>
              <TabsContent value="patient"><form onSubmit={handlePatient} className="space-y-4">
                <div className="space-y-2"><Label className="text-slate-300">Full Name</Label><Input placeholder="John Doe" value={pName} onChange={e=>setPName(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-300">Email</Label><Input type="email" placeholder="you@example.com" value={pEmail} onChange={e=>setPEmail(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-300">Phone</Label><Input placeholder="9876543210" value={pPhone} onChange={e=>setPPhone(e.target.value)} className={fc} /></div>
                <div className="space-y-2"><Label className="text-slate-300">Password</Label><Input type="password" placeholder="Min 8 chars" value={pPassword} onChange={e=>setPPassword(e.target.value)} className={fc} required minLength={8} /></div>
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}</Button>
              </form></TabsContent>
              <TabsContent value="doctor"><form onSubmit={handleDoctor} className="space-y-4">
                <div className="space-y-2"><Label className="text-slate-300">Full Name</Label><Input placeholder="Dr. Jane" value={dName} onChange={e=>setDName(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-300">Email</Label><Input type="email" value={dEmail} onChange={e=>setDEmail(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-300">Specialization</Label><Input placeholder="Cardiology" value={dSpec} onChange={e=>setDSpec(e.target.value)} className={fc} required /></div>
                <div className="space-y-2"><Label className="text-slate-300">Qualification</Label><Input placeholder="MBBS, MD" value={dQual} onChange={e=>setDQual(e.target.value)} className={fc} /></div>
                <div className="space-y-2"><Label className="text-slate-300">Password</Label><Input type="password" value={dPassword} onChange={e=>setDPassword(e.target.value)} className={fc} required minLength={8} /></div>
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register as Doctor"}</Button>
              </form></TabsContent>
            </Tabs>
            <p className="text-center text-sm text-slate-400 mt-6">Have an account? <Link href="/login" className="text-emerald-400 hover:underline">Sign in</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
