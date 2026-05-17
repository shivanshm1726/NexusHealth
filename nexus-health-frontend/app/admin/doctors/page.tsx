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
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Manage Doctors</h1>

      {/* Pending Approvals */}
      {p.length > 0 && (
        <Card className="bg-white border-slate-200/80 shadow-sm mb-6">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Pending ({p.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {p.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-100"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-amber-100 text-amber-600 font-semibold">
                      {doc.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">{doc.fullName}</p>
                    <p className="text-sm text-slate-500">
                      {doc.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium"
                    onClick={() => approve(doc.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-500 hover:bg-red-50 font-medium"
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
      <Card className="bg-white border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-900">Approved ({a.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {a.length === 0 ? (
            <p className="text-slate-400 text-center py-6">
              No approved doctors
            </p>
          ) : (
            <div className="space-y-3">
              {a.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold">
                        {doc.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{doc.fullName}</p>
                      <p className="text-sm text-slate-500">
                        {doc.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-50 text-emerald-600 border-0 font-medium">
                      Active
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-500 hover:bg-red-50 font-medium"
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
          className="bg-white border-slate-200 text-slate-900 max-w-md"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-slate-900 text-base">
                {dialog.type === "reject"
                  ? "Reject Application"
                  : "Delete Doctor"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 pl-1">
              {dialog.type === "reject" ? (
                <>
                  Are you sure you want to{" "}
                  <span className="text-red-500 font-medium">reject</span> the
                  application from{" "}
                  <span className="text-slate-900 font-medium">
                    {dialog.doc?.fullName}
                  </span>
                  ? Their doctor profile will be removed. Their user account
                  remains intact.
                </>
              ) : (
                <>
                  Are you sure you want to{" "}
                  <span className="text-red-500 font-medium">delete</span>{" "}
                  <span className="text-slate-900 font-medium">
                    {dialog.doc?.fullName}
                  </span>
                  ? They will be deactivated and can no longer log in. All
                  appointment history is preserved.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
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
