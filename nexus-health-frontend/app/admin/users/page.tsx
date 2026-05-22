"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [u, setU] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => { 
    api.get("/admin/users").then(r => setU(r.data)).catch(() => {}); 
  }, []);

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will also delete all their associated records.`)) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      setU(prev => prev.filter(user => user.id !== id));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const rc: Record<string, string> = {
    ADMIN: "bg-violet-50 text-violet-600",
    DOCTOR: "bg-emerald-50 text-emerald-600",
    RECEPTIONIST: "bg-amber-50 text-amber-600",
    PATIENT: "bg-blue-50 text-blue-600"
  };

  const filteredUsers = filter === "ALL" ? u : u.filter(user => user.role === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">All Users</h1>
      <Card className="bg-white border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-slate-900">{filteredUsers.length} Users</CardTitle>
          <div className="flex gap-2">
            {["ALL", "DOCTOR", "PATIENT", "RECEPTIONIST", "ADMIN"].map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className={filter === f ? "bg-slate-900 text-white" : "text-slate-600"}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">{filteredUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold">{user.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{user.fullName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${rc[user.role] || ""} border-0 font-medium`}>{user.role}</Badge>
                {user.role !== "ADMIN" && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteUser(user.id, user.fullName)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}</div>
          {filteredUsers.length === 0 && (
            <p className="text-center text-slate-400 py-6">No users found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
