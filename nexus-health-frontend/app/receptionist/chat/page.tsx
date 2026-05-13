"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function ReceptionistChat() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    api.get("/chat/users/patient").then(res => setPatients(res.data));

    const token = localStorage.getItem("accessToken");
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/api/ws"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe("/user/queue/messages", (message) => {
          const newMsg = JSON.parse(message.body);
          setMessages(prev => {
            // Only append if the message belongs to the active conversation
            // But wait, the state 'activePatient' in this callback might be stale
            // We should just fetch messages on change instead, or manage it better
            // For now, we update it and filter visually or re-fetch on incoming
            return [...prev, newMsg]; 
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
    stompClient.current.publish({ destination: "/app/chat", body: JSON.stringify({ receiverId: activePatient, content: content.trim() }) });
    setContent("");
  };

  return (
    <div className="h-[80vh] flex gap-6">
      <Card className="bg-slate-900/50 border-slate-800 w-1/3 flex flex-col">
        <div className="p-4 border-b border-slate-800"><h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="h-5 w-5"/>Patients</h2></div>
        <div className="overflow-y-auto p-2">
          {patients.map(p => (
            <button key={p.id} onClick={() => setActivePatient(p.id)} className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${activePatient === p.id ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-slate-800/50 text-slate-300"}`}>
              <p className="font-medium">{p.fullName}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800 flex-1 flex flex-col overflow-hidden">
        {!activePatient ? <div className="flex-1 flex items-center justify-center text-slate-500">Select a patient to chat</div> :
        <>
          <div className="p-4 border-b border-slate-800"><h2 className="text-lg font-bold text-white">{patients.find(p=>p.id===activePatient)?.fullName}</h2></div>
          <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
            {messages.filter(m => m.senderId === activePatient || m.receiverId === activePatient).map((m, i) => (
              <div key={i} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.senderId === user?.id ? "bg-emerald-500 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"}`}>
                  <p>{m.content}</p>
                  <p className="text-[10px] opacity-70 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex gap-2">
            <Input value={content} onChange={e=>setContent(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Type a message..." className="bg-slate-900/50 border-slate-700 text-white" />
            <Button onClick={sendMessage} className="bg-emerald-500 hover:bg-emerald-600"><Send className="h-4 w-4" /></Button>
          </div>
        </>}
      </Card>
    </div>
  );
}
