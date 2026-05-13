"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await login(email, password); toast.success("Welcome back!"); }
    catch (err: any) { toast.error(err.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Activity className="h-8 w-8 text-emerald-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">NexusHealth</span>
        </Link>
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <CardHeader className="text-center"><CardTitle className="text-2xl text-white">Welcome back</CardTitle><CardDescription className="text-slate-400">Sign in to continue</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label className="text-slate-300">Email</Label><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-slate-800/50 border-slate-700 text-white" required /></div></div>
              <div className="space-y-2"><Label className="text-slate-300">Password</Label><div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-slate-800/50 border-slate-700 text-white" required /></div></div>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}</Button>
            </form>
            <p className="text-center text-sm text-slate-400 mt-6">No account? <Link href="/register" className="text-emerald-400 hover:underline">Sign up</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
