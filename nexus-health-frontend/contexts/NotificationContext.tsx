"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface WaitingPatient {
  appointmentId: string;
  patientName: string;
  message: string;
}

interface NotificationContextType {
  waitingPatients: Record<string, boolean>;
  clearWaitingPatient: (appointmentId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [waitingPatients, setWaitingPatients] = useState<Record<string, boolean>>({});
  const notifiedRef = useRef<Set<string>>(new Set());

  const clearWaitingPatient = useCallback((appointmentId: string) => {
    setWaitingPatients((prev) => {
      const next = { ...prev };
      delete next[appointmentId];
      return next;
    });
    notifiedRef.current.delete(appointmentId);
    // Also clear the flag in the backend
    api.post(`/appointments/${appointmentId}/clear-waiting`).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "DOCTOR") return;

    let active = true;

    const poll = async () => {
      try {
        const { data } = await api.get("/appointments/waiting-patients");
        if (!active) return;

        const newWaiting: Record<string, boolean> = {};
        for (const wp of data as WaitingPatient[]) {
          newWaiting[wp.appointmentId] = true;

          // Show toast only for newly detected waiting patients
          if (!notifiedRef.current.has(wp.appointmentId)) {
            notifiedRef.current.add(wp.appointmentId);
            toast.success(`⚡ ${wp.message}`, { duration: 10000 });
          }
        }

        // Clear notifiedRef for patients who left, so rejoining triggers a new toast
        for (const id of notifiedRef.current) {
          if (!newWaiting[id]) {
            notifiedRef.current.delete(id);
          }
        }

        setWaitingPatients(newWaiting);
      } catch (e) {
        // Silently ignore polling errors
      }
    };

    // Poll immediately, then every 5 seconds
    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user, isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ waitingPatients, clearWaitingPatient }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
