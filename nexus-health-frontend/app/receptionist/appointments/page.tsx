"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
export default function P() { return (<div><h1 className="text-2xl font-bold text-slate-900 mb-8">Appointments</h1><Card className="bg-white border-slate-200/80 shadow-sm"><CardContent className="p-12 text-center"><CalendarDays className="h-16 w-16 text-slate-200 mx-auto mb-4" /><p className="text-slate-500">Full management — Phase 2</p></CardContent></Card></div>); }
