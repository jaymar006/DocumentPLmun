"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { DocumentRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Printer,
  QrCode,
  ShieldCheck,
  RefreshCw,
  X,
  Building2,
} from "lucide-react";

export default function StudentPortalPage() {
  const {
    requests,
    selectedRequest,
    currentStudent,
    rescheduleRequest,
    userRole,
    authenticateUser,
    openAuthModal,
  } = useStore();

  const [activeReqId, setActiveReqId] = useState<string>(
    selectedRequest ? selectedRequest.id : requests[0]?.id || ""
  );

  // Active viewed request
  const currentReq: DocumentRequest | undefined =
    requests.find((r) => r.id === activeReqId) || requests[0];

  // Reschedule modal state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("2026-11-10");
  const [newSlot, setNewSlot] = useState("09:30 AM – 10:00 AM");

  const handleConfirmReschedule = () => {
    if (currentReq) {
      rescheduleRequest(currentReq.id, newDate, newSlot);
      setIsRescheduleOpen(false);
      alert(`Appointment successfully rescheduled to ${newDate} at ${newSlot}!`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: DocumentRequest["status"]) => {
    switch (status) {
      case "READY_FOR_PICKUP":
        return <Badge variant="approved">Ready for Pickup</Badge>;
      case "PROCESSING":
        return <Badge variant="processing">In Production & Stamping</Badge>;
      case "PENDING_REVIEW":
        return <Badge variant="pending">Pending Evaluation</Badge>;
      case "CLAIMED":
        return <Badge variant="secondary">Claimed / Released</Badge>;
      case "NO_SHOW":
        return <Badge variant="destructive">Missed / No-Show</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!userRole) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card className="border border-border bg-card shadow-2xs text-center p-8 space-y-5">
          <div className="w-12 h-12 rounded-full bg-muted border border-border text-foreground mx-auto flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-foreground">
              Sign In to View Requests
            </h1>
            <p className="text-xs text-muted-foreground">
              Please sign in with your Student ID to view your confirmation slips and QR appointment passes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Button
              className="w-full sm:w-auto"
              onClick={() => openAuthModal("/portal")}
            >
              Sign In to Account
            </Button>
            <Button
              variant="outline"
              onClick={() => authenticateUser("2021-04981")}
              className="w-full sm:w-auto"
            >
              Quick Sign In (Demo Student)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:max-w-none print:p-0 print:m-0 print:space-y-0 print:w-full">
      {/* Student Banner */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-xl shadow-2xs shrink-0">
            {currentStudent.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {currentStudent.name}
              </h1>
              <span className="text-xs bg-primary/15 text-foreground font-semibold px-2 py-0.5 rounded-full border border-primary/30">
                Active Student
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Student ID: <strong className="text-foreground">{currentStudent.id}</strong> •{" "}
              {currentStudent.program}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/request">
            <Button size="sm">
              <FileText className="w-4 h-4 mr-1.5" />
              New Document Request
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRescheduleOpen(true)}
          >
            <RefreshCw className="w-4 h-4 mr-1.5 text-primary" />
            Reschedule Pickup Slot
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Slip
          </Button>
        </div>
      </div>

      {currentReq && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:w-full print:m-0 print:p-0">
          {/* Left: Official Confirmation Slip (7 cols) */}
          <div className="lg:col-span-7 space-y-6 print:w-full print:col-span-12 print:m-0 print:p-0 print:space-y-0">
            {/* Action Bar visible only on screen */}
            <div className="flex items-center justify-between print:hidden">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Official Claiming Slip Preview
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="gap-1.5 text-xs shadow-2xs hover:bg-muted"
              >
                <Printer className="w-3.5 h-3.5 text-primary" />
                <span>Print Slip</span>
              </Button>
            </div>

            <div
              id="printable-slip"
              className="bg-card rounded-xl border-2 border-border shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden print:p-6 print:m-0 print:border-2 print:border-foreground/80 print:shadow-none print:rounded-lg"
            >
              {/* Slip Watermark / Header */}
              <div className="border-b-2 border-foreground/80 pb-4 text-center space-y-1">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/plmun-logo.png"
                    alt="PLMun Official Seal"
                    width={52}
                    height={52}
                    className="object-contain"
                  />
                </div>
                <div className="text-[11px] font-bold tracking-widest text-primary uppercase">
                  Pamantasan ng Lungsod ng Muntinlupa
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Office of the University Registrar • Student Services Division
                </div>
                <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight pt-1">
                  Official Document Claiming Confirmation Slip
                </h2>
              </div>

              {/* Barcode & Reference Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/60 rounded-lg border border-border gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Tracking Reference Code
                  </span>
                  <span className="text-2xl font-mono font-black text-foreground tracking-wider">
                    {currentReq.id}
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    {getStatusBadge(currentReq.status)}
                    <span className="text-xs text-muted-foreground">
                      Filed: {currentReq.createdAt}
                    </span>
                  </div>
                </div>

                {/* QR Code graphic */}
                <div className="text-center shrink-0">
                  <div className="w-20 h-20 bg-white rounded p-1.5 shadow-2xs mx-auto flex items-center justify-center border border-border">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono mt-1 block">
                    FAST-COUNTER QR
                  </span>
                </div>
              </div>

              {/* Student & Appointment Summary Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-border rounded-lg p-4 bg-card">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Student Claimant
                  </span>
                  <strong className="text-foreground text-sm block">
                    {currentReq.studentName}
                  </strong>
                  <span className="text-muted-foreground block">{currentReq.studentId}</span>
                  <span className="text-muted-foreground block text-[11px]">
                    {currentReq.program}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Scheduled Releasing Window
                  </span>
                  <strong className="text-primary text-sm block font-bold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 inline" />
                    Registrar Window
                  </strong>
                  <span className="text-foreground font-semibold block">
                    {currentReq.appointmentDate}
                  </span>
                  <span className="text-primary font-medium block">
                    {currentReq.appointmentSlot}
                  </span>
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Authorized Pickup Mode
                  </span>
                  {currentReq.representative.isRepresentative ? (
                    <div className="text-foreground font-medium">
                      Proxy: <strong>{currentReq.representative.name}</strong>
                      <span className="text-muted-foreground block text-[11px]">
                        ({currentReq.representative.relationship}) • {currentReq.representative.idType}
                      </span>
                    </div>
                  ) : (
                    <span className="text-foreground font-medium">
                      Personal Pickup (Student ID)
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Payment Assessment
                  </span>
                  <strong className="text-foreground block font-bold">
                    ₱{currentReq.totalFee.toFixed(2)}
                  </strong>
                  <span className="text-[11px] font-semibold text-primary">
                    {currentReq.paymentStatus === "PAID_ONLINE"
                      ? "✓ Official Receipt Cleared"
                      : "Pay at PLMun Cashier"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                  Requested Academic Documents
                </h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-2.5">Document Title</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Fee</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentReq.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-foreground">
                            {item.name}
                          </td>
                          <td className="p-2.5 text-center text-muted-foreground">
                            {item.quantity}
                          </td>
                          <td className="p-2.5 text-right text-muted-foreground">
                            ₱{item.fee.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-foreground">
                            ₱{(item.fee * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mandatory Counter Protocol */}
              <div className="bg-secondary/70 border border-border rounded-lg p-3 text-[11px] text-secondary-foreground space-y-1">
                <strong>Counter Release Protocol:</strong>
                <p>
                  1. Arrive strictly within your allocated time slot ({currentReq.appointmentSlot}) at the Registrar Releasing Window.
                </p>
                <p>
                  2. Present this confirmation slip (printed or on phone) along with your original valid student ID.
                </p>
                <p>
                  3. Carefully verify the student information and dry-seal before leaving the counter.
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border pt-3">
                <span>System Generated Confirmation • PLMun Registrar</span>
                <span>Security Hash: 88F9-2A1B-0084</span>
              </div>
            </div>
          </div>

          {/* Right: Audit Trail & Request Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            {/* Audit Trail Card */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border bg-muted/40 pb-4">
                <CardTitle className="text-base flex items-center space-x-2 text-foreground">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Audit Trail & Processing Timeline</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Step-by-step verification history by the Registrar Office.
                </p>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {currentReq.auditTrail.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs relative">
                      {idx !== currentReq.auditTrail.length - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-border -z-0" />
                      )}
                      <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 text-foreground flex items-center justify-center shrink-0 z-10 text-[10px] font-bold">
                        ✓
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground">{log.action}</div>
                        <div className="text-muted-foreground text-[11px]">
                          By: {log.actor} • {log.timestamp}
                        </div>
                        {log.note && (
                          <div className="mt-1 text-[11px] text-muted-foreground bg-muted/60 p-2 rounded border border-border">
                            {log.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {currentReq.remarks && (
                  <div className="mt-6 pt-4 border-t border-border text-xs">
                    <span className="font-bold text-foreground block mb-1">
                      Counter Officer Remarks:
                    </span>
                    <p className="text-foreground bg-primary/15 border border-primary/30 p-2.5 rounded-lg">
                      {currentReq.remarks}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Switcher of Student's Requests */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border bg-muted/40 pb-3">
                <CardTitle className="text-sm font-bold text-foreground">
                  My Active & Past Requests ({requests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {requests.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveReqId(r.id)}
                    className={`w-full p-3 rounded-lg border text-left text-xs transition flex items-center justify-between ${r.id === activeReqId
                      ? "border-primary bg-primary/15 font-semibold ring-1 ring-primary"
                      : "border-border bg-card hover:bg-muted/50"
                      }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-foreground">{r.id}</div>
                      <div className="text-muted-foreground text-[11px] truncate max-w-[200px]">
                        {r.items.map((i) => i.name).join(", ")}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Claim: {r.appointmentDate}
                      </div>
                    </div>
                    <div>{getStatusBadge(r.status)}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && currentReq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <Card className="w-full max-w-lg bg-card border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <h3 className="font-bold text-base">Reschedule Pickup Slot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="opacity-80 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="p-3 bg-secondary rounded-lg border border-border text-xs text-secondary-foreground">
                Rescheduling Request <strong>{currentReq.id}</strong>. Note that slots at the Registrar Releasing Window are limited to maintain safe counter flow.
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Choose New Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { date: "2026-11-10", label: "Mon • Nov 10", left: "10 Available" },
                    { date: "2026-11-11", label: "Tue • Nov 11", left: "6 Available" },
                    { date: "2026-11-12", label: "Wed • Nov 12", left: "14 Available" },
                    { date: "2026-11-13", label: "Thu • Nov 13", left: "18 Available" },
                  ].map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setNewDate(d.date)}
                      className={`p-2.5 rounded-lg border text-left transition ${newDate === d.date
                        ? "border-primary bg-primary/15 text-foreground font-bold ring-1 ring-primary"
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
                        }`}
                    >
                      <div className="text-xs">{d.label}</div>
                      <span className="text-[10px] text-muted-foreground font-normal">{d.left}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Choose New Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "08:30 AM – 09:00 AM",
                    "09:30 AM – 10:00 AM",
                    "10:30 AM – 11:00 AM",
                    "01:00 PM – 01:30 PM",
                    "02:00 PM – 02:30 PM",
                    "03:00 PM – 03:30 PM",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewSlot(s)}
                      className={`p-2 rounded-lg border text-left text-xs transition ${newSlot === s
                        ? "border-primary bg-primary text-primary-foreground font-bold"
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setIsRescheduleOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmReschedule}
                  className="font-semibold"
                >
                  Confirm New Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
