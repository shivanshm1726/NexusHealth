"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, Trash2, MessageCircle } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Patient {
  id: string;
  fullName: string;
  lastMessageTime: string | null;
}

export default function ReceptionistChat() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePatientRef = useRef<string | null>(null);

  // Keep ref in sync with state so the WebSocket callback always has the latest value
  useEffect(() => {
    activePatientRef.current = activePatient;
  }, [activePatient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadPatients = useCallback(() => {
    api.get("/chat/users/patient/sorted").then(res => setPatients(res.data));
  }, []);

  useEffect(() => {
    loadPatients();

    const token = localStorage.getItem("accessToken");
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/api/ws"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe("/user/queue/messages", (message) => {
          const newMsg = JSON.parse(message.body);

          // If message belongs to the currently active conversation, append it
          if (
            activePatientRef.current &&
            (newMsg.senderId === activePatientRef.current || newMsg.receiverId === activePatientRef.current)
          ) {
            setMessages(prev => [...prev, newMsg]);
          }

          // Re-sort patient list: move the conversation partner to the top
          const partnerId = newMsg.senderId === user?.id ? newMsg.receiverId : newMsg.senderId;
          setPatients(prev => {
            const partner = prev.find(p => p.id === partnerId);
            if (!partner) return prev;
            const updated = { ...partner, lastMessageTime: newMsg.timestamp };
            const rest = prev.filter(p => p.id !== partnerId);
            return [updated, ...rest];
          });
        });
      }
    });
    client.activate();
    stompClient.current = client;

    return () => { client.deactivate(); };
  }, []);

  useEffect(() => {
    if (activePatient) {
      api.get(`/chat/history/${activePatient}`).then(hist => setMessages(hist.data));
    } else {
      setMessages([]);
    }
  }, [activePatient]);

  const sendMessage = () => {
    if (!content.trim() || !activePatient || !stompClient.current?.connected) return;
    stompClient.current.publish({
      destination: "/app/chat",
      body: JSON.stringify({ receiverId: activePatient, content: content.trim() })
    });
    setContent("");
  };

  const deleteConversation = async (patientId: string) => {
    try {
      await api.delete(`/chat/conversation/${patientId}`);
      // If we're viewing this conversation, clear the messages
      if (activePatient === patientId) {
        setMessages([]);
        setActivePatient(null);
      }
      // Move this patient to the bottom (no messages)
      setPatients(prev => {
        const patient = prev.find(p => p.id === patientId);
        if (!patient) return prev;
        const rest = prev.filter(p => p.id !== patientId);
        return [...rest, { ...patient, lastMessageTime: null }];
      });
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const getTimeLabel = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[80vh] flex gap-6">
      {/* Patient List */}
      <Card className="bg-slate-900/50 border-slate-800 w-1/3 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5" />Patients
          </h2>
        </div>
        <div className="overflow-y-auto p-2 flex-1">
          {patients.map(p => (
            <div key={p.id} className="group relative mb-1">
              <button
                onClick={() => { setActivePatient(p.id); setShowDeleteConfirm(null); }}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                  activePatient === p.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "hover:bg-slate-800/50 text-slate-300"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.fullName}</p>
                  {p.lastMessageTime && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{getTimeLabel(p.lastMessageTime)}</p>
                  )}
                </div>
                {p.lastMessageTime && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 ml-2 flex-shrink-0" />
                )}
              </button>

              {/* Delete button - shows on hover */}
              {p.lastMessageTime && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(p.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Delete confirmation */}
              {showDeleteConfirm === p.id && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl w-56">
                  <p className="text-sm text-slate-300 mb-3">Delete all messages with <span className="font-semibold text-white">{p.fullName}</span>?</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 h-8 text-xs bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteConversation(p.id)}
                      className="flex-1 h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="bg-slate-900/50 border-slate-800 flex-1 flex flex-col overflow-hidden">
        {!activePatient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
            <MessageCircle className="h-12 w-12 opacity-30" />
            <p>Select a patient to chat</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {patients.find(p => p.id === activePatient)?.fullName}
              </h2>
              <button
                onClick={() => setShowDeleteConfirm(activePatient)}
                className="p-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              {messages.filter(m => m.senderId === activePatient || m.receiverId === activePatient).length === 0 ? (
                <p className="text-center text-slate-500 my-auto">No messages yet. Start the conversation!</p>
              ) : (
                messages.filter(m => m.senderId === activePatient || m.receiverId === activePatient).map((m, i) => (
                  <div key={i} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      m.senderId === user?.id
                        ? "bg-emerald-500 text-white rounded-tr-none"
                        : "bg-slate-800 text-slate-200 rounded-tl-none"
                    }`}>
                      <p>{m.content}</p>
                      <p className="text-[10px] opacity-70 mt-1 text-right">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex gap-2">
              <Input
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="bg-slate-900/50 border-slate-700 text-white"
              />
              <Button onClick={sendMessage} className="bg-emerald-500 hover:bg-emerald-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
