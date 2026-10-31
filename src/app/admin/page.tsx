"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { DocumentItem, RequestStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Settings,
  Users,
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Search,
  RefreshCcw,
  Building2,
  Wallet,
  TrendingUp,
  History,
  X,
  Lock,
  ArrowRight,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  station: string;
  active: boolean;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "STF-01",
    name: "Dr. Elena R. Villanueva",
    role: "University Registrar (Chief Admin)",
    email: "elena.villanueva@plmun.edu.ph",
    station: "Registrar Office • Admin Room 101",
    active: true,
  },
  {
    id: "STF-02",
    name: "Marco A. Reyes",
    role: "Senior Releasing Officer",
    email: "marco.reyes@plmun.edu.ph",
    station: "Registrar Releasing Window",
    active: true,
  },
  {
    id: "STF-03",
    name: "Liza M. Bautista",
    role: "Academic Records Evaluator (BSIT / BSCS)",
    email: "liza.bautista@plmun.edu.ph",
    station: "Records Verification Section",
    active: true,
  },
  {
    id: "STF-04",
    name: "Jomar C. Mendoza",
    role: "Dry-Seal & Credential custodian",
    email: "jomar.mendoza@plmun.edu.ph",
    station: "Vault & Printing Section",
    active: true,
  },
];

export default function AdminDashboardPage() {
  const {
    requests,
    updateRequestStatus,
    updatePaymentStatus,
    deleteRequest,
    catalog,
    updateCatalogItem,
    addCatalogItem,
    deleteCatalogItem,
    windowSettings,
    updateWindowSettings,
    resetDemoData,
    userRole,
    setUserRole,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "REQUESTS" | "CATALOG" | "SETTINGS"
  >("OVERVIEW");

  // Master Requests state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Catalog Editing Modal state
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [docForm, setDocForm] = useState<{
    id: string;
    name: string;
    category: "Certifications" | "Credentials" | "Diplomas";
    description: string;
    processingDays: string;
    fee: number;
    feeUnit: string;
    requirementsText: string;
  }>({
    id: "",
    name: "",
    category: "Certifications",
    description: "",
    processingDays: "3 - 5 Work Days",
    fee: 100,
    feeUnit: "per copy",
    requirementsText: "Valid Student ID, Clearance Slip",
  });

  // Inline Quick-Add Form state for Admin
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState<
    "Certifications" | "Credentials" | "Diplomas"
  >("Certifications");
  const [quickFee, setQuickFee] = useState<number>(75);
  const [quickDays, setQuickDays] = useState("3 - 5 Work Days");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickReqs, setQuickReqs] = useState("Valid Student ID, Clearance Slip");

  const handleQuickAddForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addCatalogItem({
      id: `form-${Date.now()}`,
      name: quickTitle.trim(),
      category: quickCategory,
      description:
        quickDesc.trim() ||
        `Official ${quickTitle.trim()} issued by the Office of the University Registrar.`,
      processingDays: quickDays.trim() || "3 - 5 Work Days",
      fee: Number(quickFee) || 0,
      feeUnit: "per copy",
      requirements: quickReqs
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
      iconName: "FileText",
    });
    setQuickTitle("");
    setQuickDesc("");
  };
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Releasing Officer");
  const [newStaffEmail, setNewStaffEmail] = useState("");

  // Analytics Calculations
  const totalRevenueAssessed = requests.reduce((acc, r) => acc + r.totalFee, 0);
  const paidRevenue = requests
    .filter((r) => r.paymentStatus === "PAID_ONLINE" || r.status === "CLAIMED")
    .reduce((acc, r) => acc + r.totalFee, 0);
  const waivedCount = requests.filter((r) => r.paymentStatus === "WAIVED").length;

  const statusCounts = {
    PENDING_REVIEW: requests.filter((r) => r.status === "PENDING_REVIEW").length,
    PROCESSING: requests.filter((r) => r.status === "PROCESSING").length,
    READY_FOR_PICKUP: requests.filter((r) => r.status === "READY_FOR_PICKUP").length,
    CLAIMED: requests.filter((r) => r.status === "CLAIMED").length,
    NO_SHOW: requests.filter((r) => r.status === "NO_SHOW").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };

  // Document popularity tally
  const docTallyMap: Record<string, { name: string; count: number; revenue: number }> = {};
  requests.forEach((req) => {
    req.items.forEach((item) => {
      if (!docTallyMap[item.documentId]) {
        docTallyMap[item.documentId] = { name: item.name, count: 0, revenue: 0 };
      }
      docTallyMap[item.documentId].count += item.quantity;
      docTallyMap[item.documentId].revenue += item.fee * item.quantity;
    });
  });
  const topDocuments = Object.values(docTallyMap).sort((a, b) => b.count - a.count);

  // Combined system-wide audit logs
  const allAuditLogs = requests
    .flatMap((r) =>
      r.auditTrail.map((log) => ({
        ...log,
        requestId: r.id,
        studentName: r.studentName,
      }))
    )
    .slice(0, 10);

  // Filtered Master Requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "Reference ID",
      "Student ID",
      "Student Name",
      "Program",
      "Total Fee (PHP)",
      "Payment Status",
      "Appointment Date",
      "Appointment Slot",
      "Service Window",
      "Status",
    ];
    const rows = requests.map((r) => [
      r.id,
      r.studentId,
      `"${r.studentName}"`,
      `"${r.program}"`,
      r.totalFee,
      r.paymentStatus,
      r.appointmentDate,
      `"${r.appointmentSlot}"`,
      `"${r.windowNumber}"`,
      r.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `plmun_registrar_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Edit Modal for Catalog Item
  const openEditDocModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setIsAddingDoc(false);
    setDocForm({
      id: doc.id,
      name: doc.name,
      category: doc.category,
      description: doc.description,
      processingDays: doc.processingDays,
      fee: doc.fee,
      feeUnit: doc.feeUnit || "per copy",
      requirementsText: doc.requirements.join(", "),
    });
  };

  // Open Add Modal for Catalog Item
  const openAddDocModal = () => {
    setEditingDoc(null);
    setIsAddingDoc(true);
    setDocForm({
      id: `doc-${Date.now()}`,
      name: "",
      category: "Certifications",
      description: "",
      processingDays: "3 - 5 Work Days",
      fee: 100,
      feeUnit: "per copy",
      requirementsText: "Valid Student ID, Clearance Slip",
    });
  };

  const handleSaveCatalogDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: DocumentItem = {
      id: docForm.id.trim() || `doc-${Date.now()}`,
      name: docForm.name.trim(),
      category: docForm.category,
      description: docForm.description.trim(),
      processingDays: docForm.processingDays.trim(),
      fee: Number(docForm.fee) || 0,
      feeUnit: docForm.feeUnit.trim() || undefined,
      requirements: docForm.requirementsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      iconName: "FileText",
    };

    if (editingDoc) {
      updateCatalogItem(newItem);
    } else {
      addCatalogItem(newItem);
    }
    setEditingDoc(null);
    setIsAddingDoc(false);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    setStaffList([
      ...staffList,
      {
        id: `STF-0${staffList.length + 1}`,
        name: newStaffName.trim(),
        role: newStaffRole,
        email: newStaffEmail.trim(),
        station: "Registrar Releasing Window",
        active: true,
      },
    ]);
    setNewStaffName("");
    setNewStaffEmail("");
  };

  if (userRole !== "ADMIN") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card className="border border-border bg-card shadow-md text-center p-8 space-y-5">
          <div className="w-14 h-14 rounded-full bg-primary/15 text-primary mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-foreground">
              Administrator Access Required
            </h1>
            <p className="text-xs text-muted-foreground">
              The Registrar System Administration module is restricted to the Chief University Registrar and System Administrators. Sign in through the unified Login portal with Admin credentials.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Go to Login Page
              </Button>
            </Link>
            <Button
              onClick={() => setUserRole("ADMIN")}
              className="w-full sm:w-auto"
            >
              Quick Authorize as Admin
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Image
            src="/plmun-logo.png"
            alt="PLMun Official Seal"
            width={56}
            height={56}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-primary font-bold">
              <span>University Registrar Administration • System Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-0.5">
              Registrar Admin Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage academic credential fees, single releasing window capacity, master requests, and staff permissions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5 text-primary" />
            Export Master CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (confirm("Reset all requests, catalog fees, and window settings back to default demo values?")) {
                resetDemoData();
              }
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-1.5" />
            Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-card p-2 rounded-xl border border-border shadow-2xs">
        {[
          {
            id: "OVERVIEW",
            label: "Executive Overview",
            desc: "Analytics & Audit Logs",
            icon: BarChart3,
          },
          {
            id: "REQUESTS",
            label: "Master Requests",
            desc: `${requests.length} Total Requisitions`,
            icon: FileText,
          },
          {
            id: "CATALOG",
            label: "Document Catalog",
            desc: `${catalog.length} Credentials & Fees`,
            icon: Wallet,
          },
          {
            id: "SETTINGS",
            label: "Window & Staff",
            desc: "Single Window & Access",
            icon: Settings,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 rounded-lg text-left transition flex items-center space-x-3 ${isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "hover:bg-muted/70 text-foreground"
                }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive
                    ? "bg-background/20 text-primary-foreground"
                    : "bg-primary/15 text-primary"
                  }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold truncate">{tab.label}</div>
                <div
                  className={`text-[11px] truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"
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
      {/* TAB 1: EXECUTIVE OVERVIEW & ANALYTICS */}
      {/* ============================================================== */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-border bg-card shadow-2xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  <span>Total Assessed Fees</span>
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  ₱{totalRevenueAssessed.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-primary font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>₱{paidRevenue.toLocaleString()} settled / verified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-2xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  <span>Total Requisitions</span>
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {requests.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {statusCounts.READY_FOR_PICKUP} ready in releasing bin
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-2xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  <span>Single Window Status</span>
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {windowSettings.isWindowOpen ? "Active" : "Closed"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Max {windowSettings.maxCapacityPerSlot} slots / 30-min block
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-2xs">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  <span>RA 11261 Waived</span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {waivedCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  First-Time Jobseeker exemptions
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Pipeline Distribution & Top Documents */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border bg-muted/40 pb-3">
                  <CardTitle className="text-base font-bold">
                    Requisition Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    {
                      label: "Ready for Pickup (In Counter Bin)",
                      count: statusCounts.READY_FOR_PICKUP,
                      color: "bg-primary",
                    },
                    {
                      label: "Processing (Printing & Dry-Seal)",
                      count: statusCounts.PROCESSING,
                      color: "bg-chart-2",
                    },
                    {
                      label: "Pending Verification / Review",
                      count: statusCounts.PENDING_REVIEW,
                      color: "bg-chart-1",
                    },
                    {
                      label: "Claimed & Released",
                      count: statusCounts.CLAIMED,
                      color: "bg-chart-3",
                    },
                    {
                      label: "No-Show / Missed Slot",
                      count: statusCounts.NO_SHOW,
                      color: "bg-destructive/80",
                    },
                    {
                      label: "Deficiency Notice / Needs Revision",
                      count: statusCounts.REJECTED,
                      color: "bg-destructive",
                    },
                  ].map((item) => {
                    const pct =
                      requests.length > 0
                        ? Math.round((item.count / requests.length) * 100)
                        : 0;
                    return (
                      <div key={item.label} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-foreground">{item.label}</span>
                          <span className="text-muted-foreground font-mono">
                            {item.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all`}
                            style={{ width: `${Math.max(pct, item.count > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border bg-muted/40 pb-3">
                  <CardTitle className="text-base font-bold">
                    Most Requested Academic Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border text-xs">
                    {topDocuments.map((doc, idx) => (
                      <div
                        key={doc.name}
                        className="p-4 flex items-center justify-between hover:bg-muted/30"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-foreground">{doc.name}</span>
                        </div>
                        <div className="flex items-center space-x-4 font-mono">
                          <Badge variant="secondary">{doc.count} copies</Badge>
                          <span className="font-bold text-foreground w-20 text-right">
                            ₱{doc.revenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 5 cols: Live System Audit Trail */}
            <div className="lg:col-span-5">
              <Card className="border border-border bg-card shadow-sm h-full">
                <CardHeader className="border-b border-border bg-muted/40 pb-3">
                  <CardTitle className="text-base font-bold flex items-center space-x-2">
                    <History className="w-4 h-4 text-primary" />
                    <span>System-Wide Audit Log</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {allAuditLogs.map((log, index) => (
                      <div
                        key={`${log.requestId}-${index}`}
                        className="border-l-2 border-primary pl-3 py-0.5 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-primary">
                            {log.requestId}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {log.timestamp}
                          </span>
                        </div>
                        <div className="font-semibold text-foreground">{log.action}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Actor: <strong className="text-foreground">{log.actor}</strong> • Student:{" "}
                          {log.studentName}
                        </div>
                        {log.note && (
                          <div className="text-[11px] bg-muted/60 p-1.5 rounded border border-border text-muted-foreground">
                            {log.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MASTER REQUISITION DIRECTORY & OVERRIDE */}
      {/* ============================================================== */}
      {activeTab === "REQUESTS" && (
        <Card className="border border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/40 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">
                  Master Document Requisition Directory
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Override request statuses, verify cashier/online payments, or purge erroneous records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, Student, Program..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 text-xs border border-input rounded-md px-3 bg-background text-foreground"
                >
                  <option value="ALL">All Statuses ({requests.length})</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                  <option value="CLAIMED">Claimed</option>
                  <option value="NO_SHOW">No-Show</option>
                  <option value="REJECTED">Deficiency / Rejected</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Ref ID & Date</th>
                  <th className="py-3 px-4">Student & Program</th>
                  <th className="py-3 px-4">Requested Items</th>
                  <th className="py-3 px-4">Appointment (Registrar Window)</th>
                  <th className="py-3 px-4">Fee & Payment</th>
                  <th className="py-3 px-4">Status Override</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-bold text-primary">{req.id}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {req.createdAt}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-foreground">{req.studentName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {req.studentId} • {req.program}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="space-y-1">
                        {req.items.map((item, i) => (
                          <div key={i} className="text-foreground truncate">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-foreground">
                        {req.appointmentDate}
                      </div>
                      <div className="text-[11px] text-primary font-medium">
                        {req.appointmentSlot}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Registrar Window
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-foreground mb-1">
                        ₱{req.totalFee.toFixed(2)}
                      </div>
                      <select
                        value={req.paymentStatus}
                        onChange={(e) =>
                          updatePaymentStatus(
                            req.id,
                            e.target.value as any,
                            "University Registrar Admin"
                          )
                        }
                        className="text-[11px] border border-input rounded px-2 py-1 bg-background text-foreground"
                      >
                        <option value="PAID_ONLINE">Paid Online</option>
                        <option value="PAY_AT_CASHIER">Pay at Cashier</option>
                        <option value="WAIVED">Waived (RA 11261)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <select
                        value={req.status}
                        onChange={(e) =>
                          updateRequestStatus(
                            req.id,
                            e.target.value as RequestStatus,
                            "University Registrar Admin",
                            "Administrative status override"
                          )
                        }
                        className="text-[11px] font-semibold border border-input rounded px-2.5 py-1.5 bg-background text-foreground"
                      >
                        <option value="PENDING_REVIEW">PENDING REVIEW</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                        <option value="CLAIMED">CLAIMED</option>
                        <option value="NO_SHOW">NO-SHOW</option>
                        <option value="REJECTED">DEFICIENCY / REJECTED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 align-top text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/15"
                        onClick={() => {
                          if (confirm(`Delete request ${req.id} permanently?`)) {
                            deleteRequest(req.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DOCUMENT CATALOG & FEE MANAGER */}
      {/* ============================================================== */}
      {activeTab === "CATALOG" && (
        <div className="space-y-6">
          {/* Inline Add Additional Form Card */}
          <Card className="border border-border bg-card shadow-2xs">
            <CardHeader className="border-b border-border bg-muted/20 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-primary" />
                    <span>Add Additional Document Form</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Publish a new academic form or certificate directly to the Student Request & Home Catalog.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={openAddDocModal}>
                  Advanced Form Editor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <form
                onSubmit={handleQuickAddForm}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end text-xs"
              >
                <div className="lg:col-span-2">
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                    Document / Form Title *
                  </label>
                  <Input
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="e.g. Certificate of No Pending Case"
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                    Category
                  </label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as any)}
                    className="w-full h-9 text-xs border border-input rounded-md px-2.5 bg-background text-foreground"
                  >
                    <option value="Certifications">Certifications</option>
                    <option value="Credentials">Credentials</option>
                    <option value="Diplomas">Diplomas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                    Fee (PHP)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={quickFee}
                    onChange={(e) => setQuickFee(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                    Turnaround Days
                  </label>
                  <Input
                    value={quickDays}
                    onChange={(e) => setQuickDays(e.target.value)}
                    placeholder="3 - 5 Work Days"
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Button type="submit" className="w-full h-9 text-xs font-semibold">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-2xs">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Active Document Forms & Schedule of Fees ({catalog.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Any changes to document fees, turnaround days, or requirements immediately update the Home Catalog and Request page.
              </p>
            </div>
            <Button onClick={openAddDocModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Form
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalog.map((doc) => (
              <Card
                key={doc.id}
                className="border border-border bg-card shadow-2xs flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {doc.category}
                    </Badge>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-primary">
                        ₱{doc.fee.toFixed(2)}
                      </span>
                      {doc.feeUnit && (
                        <span className="text-[10px] text-muted-foreground block">
                          {doc.feeUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.description}
                    </p>
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-border">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      <span>Turnaround: </span>
                      <strong className="text-foreground ml-1">{doc.processingDays}</strong>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground">Requirements:</strong>{" "}
                      {doc.requirements.join(" • ")}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDocModal(doc)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Edit Fee / Info
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/15"
                      onClick={() => {
                        if (confirm(`Remove "${doc.name}" from the catalog?`)) {
                          deleteCatalogItem(doc.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SINGLE WINDOW & STAFF ACCESS SETTINGS */}
      {/* ============================================================== */}
      {activeTab === "SETTINGS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 cols: Single Registrar Releasing Window Configuration */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border bg-muted/40 pb-4">
                <CardTitle className="text-base font-bold flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span>Registrar Releasing Window Configuration</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Configure appointment capacity and counter rules for PLMun&apos;s single Registrar Releasing Window.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-5 text-xs">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/60 border border-border">
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      Registrar Releasing Window Status
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      Toggle whether the counter is actively accepting scheduled releases today.
                    </p>
                  </div>
                  <Button
                    variant={windowSettings.isWindowOpen ? "default" : "destructive"}
                    size="sm"
                    onClick={() =>
                      updateWindowSettings({
                        isWindowOpen: !windowSettings.isWindowOpen,
                      })
                    }
                  >
                    {windowSettings.isWindowOpen ? "Window Open" : "Window Closed"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Max Students per 30-Min Slot
                    </label>
                    <Input
                      type="number"
                      min={5}
                      max={100}
                      value={windowSettings.maxCapacityPerSlot}
                      onChange={(e) =>
                        updateWindowSettings({
                          maxCapacityPerSlot: Number(e.target.value) || 20,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Daily Counter Cut-Off Time
                    </label>
                    <Input
                      type="text"
                      value={windowSettings.cutoffTime}
                      onChange={(e) =>
                        updateWindowSettings({ cutoffTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                  <div>
                    <div className="font-bold text-foreground">
                      Allow Authorized Proxy / Representative Claiming
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      Permit immediate family or authorized proxies with signed SPA / Authorization Letter.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={windowSettings.allowProxyClaim}
                    onChange={(e) =>
                      updateWindowSettings({ allowProxyClaim: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right 6 cols: Registrar Staff Directory */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border bg-muted/40 pb-4">
                <CardTitle className="text-base font-bold flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Authorized Registrar Personnel</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Manage staff officers authorized to verify records and release documents at the counter.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-5 text-xs">
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Full Name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="text-xs h-9"
                    required
                  />
                  <Input
                    placeholder="Email (@plmun.edu.ph)"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="text-xs h-9"
                    required
                  />
                  <Button type="submit" size="sm" className="h-9">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Officer
                  </Button>
                </form>

                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {staffList.map((stf) => (
                    <div
                      key={stf.id}
                      className="p-3.5 bg-card flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <span>{stf.name}</span>
                          <Badge variant={stf.active ? "approved" : "secondary"}>
                            {stf.active ? "Active" : "Suspended"}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {stf.role} • {stf.email}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setStaffList(
                            staffList.map((s) =>
                              s.id === stf.id ? { ...s, active: !s.active } : s
                            )
                          )
                        }
                      >
                        {stf.active ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT CATALOG DOCUMENT */}
      {/* ============================================================== */}
      {(editingDoc || isAddingDoc) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-card border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingDoc ? `Edit Credential: ${editingDoc.name}` : "Add New Academic Credential"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingDoc(null);
                  setIsAddingDoc(false);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCatalogDoc}>
              <CardContent className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Credential Title *
                  </label>
                  <Input
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                    placeholder="e.g. Official Transcript of Records (TOR)"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Category
                    </label>
                    <select
                      value={docForm.category}
                      onChange={(e) =>
                        setDocForm({ ...docForm, category: e.target.value as any })
                      }
                      className="w-full h-9 text-xs border border-input rounded-md px-2.5 bg-background text-foreground"
                    >
                      <option value="Credentials">Credentials</option>
                      <option value="Certifications">Certifications</option>
                      <option value="Diplomas">Diplomas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Fee (PHP) *
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={docForm.fee}
                      onChange={(e) =>
                        setDocForm({ ...docForm, fee: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Turnaround *
                    </label>
                    <Input
                      value={docForm.processingDays}
                      onChange={(e) =>
                        setDocForm({ ...docForm, processingDays: e.target.value })
                      }
                      placeholder="3 - 5 Work Days"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Description *
                  </label>
                  <Input
                    value={docForm.description}
                    onChange={(e) =>
                      setDocForm({ ...docForm, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Requirements (comma-separated)
                  </label>
                  <Input
                    value={docForm.requirementsText}
                    onChange={(e) =>
                      setDocForm({ ...docForm, requirementsText: e.target.value })
                    }
                    placeholder="Clearance Slip, Valid Student ID"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingDoc(null);
                      setIsAddingDoc(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Credential</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

