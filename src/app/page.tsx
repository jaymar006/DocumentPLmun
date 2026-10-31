"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { DOCUMENT_CATALOG, PLMUN_PROGRAMS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Search,
  Clock,
  ArrowRight,
  LogIn,
  UserPlus,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  Lock,
  X,
} from "lucide-react";

export default function PublicLandingPage() {
  const router = useRouter();
  const {
    currentStudent,
    setCurrentStudent,
    catalog,
    authenticateUser,
    userRole,
    logoutUser,
  } = useStore();

  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "register">("login");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // New account form
  const [regName, setRegName] = useState("");
  const [regId, setRegId] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regProgram, setRegProgram] = useState(PLMUN_PROGRAMS[0]);
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regError, setRegError] = useState("");

  // Catalog filter
  const [catalogFilter, setCatalogFilter] = useState<"All" | "Certifications" | "Credentials" | "Diplomas">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Auth Required Popup Modal when requesting without an active account
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState<string>("/request");
  const [pendingDocName, setPendingDocName] = useState<string>("");
  const [modalLoginId, setModalLoginId] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);

  const handleProtectedAction = (targetUrl: string, docTitle?: string) => {
    if (userRole) {
      router.push(targetUrl);
    } else {
      setPendingRedirectUrl(targetUrl);
      setPendingDocName(docTitle || "");
      setIsAuthModalOpen(true);
    }
  };

  const handleModalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalLoginId.trim()) return;
    const role = authenticateUser(modalLoginId);
    setIsAuthModalOpen(false);
    if (role === "ADMIN") {
      router.push("/admin");
    } else if (role === "STAFF") {
      router.push("/staff");
    } else {
      router.push(pendingRedirectUrl || "/request");
    }
  };

  const filteredDocs = catalog.filter((doc) => {
    const matchesCategory =
      catalogFilter === "All" || doc.category === catalogFilter;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId.trim()) {
      const role = authenticateUser(loginId);
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "STAFF") {
        router.push("/staff");
      } else {
        router.push("/portal");
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match. Please verify your password.");
      return;
    }
    setRegError("");
    if (regName && regId) {
      authenticateUser(regId);
      setCurrentStudent({
        id: regId,
        name: regName,
        email: regEmail || `${regId.toLowerCase()}@plmun.edu.ph`,
        program: regProgram,
      });
      router.push("/request");
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Banner Notice */}
      <div className="bg-secondary border-b border-border py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-secondary-foreground font-medium">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>Official Registrar Advisory:</strong> All document releases require prior reservation of an appointment slot at the Registrar Releasing Window. Walk-ins are strictly not permitted.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleProtectedAction("/request")}
            className="hidden sm:inline-flex items-center text-primary font-bold hover:underline cursor-pointer"
          >
            Book Appointment Slot →
          </button>
        </div>
      </div>

      {/* Hero & Auth Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Hero Left (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Avoid Lines. Secure an{" "}
              <span className="text-primary">Appointment Slot</span> for Your
              Official Documents.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              The official self-service requisition portal of the Office of the
              University Registrar. Request Transcript of Records, Certificates,
              and Diplomas online, track processing real-time, and schedule your
              fast-track pickup at the Registrar Releasing Window.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <div className="p-3 bg-card rounded-lg border border-border shadow-2xs">
                <div className="text-xl font-bold text-primary">{catalog.length}</div>
                <div className="text-xs text-muted-foreground font-medium">Available Records</div>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border shadow-2xs">
                <div className="text-xl font-bold text-foreground">3–5 Days</div>
                <div className="text-xs text-muted-foreground font-medium">Standard Turnaround</div>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border shadow-2xs">
                <div className="text-xl font-bold text-primary">1 Window</div>
                <div className="text-xs text-muted-foreground font-medium">Single Express Counter</div>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border shadow-2xs">
                <div className="text-xl font-bold text-foreground">RA 10173</div>
                <div className="text-xs text-muted-foreground font-medium">Privacy Shielded</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => handleProtectedAction("/request")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Request Document Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleProtectedAction("/portal")}
              >
                <GraduationCap className="w-4 h-4 mr-2 text-primary" />
                Track Existing Request Slip
              </Button>
            </div>
          </div>

          {/* Auth Card Right (5 cols) */}
          <div className="lg:col-span-5" id="login-card">
            {userRole ? (
              <Card className="border border-border shadow-sm overflow-hidden bg-card">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between border-b border-border pb-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Active Portal Session</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        {userRole === "ADMIN"
                          ? "Dr. Elena R. Villanueva"
                          : userRole === "STAFF"
                            ? "Marco A. Reyes"
                            : currentStudent.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {userRole === "ADMIN"
                          ? "University Registrar • Admin"
                          : userRole === "STAFF"
                            ? "Releasing Officer • Staff Desk"
                            : `${currentStudent.id} • ${currentStudent.program}`}
                      </p>
                    </div>
                    <Badge variant="approved">{userRole}</Badge>
                  </div>

                  <div className="space-y-2.5">
                    {userRole === "ADMIN" && (
                      <Link href="/admin" className="block">
                        <Button className="w-full font-semibold">
                          Open Admin Portal
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                    {(userRole === "STAFF" || userRole === "ADMIN") && (
                      <Link href="/staff" className="block">
                        <Button
                          variant={userRole === "STAFF" ? "default" : "outline"}
                          className="w-full font-semibold"
                        >
                          Open Staff Desk
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                    {userRole === "STUDENT" && (
                      <>
                        <Link href="/request" className="block">
                          <Button className="w-full font-semibold">
                            <FileText className="w-4 h-4 mr-2" />
                            New Document Request
                          </Button>
                        </Link>
                        <Link href="/portal" className="block">
                          <Button variant="outline" className="w-full font-semibold">
                            View My Requests & QR Slip
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        logoutUser();
                        setLoginId("");
                        setLoginPassword("");
                      }}
                      className="w-full text-xs font-semibold text-destructive hover:bg-destructive/15"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out of Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border shadow-md overflow-hidden bg-card">
                {/* Tab Header */}
                <div className="grid grid-cols-2 border-b border-border bg-muted/60">
                  <button
                    type="button"
                    onClick={() => setActiveAuthTab("login")}
                    className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition ${activeAuthTab === "login"
                      ? "border-primary bg-card text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAuthTab("register")}
                    className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition ${activeAuthTab === "register"
                      ? "border-primary bg-card text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>New Account</span>
                  </button>
                </div>

                <CardContent className="p-6">
                  {activeAuthTab === "login" ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Account ID or WebMail
                        </label>
                        <Input
                          type="text"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          placeholder="e.g. 2021-04981, staff, or admin"
                          required
                          className="font-medium"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Use Student ID (2021-04981), Staff ID (<code className="text-foreground font-mono">staff</code>), or Admin (<code className="text-foreground font-mono">admin</code>)
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Password
                          </label>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert("Please contact the Registrar IT Helpdesk at (02) 8659-5247 or visit Admin Room 101.");
                            }}
                            className="text-[11px] text-primary hover:underline"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <div className="relative">
                          <Input
                            type={showLoginPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                            aria-label={showLoginPassword ? "Hide password" : "Show password"}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded accent-primary focus:ring-ring"
                          />
                          <span>Remember my credentials</span>
                        </label>
                        <span className="text-primary font-medium">Role-Based Auth</span>
                      </div>

                      <Button type="submit" className="w-full font-semibold py-2.5 mt-2">
                        <span>Authorize and Proceed</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <div className="mt-4 pt-3 border-t border-border space-y-2">
                        <span className="text-[11px] text-muted-foreground block text-center font-medium">
                          Quick Role Credentials (Click to Fill):
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginId("2021-04981");
                              setLoginPassword("plmun2026");
                            }}
                            className="px-2 py-1.5 rounded border border-border bg-muted/50 hover:bg-secondary text-foreground font-semibold transition text-center"
                          >
                            Student
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginId("staff@plmun.edu.ph");
                              setLoginPassword("plmun2026");
                            }}
                            className="px-2 py-1.5 rounded border border-border bg-muted/50 hover:bg-secondary text-foreground font-semibold transition text-center"
                          >
                            Staff Desk
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginId("admin@plmun.edu.ph");
                              setLoginPassword("plmun2026");
                            }}
                            className="px-2 py-1.5 rounded border border-border bg-muted/50 hover:bg-secondary text-foreground font-semibold transition text-center"
                          >
                            Admin
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Full Legal Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Last Name, First Name, Middle Name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Student ID Number
                        </label>
                        <Input
                          type="text"
                          placeholder="20XX-XXXXX"
                          value={regId}
                          onChange={(e) => setRegId(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Academic Degree Program
                        </label>
                        <select
                          value={regProgram}
                          onChange={(e) => setRegProgram(e.target.value)}
                          className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {PLMUN_PROGRAMS.map((prog) => (
                            <option key={prog} value={prog}>
                              {prog}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Active Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="student@plmun.edu.ph"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showRegPassword ? "text" : "password"}
                              placeholder="Create password"
                              value={regPassword}
                              onChange={(e) => {
                                setRegPassword(e.target.value);
                                if (regError) setRegError("");
                              }}
                              required
                              className="pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                              aria-label={showRegPassword ? "Hide password" : "Show password"}
                            >
                              {showRegPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showRegConfirmPassword ? "text" : "password"}
                              placeholder="Confirm password"
                              value={regConfirmPassword}
                              onChange={(e) => {
                                setRegConfirmPassword(e.target.value);
                                if (regError) setRegError("");
                              }}
                              required
                              className="pr-9"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowRegConfirmPassword(!showRegConfirmPassword)
                              }
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                              aria-label={
                                showRegConfirmPassword
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }
                            >
                              {showRegConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {regError && (
                        <p className="text-xs text-destructive font-medium">
                          {regError}
                        </p>
                      )}

                      <Button type="submit" className="w-full font-semibold py-2.5 mt-2">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Student Profile
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* How Document Requests Work Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            How Document Requests Work
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Follow the streamlined 4-step registrar protocol to reserve your credentials without long waiting queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center border border-primary/30 text-sm">
              01
            </div>
            <h3 className="font-bold text-foreground text-base">Request Online</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select your required certificates, transcripts, or diplomas from the official catalog.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center border border-border text-sm">
              02
            </div>
            <h3 className="font-bold text-foreground text-base">Clearance & Fee</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated record verification confirms accounting clearance and calculates exact fees.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center border border-primary/30 text-sm">
              03
            </div>
            <h3 className="font-bold text-foreground text-base">Pick Claim Slot</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose your preferred date and time slot at the Registrar Releasing Window.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-full bg-muted text-foreground font-bold flex items-center justify-center border border-border text-sm">
              04
            </div>
            <h3 className="font-bold text-foreground text-base">Express Counter Claim</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Present your QR confirmation slip and student ID at the window for instant dry-sealed release.
            </p>
          </div>
        </div>
      </section>

      {/* Document Catalog & Requirements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Document Catalog & Requirements
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Official list of credentials, mandatory filing prerequisites, turnaround days, and fees.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search document name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(["All", "Certifications", "Credentials", "Diplomas"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCatalogFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${catalogFilter === cat
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                >
                  {cat}
                </button>
              )
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Showing {filteredDocs.length} of {catalog.length} records
            </span>
          </div>

          {/* Documents Table */}
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Document Item</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3.5 px-4">Mandatory Requirements</th>
                  <th className="py-3.5 px-4">Turnaround</th>
                  <th className="py-3.5 px-4 text-right">Prescribed Fee</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/40 transition">
                    <td className="py-4 px-4 font-medium text-foreground">
                      <div className="font-semibold text-foreground flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span>{doc.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-normal line-clamp-1">
                        {doc.description}
                      </p>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {doc.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                        {doc.requirements.map((req, idx) => (
                          <li key={idx} className="line-clamp-1">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{doc.processingDays}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-foreground whitespace-nowrap">
                      ₱{doc.fee.toFixed(2)}
                      {doc.feeUnit && (
                        <span className="text-[11px] font-normal text-muted-foreground block">
                          {doc.feeUnit}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          handleProtectedAction(`/request?doc=${doc.id}`, doc.name)
                        }
                      >
                        Request
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MODAL: SIGN IN REQUIRED WHEN REQUESTING WITHOUT ACCOUNT */}
      {/* ============================================================== */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Account Sign-In Required
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    PLMun Registrar Portal Authentication
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalLogin}>
              <CardContent className="p-6 space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border text-muted-foreground leading-relaxed">
                  {pendingDocName ? (
                    <>
                      To request{" "}
                      <strong className="text-foreground">{pendingDocName}</strong>,
                      please sign in with your Student ID first.
                    </>
                  ) : (
                    <>
                      Please sign in with your PLMun Student ID or account credentials to proceed with your document request.
                    </>
                  )}
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Account ID or WebMail *
                  </label>
                  <Input
                    type="text"
                    value={modalLoginId}
                    onChange={(e) => setModalLoginId(e.target.value)}
                    placeholder="e.g. 2021-04981"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showModalPassword ? "text" : "password"}
                      value={modalPassword}
                      onChange={(e) => setModalPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      aria-label={showModalPassword ? "Hide password" : "Show password"}
                    >
                      {showModalPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModalLoginId("2021-04981");
                      setModalPassword("plmun2026");
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Quick Fill Demo Student (2021-04981)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setActiveAuthTab("register");
                      document
                        .getElementById("login-card")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline"
                  >
                    Create New Account
                  </button>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAuthModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="font-semibold">
                    <span>Sign In & Continue</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
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
