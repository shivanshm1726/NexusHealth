"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, X, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AdminDoctors() {
  const [p, setP] = useState<any[]>([]);
  const [a, setA] = useState<any[]>([]);

  // Confirmation dialog state
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "reject" | "delete" | null;
    doc: any | null;
  }>({ open: false, type: null, doc: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/admin/doctors/pending")
      .then((r) => setP(r.data))
      .catch(() => {});
    api
      .get("/doctors")
      .then((r) => setA(r.data))
      .catch(() => {});
  }, []);

  const approve = async (id: string) => {
    try {
      await api.patch(`/admin/doctors/${id}/approve`);
      setP((x) => x.filter((d) => d.id !== id));
      toast.success("Doctor approved successfully");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const confirmAction = async () => {
    if (!dialog.doc || !dialog.type) return;
    setLoading(true);
    try {
      if (dialog.type === "reject") {
        await api.patch(`/admin/doctors/${dialog.doc.id}/reject`);
        setP((x) => x.filter((d) => d.id !== dialog.doc.id));
        toast.success(`${dialog.doc.fullName}'s application has been rejected`);
      } else if (dialog.type === "delete") {
        await api.delete(`/admin/doctors/${dialog.doc.id}`);
        setA((x) => x.filter((d) => d.id !== dialog.doc.id));
        toast.success(`${dialog.doc.fullName} has been removed`);
      }
      setDialog({ open: false, type: null, doc: null });
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Manage Doctors</h1>

      {/* Pending Approvals */}
      {p.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Pending ({p.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {p.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-amber-500/20">
                    <AvatarFallback className="text-amber-400">
                      {doc.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{doc.fullName}</p>
                    <p className="text-sm text-slate-400">
                      {doc.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => approve(doc.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() =>
                      setDialog({ open: true, type: "reject", doc })
                    }
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approved Doctors */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Approved ({a.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {a.length === 0 ? (
            <p className="text-slate-500 text-center py-6">
              No approved doctors
            </p>
          ) : (
            <div className="space-y-3">
              {a.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-emerald-500/20">
                      <AvatarFallback className="text-emerald-400">
                        {doc.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{doc.fullName}</p>
                      <p className="text-sm text-slate-400">
                        {doc.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-0">
                      Active
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() =>
                        setDialog({ open: true, type: "delete", doc })
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) =>
          !loading && setDialog({ open, type: null, doc: null })
        }
      >
        <DialogContent
          className="bg-slate-900 border-slate-700 text-white max-w-md"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-full bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <DialogTitle className="text-white text-base">
                {dialog.type === "reject"
                  ? "Reject Application"
                  : "Delete Doctor"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 pl-1">
              {dialog.type === "reject" ? (
                <>
                  Are you sure you want to{" "}
                  <span className="text-red-400 font-medium">reject</span> the
                  application from{" "}
                  <span className="text-white font-medium">
                    {dialog.doc?.fullName}
                  </span>
                  ? Their doctor profile will be removed. Their user account
                  remains intact.
                </>
              ) : (
                <>
                  Are you sure you want to{" "}
                  <span className="text-red-400 font-medium">delete</span>{" "}
                  <span className="text-white font-medium">
                    {dialog.doc?.fullName}
                  </span>
                  ? They will be deactivated and can no longer log in. All
                  appointment history is preserved.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent border-t-slate-700 mt-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => setDialog({ open: false, type: null, doc: null })}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmAction}
              disabled={loading}
            >
              {loading
                ? "Processing…"
                : dialog.type === "reject"
                  ? "Yes, Reject"
                  : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
