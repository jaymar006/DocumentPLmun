"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { RequestStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  FileCheck,
  QrCode,
  AlertTriangle,
  Eye,
  X,
  Building2,
  Printer,
  CalendarClock,
  Lock,
  ArrowRight,
  Check,
} from "lucide-react";

export default function StaffWorkspacePage() {
  const {
    requests,
    updateRequestStatus,
    updatePaymentStatus,
    userRole,
    setUserRole,
    windowSettings,
  } = useStore();

  // Workspace Module Tabs
  const [workspaceView, setWorkspaceView] = useState<
    "COUNTER" | "PROCESSING_QUEUE" | "SLOT_MANIFEST"
  >("COUNTER");

  const [lookupQuery, setLookupQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "TODAY" | "PROCESSING" | "NEEDS_REVIEW" | "NO_SHOW"
  >("ALL");
  const [selectedReqId, setSelectedReqId] = useState<string>(
    requests[0]?.id || "PLM-2026-08942"
  );

  // Verification Checklist State for active claimant
  const [idVerified, setIdVerified] = useState(true);
  const [clearanceVerified, setClearanceVerified] = useState(true);
  const [feeSettled, setFeeSettled] = useState(true);

  // Deficiency Modal State
  const [isDeficiencyOpen, setIsDeficiencyOpen] = useState(false);
  const [deficiencyReason, setDeficiencyReason] = useState(
    "Unpaid Cashier Balance"
  );
  const [deficiencyRemarks, setDeficiencyRemarks] = useState("");

  // Scanned Letter Preview Modal State
  const [isLetterPreviewOpen, setIsLetterPreviewOpen] = useState(false);

  // Role-Based Access Guard
  if (userRole !== "STAFF" && userRole !== "ADMIN") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card className="border border-border bg-card shadow-md text-center p-8 space-y-5">
          <div className="w-14 h-14 rounded-full bg-primary/15 text-primary mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-foreground">
              Staff Desk Access Restricted
            </h1>
            <p className="text-xs text-muted-foreground">
              This module is reserved for authorized Registrar Counter Releasing Officers and Administrators. Please sign in through the unified Login portal using Staff or Admin credentials.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Go to Login Page
              </Button>
            </Link>
            <Button
              onClick={() => setUserRole("STAFF")}
              className="w-full sm:w-auto"
            >
              Quick Authorize as Staff
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active Selected Claimant
  const activeReq =
    requests.find((r) => r.id === selectedReqId) || requests[0] || null;

  // Filtered list based on active tab and search
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(lookupQuery.toLowerCase()) ||
      r.studentName.toLowerCase().includes(lookupQuery.toLowerCase()) ||
      r.studentId.includes(lookupQuery);

    if (!matchesSearch) return false;

    if (activeTab === "TODAY") {
      return (
        r.status === "READY_FOR_PICKUP" ||
        r.appointmentDate === "2026-11-06"
      );
    }
    if (activeTab === "PROCESSING") {
      return r.status === "PROCESSING";
    }
    if (activeTab === "NEEDS_REVIEW") {
      return r.status === "PENDING_REVIEW" || r.status === "REJECTED";
    }
    if (activeTab === "NO_SHOW") {
      return r.status === "NO_SHOW";
    }
    return true;
  });

  // Action Handlers
  const handleReleaseDocument = () => {
    if (!activeReq) return;
    if (!idVerified || !clearanceVerified || !feeSettled) {
      alert(
        "Please complete all 3 mandatory counter verification checks (Valid ID, Clearance, and Official Receipt) before releasing."
      );
      return;
    }
    updateRequestStatus(
      activeReq.id,
      "CLAIMED",
      "Registrar Releasing Officer",
      "Released at Registrar Releasing Window after full identity & receipt verification."
    );
  };

  const handleMarkReady = (id?: string) => {
    const targetId = id || activeReq?.id;
    if (!targetId) return;
    updateRequestStatus(
      targetId,
      "READY_FOR_PICKUP",
      "Registrar Records Evaluator",
      "Dry-sealed and placed in Registrar Window releasing bin."
    );
  };

  const handleTagNoShow = () => {
    if (!activeReq) return;
    updateRequestStatus(
      activeReq.id,
      "NO_SHOW",
      "Registrar Releasing Officer",
      "Claimant failed to appear within the 30-minute appointment window."
    );
  };

  const handleDispatchDeficiency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    updateRequestStatus(
      activeReq.id,
      "REJECTED",
      "Registrar Releasing Officer",
      deficiencyRemarks || "Discrepancy noted during counter inspection.",
      deficiencyReason
    );
    setIsDeficiencyOpen(false);
    setDeficiencyRemarks("");
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "READY_FOR_PICKUP":
        return <Badge variant="approved">Ready for Pickup</Badge>;
      case "PROCESSING":
        return <Badge variant="processing">Processing</Badge>;
      case "PENDING_REVIEW":
        return <Badge variant="pending">Needs Review</Badge>;
      case "CLAIMED":
        return <Badge variant="secondary">Claimed</Badge>;
      case "NO_SHOW":
        return <Badge variant="destructive">No-Show</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Deficiency Notice</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Station Header */}
      <div className="bg-card border border-border text-foreground rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Image
            src="/plmun-logo.png"
            alt="PLMun Official Seal"
            width={52}
            height={52}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-primary font-bold">
              <span>Pamantasan ng Lungsod ng Muntinlupa • Counter Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
              Staff Desk Workspace
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Active Service Window: <strong className="text-foreground">Registrar Releasing Counter</strong> • Ground Floor Admin Bldg
            </p>
          </div>
        </div>

        {/* Quick Station Stats */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-2 bg-primary/15 border border-primary/30 rounded-lg text-center">
            <div className="text-lg font-bold text-foreground">
              {requests.filter((r) => r.status === "READY_FOR_PICKUP").length}
            </div>
            <div className="text-[10px] text-muted-foreground">Ready in Bin</div>
          </div>
          <div className="px-3.5 py-2 bg-secondary border border-border rounded-lg text-center">
            <div className="text-lg font-bold text-foreground">
              {requests.filter((r) => r.status === "PROCESSING" || r.status === "PENDING_REVIEW").length}
            </div>
            <div className="text-[10px] text-muted-foreground">In Queue</div>
          </div>
          <div className="px-3.5 py-2 bg-secondary border border-border rounded-lg text-center">
            <div className="text-lg font-bold text-foreground">
              {requests.filter((r) => r.status === "CLAIMED").length}
            </div>
            <div className="text-[10px] text-muted-foreground">Released Today</div>
          </div>
        </div>
      </div>

      {/* Staff Module Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-card p-2 rounded-xl border border-border shadow-2xs">
        {[
          {
            id: "COUNTER",
            label: "Counter Release & Verification",
            desc: "QR Scan, ID Check & Window Release",
            icon: QrCode,
          },
          {
            id: "PROCESSING_QUEUE",
            label: "Printing & Dry-Seal Queue",
            desc: `${requests.filter((r) => r.status === "PENDING_REVIEW" || r.status === "PROCESSING").length} Credentials in Preparation`,
            icon: Printer,
          },
          {
            id: "SLOT_MANIFEST",
            label: "Appointment Slot Manifest",
            desc: `Single Window (${windowSettings.maxCapacityPerSlot} max/slot)`,
            icon: CalendarClock,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = workspaceView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setWorkspaceView(tab.id as any)}
              className={`p-3 rounded-lg text-left transition flex items-center space-x-3 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "hover:bg-muted/70 text-foreground"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-background/20 text-primary-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold truncate">{tab.label}</div>
                <div
                  className={`text-[11px] truncate ${
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: COUNTER RELEASE & VERIFICATION DESK */}
      {/* ============================================================== */}
      {workspaceView === "COUNTER" && (
        <>
          {/* Express Lookup & Active Claimant Inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 cols: Express Reference / QR Scanner Lookup */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border border-border shadow-sm bg-card">
                <CardHeader className="border-b border-border bg-muted/40 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center space-x-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span>Express Reference / QR Lookup</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Scan QR or Enter PLM-2026-XXXXX..."
                      className="pl-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Quick Select Active Queue
                    </span>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {filteredRequests.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedReqId(r.id)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${
                            activeReq?.id === r.id
                              ? "border-primary bg-primary/15 font-semibold"
                              : "border-border hover:bg-muted/60 bg-card"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-mono font-bold text-foreground">
                              {r.id}
                            </div>
                            <div className="text-muted-foreground truncate">
                              {r.studentName} ({r.studentId})
                            </div>
                          </div>
                          <div className="shrink-0">{getStatusBadge(r.status)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 8 cols: Active Claimant Verification & Release Console */}
            <div className="lg:col-span-8">
              {activeReq ? (
                <Card className="border-2 border-border shadow-md bg-card overflow-hidden">
                  <div className="bg-muted/60 border-b border-border px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-mono text-xs font-bold">
                        {activeReq.id}
                      </span>
                      <div>
                        <h2 className="text-base font-bold text-foreground">
                          {activeReq.studentName}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Student ID: <strong>{activeReq.studentId}</strong> •{" "}
                          {activeReq.program} ({activeReq.yearLevel})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(activeReq.status)}
                      <span className="text-xs font-bold text-foreground bg-card px-2.5 py-1 rounded border border-border">
                        Registrar Window
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* Grid: Requested Credentials + Claimant / Proxy Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Credentials */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          1. Credentials to Release
                        </h3>
                        <div className="border border-border rounded-lg divide-y divide-border text-xs">
                          {activeReq.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 flex items-center justify-between bg-card"
                            >
                              <div>
                                <span className="font-semibold text-foreground block">
                                  {item.name}
                                </span>
                                <span className="text-muted-foreground">
                                  Qty: {item.quantity} copy/ies
                                </span>
                              </div>
                              <span className="font-mono font-bold text-foreground">
                                ₱{(item.fee * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="p-3 bg-muted/60 flex items-center justify-between font-bold text-foreground">
                            <span>Total Assessment ({activeReq.paymentStatus})</span>
                            <span className="text-primary">
                              ₱{activeReq.totalFee.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Scheduled Date:</span>
                            <strong className="text-foreground">
                              {activeReq.appointmentDate}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time Window:</span>
                            <strong className="text-primary">
                              {activeReq.appointmentSlot}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stated Purpose:</span>
                            <strong className="text-foreground">{activeReq.purpose}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Claimant Identity & Proxy Verification */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          2. Claimant Identity & Mandatory Checks
                        </h3>

                        {activeReq.representative.isRepresentative ? (
                          <div className="p-3.5 rounded-lg bg-secondary border border-border text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-secondary-foreground uppercase tracking-wider text-[11px] flex items-center">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-primary" />
                                Authorized Proxy Representative
                              </span>
                              <Badge variant="pending">Strict ID Check</Badge>
                            </div>
                            <div className="text-foreground space-y-0.5">
                              <div>
                                Proxy Name:{" "}
                                <strong>{activeReq.representative.name}</strong> (
                                {activeReq.representative.relationship})
                              </div>
                              <div>
                                Presented ID:{" "}
                                <strong>{activeReq.representative.idType}</strong> —{" "}
                                <span className="font-mono">
                                  {activeReq.representative.idNumber}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsLetterPreviewOpen(true)}
                              className="w-full text-xs h-8 mt-1"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5 text-primary" />
                              Inspect Signed Authorization Letter
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-lg bg-primary/15 border border-primary/30 text-xs">
                            <span className="font-bold text-foreground block">
                              Personal Appearance by Student
                            </span>
                            <span className="text-muted-foreground">
                              Verify physical PLMun Student ID or Government ID of{" "}
                              <strong>{activeReq.studentName}</strong>.
                            </span>
                          </div>
                        )}

                        {/* Counter Officer Verification Checkboxes */}
                        <div className="space-y-2 pt-1">
                          <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/40 text-xs">
                            <input
                              type="checkbox"
                              checked={idVerified}
                              onChange={(e) => setIdVerified(e.target.checked)}
                              className="w-4 h-4 accent-primary rounded"
                            />
                            <span className="font-medium text-foreground">
                              Physical Valid ID & Signature Inspected
                            </span>
                          </label>

                          <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/40 text-xs">
                            <input
                              type="checkbox"
                              checked={clearanceVerified}
                              onChange={(e) => setClearanceVerified(e.target.checked)}
                              className="w-4 h-4 accent-primary rounded"
                            />
                            <span className="font-medium text-foreground">
                              University Clearance & Academic Record Verified
                            </span>
                          </label>

                          <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/40 text-xs">
                            <input
                              type="checkbox"
                              checked={feeSettled}
                              onChange={(e) => setFeeSettled(e.target.checked)}
                              className="w-4 h-4 accent-primary rounded"
                            />
                            <span className="font-medium text-foreground">
                              Cashier Official Receipt / Waiver Verified
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Counter Action Bar */}
                    <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          onClick={handleReleaseDocument}
                          disabled={activeReq.status === "CLAIMED"}
                          className="font-semibold"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          {activeReq.status === "CLAIMED"
                            ? "Already Released & Claimed"
                            : "Release & Stamp Claimed"}
                        </Button>

                        {activeReq.status !== "READY_FOR_PICKUP" &&
                          activeReq.status !== "CLAIMED" && (
                            <Button
                              variant="outline"
                              onClick={() => handleMarkReady()}
                            >
                              <FileCheck className="w-4 h-4 mr-1.5 text-primary" />
                              Mark Ready in Bin
                            </Button>
                          )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={handleTagNoShow}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <UserX className="w-4 h-4 mr-1.5" />
                          Tag No-Show
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setIsDeficiencyOpen(true)}
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Issue Deficiency
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-12 text-center text-muted-foreground">
                  Select a request from the queue to inspect.
                </Card>
              )}
            </div>
          </div>

          {/* Bottom Master Appointment Register Table */}
          <Card className="border border-border shadow-sm bg-card overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Registrar Window Master Register
                </h2>
                <p className="text-xs text-muted-foreground">
                  Click any row to load the student claimant into the active verification console above.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: "All Records", count: requests.length },
                  {
                    id: "TODAY",
                    label: "Ready / Today",
                    count: requests.filter(
                      (r) =>
                        r.status === "READY_FOR_PICKUP" ||
                        r.appointmentDate === "2026-11-06"
                    ).length,
                  },
                  {
                    id: "PROCESSING",
                    label: "Processing",
                    count: requests.filter((r) => r.status === "PROCESSING").length,
                  },
                  {
                    id: "NEEDS_REVIEW",
                    label: "Needs Review",
                    count: requests.filter(
                      (r) => r.status === "PENDING_REVIEW" || r.status === "REJECTED"
                    ).length,
                  },
                  {
                    id: "NO_SHOW",
                    label: "No-Show",
                    count: requests.filter((r) => r.status === "NO_SHOW").length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeTab === tab.id
                          ? "bg-background text-foreground"
                          : "bg-card text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4">Student Claimant</th>
                    <th className="py-3 px-4">Documents</th>
                    <th className="py-3 px-4">Claimant Mode</th>
                    <th className="py-3 px-4">Slot & Counter</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRequests.map((req) => {
                    const isSelected = activeReq?.id === req.id;
                    return (
                      <tr
                        key={req.id}
                        onClick={() => setSelectedReqId(req.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          {req.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">
                            {req.studentName}
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            {req.studentId} • {req.program}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="truncate font-medium text-foreground">
                            {req.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {req.representative.isRepresentative ? (
                            <span className="inline-flex items-center text-foreground font-semibold">
                              Proxy ({req.representative.relationship})
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Personal</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">
                            {req.appointmentDate}
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            {req.appointmentSlot} • Registrar Window
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">
                            ₱{req.totalFee.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-primary font-medium">
                            {req.paymentStatus.replace(/_/g, " ")}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className="h-7 text-xs"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: PRINTING & DRY-SEAL PREPARATION QUEUE */}
      {/* ============================================================== */}
      {workspaceView === "PROCESSING_QUEUE" && (
        <div className="space-y-6">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/40 pb-4">
              <CardTitle className="text-lg font-bold flex items-center space-x-2">
                <Printer className="w-5 h-5 text-primary" />
                <span>Document Printing, Signing & Dry-Seal Queue</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Advance requests from initial verification through printing/dry-sealing to the Registrar Window Releasing Bin.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary text-xs">
                          {req.id}
                        </span>
                        {getStatusBadge(req.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">
                          {req.studentName} ({req.studentId})
                        </h3>
                        <p className="text-xs text-muted-foreground">{req.program}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-xs space-y-1">
                        {req.items.map((item, i) => (
                          <div key={i} className="flex justify-between font-medium">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-mono">
                              ₱{(item.fee * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">
                        Pickup: <strong className="text-foreground">{req.appointmentDate}</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {req.status === "PENDING_REVIEW" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateRequestStatus(
                                req.id,
                                "PROCESSING",
                                "Records Evaluator",
                                "Academic records verified; sent to security paper printing."
                              )
                            }
                          >
                            Start Printing
                          </Button>
                        )}
                        {(req.status === "PENDING_REVIEW" ||
                          req.status === "PROCESSING") && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkReady(req.id)}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Dispatch to Counter Bin
                          </Button>
                        )}
                        {req.paymentStatus === "PAY_AT_CASHIER" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              updatePaymentStatus(
                                req.id,
                                "PAID_ONLINE",
                                "Cashier Counter Verifier"
                              )
                            }
                          >
                            Verify Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: DAILY APPOINTMENT SLOT MANIFEST (SINGLE WINDOW) */}
      {/* ============================================================== */}
      {workspaceView === "SLOT_MANIFEST" && (
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border bg-muted/40 pb-4">
            <CardTitle className="text-lg font-bold flex items-center space-x-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              <span>Single Registrar Window • Time-Slot Manifest</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Consolidated schedule of reserved student claiming appointments at the Registrar Releasing Window.
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              "08:30 AM – 09:00 AM",
              "09:00 AM – 09:30 AM",
              "10:00 AM – 10:30 AM",
              "11:00 AM – 11:30 AM",
              "01:30 PM – 02:00 PM",
              "02:30 PM – 03:00 PM",
              "03:30 PM – 04:00 PM",
            ].map((slot) => {
              const slotReqs = requests.filter((r) => r.appointmentSlot === slot);
              return (
                <div
                  key={slot}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">{slot}</span>
                      <Badge variant="outline">
                        {slotReqs.length} / {windowSettings.maxCapacityPerSlot} Reserved
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Designated Counter: <strong>Registrar Releasing Window</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {slotReqs.length > 0 ? (
                      slotReqs.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSelectedReqId(r.id);
                            setWorkspaceView("COUNTER");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-xs text-left transition"
                        >
                          <div className="font-mono font-bold text-primary">{r.id}</div>
                          <div className="text-foreground font-medium">{r.studentName}</div>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No claimants booked for this block
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* MODAL: Scanned Proxy Authorization Letter Preview */}
      {/* ============================================================== */}
      {isLetterPreviewOpen && activeReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-card border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  Scanned Proxy Authorization Slip & ID
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLetterPreviewOpen(false)}
                className="opacity-80 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CardContent className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-muted/60 border border-border rounded-lg space-y-3 font-serif">
                <div className="text-center border-b border-border pb-2">
                  <strong className="block text-sm text-foreground">
                    AUTHORIZATION LETTER
                  </strong>
                  <span className="text-[11px] text-muted-foreground font-sans">
                    Filing Date: {activeReq.createdAt}
                  </span>
                </div>

                <p className="leading-relaxed text-foreground">
                  I, <strong>{activeReq.studentName}</strong>, student of Pamantasan ng
                  Lungsod ng Muntinlupa under Student ID{" "}
                  <strong>{activeReq.studentId}</strong>, hereby authorize my{" "}
                  {activeReq.representative.relationship?.toLowerCase()},{" "}
                  <strong>{activeReq.representative.name}</strong>, to claim my
                  official academic credentials at the Registrar Releasing Window on my behalf.
                </p>

                <div className="pt-4 flex justify-between items-end font-sans">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Representative ID
                    </span>
                    <strong className="text-foreground">
                      {activeReq.representative.idType}
                    </strong>
                    <span className="block text-muted-foreground font-mono text-[10px]">
                      {activeReq.representative.idNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-base text-primary italic">
                      {activeReq.studentName}
                    </div>
                    <span className="border-t border-border block pt-1 text-[10px] text-muted-foreground">
                      Student Signature
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsLetterPreviewOpen(false)}>
                  Close Document Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Deficiency / Rejection Notice */}
      {/* ============================================================== */}
      {isDeficiencyOpen && activeReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border border-destructive/40 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-destructive text-destructive-foreground p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  Issue Deficiency Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeficiencyOpen(false)}
                className="opacity-80 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchDeficiency}>
              <CardContent className="p-6 space-y-4 text-xs">
                <p className="text-muted-foreground">
                  Tagging request <strong>{activeReq.id}</strong> (
                  {activeReq.studentName}) as deficient. The student will receive
                  an alert to rectify the deficiency.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Primary Deficiency Reason *
                  </label>
                  <select
                    value={deficiencyReason}
                    onChange={(e) => setDeficiencyReason(e.target.value)}
                    className="w-full text-xs border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                  >
                    <option value="Unpaid Cashier Balance">Unpaid Cashier Balance</option>
                    <option value="Missing Valid Government / Student ID">
                      Missing Valid Government / Student ID
                    </option>
                    <option value="Discrepancy in Academic Records">
                      Discrepancy in Academic Records
                    </option>
                    <option value="Incomplete Library / Accounting Clearance">
                      Incomplete Library / Accounting Clearance
                    </option>
                    <option value="Unsigned Proxy Authorization Letter">
                      Unsigned Proxy Authorization Letter
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Officer Remarks & Rectification Instructions *
                  </label>
                  <textarea
                    rows={3}
                    value={deficiencyRemarks}
                    onChange={(e) => setDeficiencyRemarks(e.target.value)}
                    placeholder="e.g. Please settle pending tuition clearance at Cashier before claiming at window."
                    className="w-full text-xs border border-input rounded-md p-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeficiencyOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="font-semibold"
                  >
                    Dispatch Notice
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
