"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { DOCUMENT_CATALOG, PLMUN_PROGRAMS, REQUEST_PURPOSES } from "@/lib/data";
import { SelectedDocument, RepresentativeInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  ShieldAlert,
  UserCheck,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Upload,
  QrCode,
  Building,
  Check,
  Building2,
} from "lucide-react";

function RequestWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDocId = searchParams.get("doc");

  const { currentStudent, addRequest, catalog, userRole, authenticateUser, openAuthModal } = useStore();

  // Wizard Phase: 1, 2, 3, 4, 5 (Success)
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Phase 1: Consent
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Phase 2: Student Record
  const [studentId, setStudentId] = useState(currentStudent.id);
  const [studentName, setStudentName] = useState(currentStudent.name);
  const [email, setEmail] = useState(currentStudent.email);
  const [phone, setPhone] = useState("+63 917 555 4981");
  const [program, setProgram] = useState(currentStudent.program || PLMUN_PROGRAMS[0]);
  const [yearLevel, setYearLevel] = useState("4th Year (Senior)");
  const [purpose, setPurpose] = useState(REQUEST_PURPOSES[1]);
  const [otherPurposeSpecify, setOtherPurposeSpecify] = useState("");
  const [otherCertSpecify, setOtherCertSpecify] = useState("");

  // Phase 3: Documents & Rep
  const [selectedItems, setSelectedItems] = useState<SelectedDocument[]>([
    {
      documentId: "cog",
      name: "Certificate of Grades",
      fee: 50,
      quantity: 1,
    },
  ]);

  // Handle URL query parameter pre-selection
  useEffect(() => {
    if (preselectedDocId) {
      const found = catalog.find((d) => d.id === preselectedDocId);
      if (found) {
        setSelectedItems([
          {
            documentId: found.id,
            name: found.name,
            fee: found.fee,
            quantity: 1,
          },
        ]);
      }
    }
  }, [preselectedDocId, catalog]);

  // Representative Info
  const [isRep, setIsRep] = useState(false);
  const [repName, setRepName] = useState("");
  const [repRelationship, setRepRelationship] = useState("Parent (Mother / Father)");
  const [repIdType, setRepIdType] = useState("Driver's License (LTO)");
  const [repIdNumber, setRepIdNumber] = useState("");
  const [repLetterUploaded, setRepLetterUploaded] = useState(false);

  // Phase 4: Appointment & Payment
  const [selectedDate, setSelectedDate] = useState("2026-11-06");
  const [selectedSlot, setSelectedSlot] = useState("09:00 AM – 09:30 AM");
  const assignedWindow = "Registrar Window";
  const [paymentOption, setPaymentOption] = useState<"PAID_ONLINE" | "PAY_AT_CASHIER">("PAID_ONLINE");

  // Generated Request State
  const [createdRequestId, setCreatedRequestId] = useState<string>("");

  // Helpers for items
  const updateQuantity = (docId: string, delta: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.documentId === docId);
      if (!existing && delta > 0) {
        const cat = catalog.find((d) => d.id === docId) || DOCUMENT_CATALOG.find((d) => d.id === docId);
        if (!cat) return prev;
        return [...prev, { documentId: docId, name: cat.name, fee: cat.fee, quantity: 1 }];
      }
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((i) => i.documentId !== docId);
        }
        return prev.map((i) => (i.documentId === docId ? { ...i, quantity: newQty } : i));
      }
      return prev;
    });
  };

  const totalFee = selectedItems.reduce((acc, item) => acc + item.fee * item.quantity, 0);

  // Submit Handler
  const handleFinalSubmit = () => {
    const repInfo: RepresentativeInfo = {
      isRepresentative: isRep,
      name: isRep ? repName : undefined,
      relationship: isRep ? repRelationship : undefined,
      idType: isRep ? repIdType : undefined,
      idNumber: isRep ? repIdNumber : undefined,
      letterAttached: isRep ? repLetterUploaded : undefined,
    };

    const resolvedPurpose =
      purpose === "Other" && otherPurposeSpecify.trim()
        ? `Other: ${otherPurposeSpecify.trim()}`
        : purpose;

    const resolvedItems = selectedItems.map((item) => {
      if (item.documentId === "other-certificate" && otherCertSpecify.trim()) {
        return {
          ...item,
          name: `Other Certificate (${otherCertSpecify.trim()})`,
        };
      }
      return item;
    });

    const newReq = addRequest({
      studentId,
      studentName,
      email,
      phone,
      program,
      yearLevel,
      purpose: resolvedPurpose,
      items: resolvedItems,
      totalFee,
      paymentStatus: paymentOption,
      representative: repInfo,
      appointmentDate: selectedDate,
      appointmentSlot: selectedSlot,
      windowNumber: assignedWindow,
      status: "PROCESSING",
      remarks: "Scheduled for verified processing at Registrar Releasing Window.",
    });

    setCreatedRequestId(newReq.id);
    setCurrentPhase(5);
  };

  if (!userRole) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <Card className="border border-border bg-card shadow-2xs text-center p-8 space-y-5">
          <div className="w-12 h-12 rounded-full bg-muted border border-border text-foreground mx-auto flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-foreground">
              Sign In Required
            </h1>
            <p className="text-xs text-muted-foreground">
              Please sign in with your PLMun Student ID on the Home page before filing a document request.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Button
              className="w-full sm:w-auto"
              onClick={() => openAuthModal("/request")}
            >
              Sign In to Account
              <ArrowRight className="w-4 h-4 ml-1.5" />
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Subtitle */}
      <div className="border-b border-border pb-4 flex items-center space-x-4">
        <Image
          src="/plmun-logo.png"
          alt="PLMun Official Seal"
          width={52}
          height={52}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
        />
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Pamantasan ng Lungsod ng Muntinlupa • Office of the Registrar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5">
            Document Request & Claim Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Complete the four-step protocol to request academic credentials and reserve an appointment at the Registrar Releasing Window.
          </p>
        </div>
      </div>

      {/* Minimalist Stepper Navigation */}
      {currentPhase < 5 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { phase: 1, label: "Step 01", desc: "Policy & Privacy" },
            { phase: 2, label: "Step 02", desc: "Academic Identity" },
            { phase: 3, label: "Step 03", desc: "Documents & Rep" },
            { phase: 4, label: "Step 04", desc: "Slot Reservation" },
          ].map((s) => {
            const isActive = currentPhase === s.phase;
            const isDone = currentPhase > s.phase;
            return (
              <button
                key={s.phase}
                type="button"
                disabled={currentPhase < s.phase}
                onClick={() => setCurrentPhase(s.phase as any)}
                className={`p-3.5 rounded-xl border text-left transition flex items-center space-x-3 ${isActive
                    ? "border-primary bg-card text-foreground shadow-2xs"
                    : isDone
                      ? "border-border bg-card/80 text-foreground hover:bg-muted/40"
                      : "border-border/60 bg-muted/20 text-muted-foreground cursor-not-allowed opacity-60"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 border transition ${isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.phase}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">
                    {s.label}
                  </div>
                  <div className="text-xs font-semibold truncate mt-1">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 1: Policy & Privacy (Minimalist Consent) */}
      {/* ============================================================== */}
      {currentPhase === 1 && (
        <div className="space-y-6">
          <Card className="border border-border bg-card shadow-2xs overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg border border-border bg-background flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Registrar Requisition Guidelines & Data Privacy Notice
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Please review the university directives below before proceeding with your document request.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-sm text-foreground">
              <div className="grid grid-cols-1 gap-3">
                {/* Directive 1 */}
                <div className="p-4 rounded-lg border border-border bg-background/60 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                      01
                    </span>
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                      Accuracy of Information & Academic Integrity
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    Any misrepresentation, falsification of academic records, or forged signatures on clearances and authorizations constitutes an administrative offense under the PLMun Student Code of Conduct.
                  </p>
                </div>

                {/* Directive 2 */}
                <div className="p-4 rounded-lg border border-border bg-background/60 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                      02
                    </span>
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                      Confidentiality & Authorized Retrieval
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    Academic records are strictly confidential. No representative may claim another student&apos;s records without a signed authorization letter and valid government IDs presented at the Registrar Releasing Window.
                  </p>
                </div>

                {/* Directive 3 */}
                <div className="p-4 rounded-lg border border-border bg-background/60 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                      03
                    </span>
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                      Data Privacy Act Compliance (RA 10173)
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    In compliance with the Data Privacy Act of 2012, all personal and academic data gathered in this portal is processed exclusively by the Office of the University Registrar for credential verification and release tracking.
                  </p>
                </div>
              </div>

              {/* Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-3 cursor-pointer p-3.5 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition">
                  <input
                    type="checkbox"
                    checked={policyAccepted}
                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-primary focus:ring-ring"
                  />
                  <span className="text-xs text-foreground leading-relaxed">
                    I confirm that I am the owner of this student record (or an authorized representative) and agree to the PLMun Registrar Requisition Policies and Republic Act No. 10173.
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              disabled={!policyAccepted}
              onClick={() => setCurrentPhase(2)}
              className="px-6 font-semibold"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 2: Student Record (Academic Identity) */}
      {/* ============================================================== */}
      {currentPhase === 2 && (
        <div className="space-y-6">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/40 pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Academic Affiliation & Enrollment Record</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Verify that your enrolled degree program and contact details match your official Registrar files.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Student ID Number *
                  </label>
                  <Input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                  <span className="text-[11px] text-muted-foreground">Example: 2021-04981</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Full Legal Name *
                  </label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                  <span className="text-[11px] text-muted-foreground">As indicated on your PSA Birth Certificate</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    College & Academic Program *
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PLMUN_PROGRAMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Current Academic Level *
                  </label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                    <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                    <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                    <option value="4th Year (Senior)">4th Year (Senior)</option>
                    <option value="Graduated / Alumnus">Graduated / Alumnus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Institutional Email Address *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="text-[11px] text-muted-foreground">Official tracking updates are sent here</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Active Mobile Number *
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <span className="text-[11px] text-muted-foreground">For SMS gate pass verification</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Purpose of Request *
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {REQUEST_PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {purpose === "Other" && (
                  <Input
                    value={otherPurposeSpecify}
                    onChange={(e) => setOtherPurposeSpecify(e.target.value)}
                    placeholder="Please specify your purpose of request..."
                    className="mt-2 text-xs"
                    required
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setCurrentPhase(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back: Warning
            </Button>
            <Button
              disabled={!studentId || !studentName || !email}
              onClick={() => setCurrentPhase(3)}
              className="px-6 font-semibold"
            >
              <span>Next: Document & Rep</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 3: Document Type, Fees & Pickup Representative */}
      {/* ============================================================== */}
      {currentPhase === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Document selection */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                  <CardTitle className="text-base font-bold flex items-center space-x-2 text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Document Request Details</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Select the document you need, specify the quantity, and provide the purpose of your request.
                  </p>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Purpose of Request selector inside Document Request Details */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Purpose of Request *
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {REQUEST_PURPOSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {purpose === "Other" && (
                      <Input
                        value={otherPurposeSpecify}
                        onChange={(e) => setOtherPurposeSpecify(e.target.value)}
                        placeholder="Specify other purpose of request..."
                        className="text-xs"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
                      <span>Document Type</span>
                      <span>Quantity</span>
                    </div>
                    <div className="divide-y divide-border">
                      {catalog.map((doc) => {
                        const selected = selectedItems.find((i) => i.documentId === doc.id);
                        const qty = selected ? selected.quantity : 0;
                        const isOtherDoc = doc.id === "other-certificate";

                        return (
                          <div key={doc.id} className="py-3.5 space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-sm text-foreground">
                                    {doc.name}
                                  </span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {doc.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {doc.description}
                                </p>
                                <div className="text-xs font-semibold text-primary mt-1">
                                  ₱{doc.fee.toFixed(2)}{" "}
                                  {doc.feeUnit && (
                                    <span className="font-normal text-muted-foreground">
                                      {doc.feeUnit}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Stepper (+ / -) */}
                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(doc.id, -1)}
                                  disabled={qty === 0}
                                  className="w-8 h-8 rounded border border-border bg-secondary hover:bg-accent text-secondary-foreground font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-bold text-sm text-foreground">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(doc.id, 1)}
                                  className="w-8 h-8 rounded border border-border bg-secondary hover:bg-accent text-secondary-foreground font-bold flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {isOtherDoc && qty > 0 && (
                              <div className="pl-2 pt-1">
                                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                  Other certificate specify: *
                                </label>
                                <Input
                                  value={otherCertSpecify}
                                  onChange={(e) => setOtherCertSpecify(e.target.value)}
                                  placeholder="Enter specific certificate title or form needed..."
                                  className="h-8 text-xs"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Retrieval Authorization */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border bg-muted/40 pb-4">
                  <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <span>Document Retrieval Authorization</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Indicate whether you will claim personally or authorize a proxy.
                  </p>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setIsRep(false)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${!isRep
                          ? "border-primary bg-muted/40"
                          : "border-border bg-card hover:bg-muted/30"
                        }`}
                    >
                      <input
                        type="radio"
                        name="pickup_mode"
                        checked={!isRep}
                        onChange={() => setIsRep(false)}
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          Personal Pickup
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          I will personally claim the documents at the Registrar Releasing Window by presenting my PLMun Student ID.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setIsRep(true)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${isRep
                          ? "border-primary bg-muted/40"
                          : "border-border bg-card hover:bg-muted/30"
                        }`}
                    >
                      <input
                        type="radio"
                        name="pickup_mode"
                        checked={isRep}
                        onChange={() => setIsRep(true)}
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          Authorized Representative
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          A designated proxy will pick up the documents on my behalf.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Representative Details Form */}
                  {isRep && (
                    <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border space-y-4">
                      <div className="flex items-start space-x-2 text-xs text-foreground">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold">Proxy Release Protocol (Required at Counter):</strong>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Your representative must present: 1) Signed Authorization Letter with Student Signature, 2) Photocopy of Student&apos;s ID, and 3) Valid Government Photo ID.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Representative Full Name *
                          </label>
                          <Input
                            placeholder="e.g. Rodrigo Santos"
                            value={repName}
                            onChange={(e) => setRepName(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Relationship to Student *
                          </label>
                          <select
                            value={repRelationship}
                            onChange={(e) => setRepRelationship(e.target.value)}
                            className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="Parent (Mother / Father)">Parent (Mother / Father)</option>
                            <option value="Sibling (Brother / Sister)">Sibling (Brother / Sister)</option>
                            <option value="Legal Spouse">Legal Spouse</option>
                            <option value="Legal Guardian">Legal Guardian</option>
                            <option value="Classmate / Peer">Classmate / Peer</option>
                            <option value="Other Authorized Person">Other Authorized Person</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Government ID Presented *
                          </label>
                          <select
                            value={repIdType}
                            onChange={(e) => setRepIdType(e.target.value)}
                            className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="Driver's License (LTO)">Driver&apos;s License (LTO)</option>
                            <option value="Philippine Passport (DFA)">Philippine Passport (DFA)</option>
                            <option value="National ID (PhilSys)">National ID (PhilSys)</option>
                            <option value="UMID / SSS ID">UMID / SSS ID</option>
                            <option value="PRC Professional License">PRC Professional License</option>
                            <option value="Voter's ID / Comelec Certificate">Voter&apos;s ID / Comelec Certificate</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            ID Serial Number *
                          </label>
                          <Input
                            placeholder="e.g. N02-18-938210"
                            value={repIdNumber}
                            onChange={(e) => setRepIdNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Mock Upload Authorization Letter */}
                      <div className="pt-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Scanned Signed Authorization Letter & Student ID Copy
                        </label>
                        <div
                          onClick={() => setRepLetterUploaded(!repLetterUploaded)}
                          className={`p-4 rounded-lg border-2 border-dashed text-center cursor-pointer transition ${repLetterUploaded
                              ? "border-primary bg-primary/15 text-foreground"
                              : "border-border hover:border-primary/50 bg-background text-muted-foreground"
                            }`}
                        >
                          <Upload className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <div className="text-xs font-semibold">
                            {repLetterUploaded
                              ? "✓ Authorization Letter & ID attached (authorization_slip_signed.pdf)"
                              : "Click to upload / simulate attaching scanned authorization letter"}
                          </div>
                          <span className="text-[11px] text-muted-foreground">PDF, JPG, PNG up to 10MB</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right 4 cols: Cost Summary card */}
            <div className="lg:col-span-4">
              <Card className="border border-border bg-card shadow-sm sticky top-24">
                <CardHeader className="border-b border-border bg-muted/40 pb-4">
                  <CardTitle className="text-base text-foreground">
                    Requisition Fee Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {selectedItems.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No documents selected yet.
                    </div>
                  ) : (
                    <div className="space-y-2 divide-y divide-border text-xs">
                      {selectedItems.map((item) => (
                        <div key={item.documentId} className="pt-2 first:pt-0 flex justify-between">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-semibold text-foreground">
                            ₱{(item.fee * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}

                      <div className="pt-3 flex justify-between text-xs text-muted-foreground">
                        <span>Doc Stamp & Processing Fee</span>
                        <span>₱0.00 (Inclusive)</span>
                      </div>

                      <div className="pt-3 flex justify-between text-base font-bold text-foreground border-t border-border">
                        <span>Total Prescribed Fee</span>
                        <span className="text-primary">₱{totalFee.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-muted/60 rounded-lg border border-border text-[11px] text-muted-foreground space-y-1">
                    <p>• Official receipts issued by PLMun Cashier or Payment Gateway.</p>
                    <p>• Turnaround countdown begins upon verification of clearance.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setCurrentPhase(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back: Student Info
            </Button>
            <Button
              disabled={selectedItems.length === 0 || (isRep && !repName)}
              onClick={() => setCurrentPhase(4)}
              className="px-6 font-semibold"
            >
              <span>Next: Reserve Slot</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 4: Appointment Slot Reservation & Final Filing */}
      {/* ============================================================== */}
      {currentPhase === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Slot selection Left (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center space-x-2 text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Appointment Schedule Reservation</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select your preferred pickup date and 30-minute release time block.
                      </p>
                    </div>
                    <Badge variant="outline">Registrar Window</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Single Registrar Window notice banner */}
                  <div className="p-3.5 bg-muted/30 rounded-lg border border-border flex items-center space-x-3 text-xs">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <strong className="text-foreground font-semibold block">
                        Designated Counter: Registrar Releasing Window
                      </strong>
                      <span className="text-muted-foreground">
                        Ground Floor, Administration Building • Single service window for all academic credential releases.
                      </span>
                    </div>
                  </div>

                  {/* Date Picker Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Target Pickup Date (Mon–Fri Office Days)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { date: "2026-11-05", label: "Wed • Nov 5", slots: "8 slots" },
                        { date: "2026-11-06", label: "Thu • Nov 6", slots: "12 slots", recommended: true },
                        { date: "2026-11-07", label: "Fri • Nov 7", slots: "15 slots" },
                        { date: "2026-11-10", label: "Mon • Nov 10", slots: "20 slots" },
                      ].map((d) => (
                        <button
                          key={d.date}
                          type="button"
                          onClick={() => setSelectedDate(d.date)}
                          className={`p-3 rounded-lg border text-left transition relative ${selectedDate === d.date
                              ? "border-primary bg-muted/50"
                              : "border-border bg-card hover:bg-muted/30"
                            }`}
                        >
                          <div className="text-xs font-semibold text-foreground">{d.label}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{d.slots}</div>
                          {d.recommended && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-muted text-foreground border border-border font-medium text-[9px] rounded">
                              Recommended
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Morning Slots */}
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>Morning Session (08:00 AM – 12:00 PM)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { slot: "08:30 AM – 09:00 AM", left: "3 of 5 left" },
                        { slot: "09:00 AM – 09:30 AM", left: "4 of 5 left" },
                        { slot: "09:30 AM – 10:00 AM", left: "5 of 5 left" },
                        { slot: "10:30 AM – 11:00 AM", left: "2 of 5 left" },
                      ].map((s) => (
                        <button
                          key={s.slot}
                          type="button"
                          onClick={() => setSelectedSlot(s.slot)}
                          className={`p-2.5 rounded-lg border text-left transition ${selectedSlot === s.slot
                              ? "border-primary bg-primary text-primary-foreground shadow-2xs font-semibold"
                              : "border-border bg-card hover:bg-muted/50 text-foreground"
                            }`}
                        >
                          <div className="text-xs">{s.slot}</div>
                          <div
                            className={`text-[10px] ${selectedSlot === s.slot ? "opacity-80" : "text-muted-foreground"
                              }`}
                          >
                            {s.left}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>Afternoon Session (01:00 PM – 04:00 PM)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { slot: "01:00 PM – 01:30 PM", left: "4 of 5 left" },
                        { slot: "01:30 PM – 02:00 PM", left: "3 of 5 left" },
                        { slot: "02:00 PM – 02:30 PM", left: "FULL (0 of 5 left)", disabled: true },
                        { slot: "03:00 PM – 03:30 PM", left: "5 of 5 left" },
                      ].map((s) => (
                        <button
                          key={s.slot}
                          type="button"
                          disabled={s.disabled}
                          onClick={() => !s.disabled && setSelectedSlot(s.slot)}
                          className={`p-2.5 rounded-lg border text-left transition ${s.disabled
                              ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-60"
                              : selectedSlot === s.slot
                                ? "border-primary bg-primary text-primary-foreground shadow-2xs font-semibold"
                                : "border-border bg-card hover:bg-muted/50 text-foreground"
                            }`}
                        >
                          <div className="text-xs">{s.slot}</div>
                          <div
                            className={`text-[10px] ${selectedSlot === s.slot ? "opacity-80" : "text-muted-foreground"
                              }`}
                          >
                            {s.left}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Mode Selector */}
                  <div className="pt-2 border-t border-border">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Payment Settlement Method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setPaymentOption("PAID_ONLINE")}
                        className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-3 transition ${paymentOption === "PAID_ONLINE"
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border bg-card"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentOption === "PAID_ONLINE"}
                          onChange={() => setPaymentOption("PAID_ONLINE")}
                          className="accent-primary"
                        />
                        <div className="text-xs">
                          <strong className="text-foreground block">
                            Pay Online (GCash / Maya / Landbank)
                          </strong>
                          <span className="text-muted-foreground">
                            Instant electronic official receipt & gate pass
                          </span>
                        </div>
                      </label>

                      <label
                        onClick={() => setPaymentOption("PAY_AT_CASHIER")}
                        className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-3 transition ${paymentOption === "PAY_AT_CASHIER"
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border bg-card"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentOption === "PAY_AT_CASHIER"}
                          onChange={() => setPaymentOption("PAY_AT_CASHIER")}
                          className="accent-primary"
                        />
                        <div className="text-xs">
                          <strong className="text-foreground block">
                            Pay at PLMun Cashier Counter
                          </strong>
                          <span className="text-muted-foreground">
                            Present slip at Cashier before claiming at window
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 4 cols: Final Review & Confirmation */}
            <div className="lg:col-span-4">
              <Card className="border border-border bg-card shadow-sm sticky top-24 space-y-4">
                <CardHeader className="border-b border-border bg-muted/40 pb-4">
                  <CardTitle className="text-base text-foreground">
                    Application Review
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block uppercase tracking-wider text-[10px]">
                      Student Profile
                    </span>
                    <strong className="text-foreground text-sm block">{studentName}</strong>
                    <span className="text-muted-foreground">{studentId} • {program}</span>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block uppercase tracking-wider text-[10px]">
                      Pickup Schedule & Counter
                    </span>
                    <div className="font-semibold text-foreground text-sm mt-0.5">
                      {selectedDate}
                    </div>
                    <div className="text-primary font-medium">{selectedSlot}</div>
                    <Badge variant="outline" className="mt-1">
                      Registrar Window
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block uppercase tracking-wider text-[10px]">
                      Claimant Mode
                    </span>
                    <span className="font-semibold text-foreground">
                      {isRep ? `Proxy: ${repName} (${repRelationship})` : "Personal Claim (Student ID)"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold">
                    <span>Total Prescribed Fee</span>
                    <span className="text-primary text-base">₱{totalFee.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleFinalSubmit}
                    className="w-full font-bold py-3 mt-2 shadow"
                  >
                    Confirm & File Document Request
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center">
                    By clicking Confirm, an official tracking reference slip will be generated.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setCurrentPhase(3)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back: Documents
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 5: Minimalist Filing Confirmation Screen */}
      {/* ============================================================== */}
      {currentPhase === 5 && (
        <Card className="max-w-2xl mx-auto border border-border bg-card shadow-sm overflow-hidden animate-in fade-in-50 duration-300">
          <div className="border-b border-border bg-muted/20 p-6 text-center space-y-2">
            <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 rounded-full mx-auto flex items-center justify-center font-bold">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Document Request Filed
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your requisition has been recorded by the Office of the University Registrar. Your confirmation slip and QR pass are ready.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center p-4 rounded-xl bg-muted/30 border border-border">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                Tracking Reference Code
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground tracking-wider mt-0.5 block">
                {createdRequestId}
              </span>
              <div className="mt-2.5 flex items-center justify-center space-x-2">
                <Badge variant="secondary">Slot Confirmed</Badge>
                <Badge variant="outline">Registrar Window</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="text-muted-foreground block">Student Claimant</span>
                <strong className="text-foreground">{studentName}</strong>
                <span className="text-muted-foreground block text-[11px]">{studentId}</span>
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="text-muted-foreground block">Scheduled Counter Claim</span>
                <strong className="text-foreground">{selectedDate}</strong>
                <span className="text-primary block font-medium">{selectedSlot}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/portal" className="flex-1">
                <Button className="w-full font-semibold">
                  <QrCode className="w-4 h-4 mr-2" />
                  View Confirmation Slip & QR Pass
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Building className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RequestWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading Document Request Wizard...
        </div>
      }
    >
      <RequestWizardContent />
    </Suspense>
  );
}
