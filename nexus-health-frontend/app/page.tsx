"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Calendar, Video, MessageCircle, Shield, Clock, ArrowRight, Stethoscope, Users, HeartPulse, CheckCircle, Star, Phone } from "lucide-react";
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

const steps = [
  { num: "01", title: "Find a Doctor", desc: "Browse our network of verified specialists by name or specialization." },
  { num: "02", title: "Book Appointment", desc: "Pick a date and time slot that works for you — online or in-person." },
  { num: "03", title: "Pay Securely", desc: "Complete payment via Razorpay with instant confirmation." },
  { num: "04", title: "Get Treated", desc: "Join your video consultation or visit the clinic at your booked time." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">NexusHealth</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">Get Started</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-blue-600 font-medium">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
                <Stethoscope className="h-4 w-4" /> Healthcare reimagined for the digital age
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Your Health,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Connected Seamlessly</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-lg mb-8">
                Book appointments, consult doctors via video, chat with support, and manage your entire health journey — all from one powerful platform.
              </p>
              <div className="flex items-center gap-4 mb-10">
                <Link href="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-13 text-base shadow-xl shadow-blue-600/25 font-semibold">
                    Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 px-8 h-13 text-base font-semibold">
                    I&apos;m a Doctor
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />Free to start</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />HIPAA ready</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="relative hidden lg:block">
              {/* Hero visual — abstract medical dashboard card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-sky-100 rounded-3xl blur-2xl opacity-60" />
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-blue-900/10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><Stethoscope className="h-5 w-5 text-blue-600" /></div>
                    <div><p className="font-semibold text-slate-900">Dr. Sarah Johnson</p><p className="text-xs text-slate-400">Cardiologist · Online</p></div>
                    <div className="ml-auto flex items-center gap-1"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /><span className="text-sm font-medium text-slate-700">4.9</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {["09:00", "10:30", "14:00"].map((t, i) => (
                      <div key={t} className={`text-center py-2.5 rounded-xl text-sm font-medium transition-all ${i === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-slate-50 text-slate-600 border border-slate-100"}`}>{t}</div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" /><span className="text-sm font-medium text-emerald-700">Appointment Confirmed</span></div>
                    <Video className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                {/* Floating badges */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 px-4 py-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center"><Video className="h-4 w-4 text-emerald-600" /></div>
                  <div><p className="text-xs font-semibold text-slate-900">Video Call</p><p className="text-[10px] text-emerald-500">HD Quality</p></div>
                </motion.div>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 px-4 py-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Shield className="h-4 w-4 text-blue-600" /></div>
                  <div><p className="text-xs font-semibold text-slate-900">Secure</p><p className="text-[10px] text-blue-500">End-to-end</p></div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-slate-900">{s.value}</div>
                <div className="text-sm text-slate-400 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need, in one place</h2>
            <p className="text-slate-500 max-w-xl mx-auto">A complete hospital management solution designed for patients, doctors, and staff.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="group p-7 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                  <f.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Get started in minutes. Four simple steps to better healthcare.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="relative text-center">
                <div className="text-5xl font-extrabold text-blue-100 mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles CTA */}
      <section id="roles" className="py-24 px-6 bg-slate-50/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Built for everyone</h2>
            <p className="text-slate-500">Whether you&apos;re a patient, doctor, or administrator.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, role: "Patient", desc: "Browse doctors, book appointments, and consult online.", href: "/register", color: "blue" },
              { icon: Stethoscope, role: "Doctor", desc: "Manage your practice, set availability, and see patients.", href: "/register", color: "emerald" },
              { icon: Activity, role: "Admin", desc: "Oversee operations, manage staff, and view analytics.", href: "/login", color: "violet" },
            ].map((item) => (
              <Link key={item.role} href={item.href}
                className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className={`h-12 w-12 rounded-xl bg-${item.color}-50 flex items-center justify-center mb-5 group-hover:bg-${item.color}-100 transition-colors`}>
                  <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">For {item.role}s</h3>
                <p className="text-sm text-slate-500 mb-5">{item.desc}</p>
                <span className="text-blue-600 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to transform your healthcare?</h2>
              <p className="text-blue-100 max-w-lg mx-auto mb-8">Join thousands of patients and doctors already using NexusHealth.</p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 h-13 text-base font-semibold shadow-xl shadow-blue-900/30">
                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">NexusHealth</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-slate-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-600 transition-colors">How It Works</a>
            <Link href="/login" className="hover:text-slate-600 transition-colors">Sign In</Link>
          </div>
          <p className="text-sm text-slate-400">© 2026 NexusHealth. Built for modern healthcare.</p>
        </div>
      </footer>
    </div>
  );
}
