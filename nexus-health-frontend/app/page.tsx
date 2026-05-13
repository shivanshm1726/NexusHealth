"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Calendar, Video, MessageCircle, Shield, Clock, ArrowRight, Stethoscope, Users, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Calendar, title: "Smart Scheduling", desc: "Book appointments with real-time slot availability. Choose online or offline consultations." },
  { icon: Video, title: "Video Consultations", desc: "Join HD video calls with your doctor from anywhere. No downloads required." },
  { icon: MessageCircle, title: "Live Chat Support", desc: "Chat with our receptionist team instantly for any queries or issues." },
  { icon: Shield, title: "Secure Payments", desc: "Pay securely via Razorpay. Your financial data is always protected." },
  { icon: Clock, title: "24/7 Access", desc: "Manage your health records, prescriptions, and appointments anytime." },
  { icon: HeartPulse, title: "Health Dashboard", desc: "Track your consultation history, prescriptions, and upcoming appointments." },
];

const stats = [
  { value: "50+", label: "Specialist Doctors" },
  { value: "10K+", label: "Patients Served" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "4.9★", label: "Patient Rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-950/60 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-7 w-7 text-emerald-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">NexusHealth</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
              <Stethoscope className="h-4 w-4" /> Healthcare reimagined for the digital age
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Your Health,</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Connected Seamlessly</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Book appointments, consult doctors via video, chat with support, and manage your entire health journey — all from one powerful platform.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 text-base">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 h-12 text-base">
                  I&apos;m a Doctor
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need, in one place</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A complete hospital management solution designed for patients, doctors, and staff.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-emerald-500/30 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <f.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles CTA */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, role: "Patient", desc: "Browse doctors, book appointments, and consult online.", href: "/register", color: "emerald" },
            { icon: Stethoscope, role: "Doctor", desc: "Manage your practice, set availability, and see patients.", href: "/register", color: "cyan" },
            { icon: Activity, role: "Admin", desc: "Oversee operations, manage staff, and view analytics.", href: "/login", color: "violet" },
          ].map((item) => (
            <Link key={item.role} href={item.href}
              className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-all">
              <item.icon className="h-8 w-8 text-slate-400 group-hover:text-emerald-400 transition-colors mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">For {item.role}s</h3>
              <p className="text-sm text-slate-400 mb-4">{item.desc}</p>
              <span className="text-emerald-400 text-sm font-medium inline-flex items-center gap-1">
                Get started <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-white">NexusHealth</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 NexusHealth. Built for modern healthcare.</p>
        </div>
      </footer>
    </div>
  );
}
