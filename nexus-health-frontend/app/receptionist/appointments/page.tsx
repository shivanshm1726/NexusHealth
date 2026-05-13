"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
export default function P() { return (<div><h1 className="text-3xl font-bold text-white mb-8">Appointments</h1><Card className="bg-slate-900/50 border-slate-800"><CardContent className="p-12 text-center"><CalendarDays className="h-16 w-16 text-slate-700 mx-auto mb-4" /><p className="text-slate-400">Full management — Phase 2</p></CardContent></Card></div>); }
