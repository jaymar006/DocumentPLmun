"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Clock,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Scroll,
  BookOpen,
} from "lucide-react";

export default function PublicLandingPage() {
  const router = useRouter();
  const { catalog, userRole, currentStudent, openAuthModal } = useStore();

  // Catalog filters & search
  const [catalogFilter, setCatalogFilter] = useState<
    "All" | "Certifications" | "Credentials" | "Diplomas"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const handleProtectedAction = (targetUrl: string) => {
    if (userRole) {
      router.push(targetUrl);
    } else {
      openAuthModal(targetUrl);
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

  const getDocIcon = (category: string) => {
    switch (category) {
      case "Diplomas":
        return <Scroll className="w-5 h-5 text-primary shrink-0" />;
      case "Credentials":
        return <Award className="w-5 h-5 text-primary shrink-0" />;
      default:
        return <FileText className="w-5 h-5 text-primary shrink-0" />;
    }
  };

  return (
    <div className="space-y-16 py-10 sm:py-16">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Minimalist, Centered, Breathable) */}
      {/* ============================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* University Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Pamantasan ng Lungsod ng Muntinlupa • Office of the Registrar</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Official Student Document Requests,{" "}
          <span className="text-primary">Fast & Scheduled.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Order transcripts, certifications, and diplomas online. Track real-time
          verification and claim dry-sealed credentials with zero queue wait
          at your reserved counter slot.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => handleProtectedAction("/request")}
            className="w-full sm:w-auto font-semibold shadow-sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Request Document
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleProtectedAction("/portal")}
            className="w-full sm:w-auto font-semibold"
          >
            <CalendarCheck className="w-4 h-4 mr-2 text-primary" />
            Track Request & QR Slip
          </Button>
        </div>

        {/* Authentication Context Link / Active Session Chip */}
        <div className="pt-2 text-xs">
          {userRole ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/60 border border-border text-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>
                Signed in as{" "}
                <strong className="font-semibold">
                  {userRole === "ADMIN"
                    ? "University Registrar"
                    : userRole === "STAFF"
                    ? "Registrar Staff"
                    : currentStudent.name}
                </strong>{" "}
                ({userRole})
              </span>
              <span className="text-muted-foreground">•</span>
              <Link
                href={
                  userRole === "ADMIN"
                    ? "/admin"
                    : userRole === "STAFF"
                    ? "/staff"
                    : "/portal"
                }
                className="text-primary font-bold hover:underline"
              >
                Go to Workspace →
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Already have an active request?{" "}
              <button
                type="button"
                onClick={() => openAuthModal("/portal")}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Sign in to view status & QR pass →
              </button>
            </p>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. HOW IT WORKS (Minimal 3-Step Overview) */}
      {/* ============================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-border/80 rounded-2xl bg-card/60 backdrop-blur-xs p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              Simple 3-Step Process
            </h2>
            <p className="text-xs text-muted-foreground">
              Avoid campus queues with digital evaluation and designated window pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                1. Select Document
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose required transcripts, certifications, or diplomas from the catalog.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                2. Clearance & Verification
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated academic record assessment and instant cashier fee calculation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base shadow-2xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                3. Scheduled Pickup
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reserve your counter time slot and present your QR slip for immediate claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. DOCUMENT CATALOG (Clean, Modern Cards) */}
      {/* ============================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Catalog Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Document Catalog
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Browse available credentials, processing turnaround times, and prescribed fees.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search document name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(["All", "Certifications", "Credentials", "Diplomas"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatalogFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    catalogFilter === cat
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredDocs.length} {filteredDocs.length === 1 ? "record" : "records"} available
          </span>
        </div>

        {/* Minimalist Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isExpanded = expandedDocId === doc.id;
            return (
              <div
                key={doc.id}
                className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-primary/40 hover:shadow-xs transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top row: Icon + Category Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getDocIcon(doc.category)}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {doc.category}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm text-foreground leading-snug">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  {/* Requirements Toggle */}
                  {doc.requirements && doc.requirements.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDocId(isExpanded ? null : doc.id)
                        }
                        className="inline-flex items-center text-[11px] font-medium text-muted-foreground hover:text-foreground transition gap-1"
                      >
                        <span>Prerequisites ({doc.requirements.length})</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 rounded-lg bg-muted/50 border border-border text-[11px] text-muted-foreground space-y-1 animate-in fade-in duration-150">
                          <strong className="block text-foreground font-semibold">
                            Filing Requirements:
                          </strong>
                          <ul className="list-disc list-inside space-y-0.5">
                            {doc.requirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Metadata & Request Action */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{doc.processingDays}</span>
                    </div>
                    <div className="text-sm font-extrabold text-foreground mt-0.5">
                      ₱{doc.fee.toFixed(2)}
                      {doc.feeUnit && (
                        <span className="text-[10px] font-normal text-muted-foreground ml-1">
                          {doc.feeUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() =>
                      handleProtectedAction(`/request?doc=${doc.id}`)
                    }
                    className="h-8 text-xs font-semibold"
                  >
                    Request
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl space-y-2">
            <p className="text-sm font-semibold text-foreground">
              No matching documents found
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query or selecting a different category.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCatalogFilter("All");
              }}
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 4. DATA PRIVACY & COMPLIANCE FOOTNOTE */}
      {/* ============================================================== */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            Protected under Republic Act 10173 (Data Privacy Act of 2012). Official student record system of Pamantasan ng Lungsod ng Muntinlupa.
          </span>
        </p>
      </section>
    </div>
  );
}
