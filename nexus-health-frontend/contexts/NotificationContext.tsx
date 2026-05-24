"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getWsUrl } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface NotificationContextType {
  waitingPatients: Record<string, boolean>;
  clearWaitingPatient: (appointmentId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [waitingPatients, setWaitingPatients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "DOCTOR") return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(getWsUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => {
        console.log("STOMP: " + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("✅ STOMP WebSocket Connected globally");
        client.subscribe(`/topic/doctor.${user.id}.notifications`, (message) => {
          console.log("🔔 Received STOMP message:", message.body);
          try {
            const notification = JSON.parse(message.body);
            if (notification.type === "WAITING_ROOM_JOIN") {
              toast.success(`⚡ ${notification.message}`, { duration: 8000 });
              setWaitingPatients((prev) => ({ ...prev, [notification.appointmentId]: true }));
            }
          } catch (e) {
            console.error("Failed to parse notification", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user, isAuthenticated]);

  const clearWaitingPatient = (appointmentId: string) => {
    setWaitingPatients((prev) => {
      const next = { ...prev };
      delete next[appointmentId];
      return next;
    });
  };

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
