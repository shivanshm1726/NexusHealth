"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function PatientChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [supportId, setSupportId] = useState<string | null>(null);
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Get a receptionist to chat with
    api.get("/chat/users/receptionist").then(res => {
      if (res.data.length > 0) {
        setSupportId(res.data[0].id);
        // Load history
        api.get(`/chat/history/${res.data[0].id}`).then(hist => setMessages(hist.data));
      }
    });

    // Connect WebSocket
    const token = localStorage.getItem("accessToken");
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/api/ws"),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        client.subscribe("/user/queue/messages", (message) => {
          const newMsg = JSON.parse(message.body);
          setMessages(prev => [...prev, newMsg]);
        });
      }
    });
    client.activate();
    stompClient.current = client;

    return () => { client.deactivate(); };
  }, []);

  const sendMessage = () => {
    if (!content.trim() || !supportId || !stompClient.current?.connected) return;
    
    const payload = {
      receiverId: supportId,
      content: content.trim()
    };
    
    stompClient.current.publish({
      destination: "/app/chat",
      body: JSON.stringify(payload)
    });
    
    setContent("");
  };

  if (!supportId) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500"/></div>;

  return (
    <div className="h-[80vh] flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-4">Chat Support</h1>
      <Card className="bg-slate-900/50 border-slate-800 flex-1 flex flex-col overflow-hidden">
        <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
          {messages.length === 0 ? <p className="text-center text-slate-500 my-auto">Start the conversation</p> :
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.senderId === user?.id ? "bg-emerald-500 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"}`}>
                  <p>{m.content}</p>
                  <p className="text-[10px] opacity-70 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex gap-2">
          <Input value={content} onChange={e=>setContent(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Type a message..." className="bg-slate-900/50 border-slate-700 text-white" />
          <Button onClick={sendMessage} className="bg-emerald-500 hover:bg-emerald-600"><Send className="h-4 w-4" /></Button>
        </div>
      </Card>
    </div>
  );
}
