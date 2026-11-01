"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PLMUN_PROGRAMS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  LogIn,
  UserPlus,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalRedirectUrl,
    authenticateUser,
    setCurrentStudent,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regId, setRegId] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regProgram, setRegProgram] = useState(PLMUN_PROGRAMS[0]);
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) return;

    const role = authenticateUser(loginId.trim());
    setIsAuthModalOpen(false);

    if (role === "ADMIN") {
      router.push("/admin");
    } else if (role === "STAFF") {
      router.push("/staff");
    } else {
      router.push(authModalRedirectUrl || "/portal");
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
      setIsAuthModalOpen(false);
      router.push(authModalRedirectUrl || "/request");
    }
  };

  const handleQuickFill = (id: string, pass: string) => {
    setLoginId(id);
    setLoginPassword(pass);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsAuthModalOpen(false);
        }
      }}
    >
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="border-b border-border bg-muted/40 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/plmun-logo.png"
                alt="PLMun Seal"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-tight">
                PLMun Registrar Portal
              </h3>
              <p className="text-xs text-muted-foreground">
                Document Requests & Appointments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-border bg-muted/20">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition ${
              activeTab === "login"
                ? "border-primary bg-card text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border-b-2 transition ${
              activeTab === "register"
                ? "border-primary bg-card text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Student</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Student ID or Account ID
                </label>
                <Input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 2021-04981, staff, or admin"
                  required
                  autoFocus
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Please visit the Registrar Office Room 101 or email registrar@plmun.edu.ph for credential recovery."
                      )
                    }
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="h-10 text-sm pr-10"
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
                    className="rounded accent-primary"
                  />
                  <span>Remember me</span>
                </label>
                <span className="flex items-center space-x-1 text-[11px] text-primary">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure Session</span>
                </span>
              </div>

              <Button type="submit" className="w-full h-10 font-semibold mt-2">
                <span>Sign In & Continue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              {/* Quick Demo Credentials */}
              <div className="mt-5 pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Demo Accounts:
                  </span>
                  <span>Click to auto-fill</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("2021-04981", "plmun2026")}
                    className="px-2 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 text-foreground font-semibold transition text-center"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickFill("staff@plmun.edu.ph", "plmun2026")
                    }
                    className="px-2 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 text-foreground font-semibold transition text-center"
                  >
                    Staff Desk
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickFill("admin@plmun.edu.ph", "plmun2026")
                    }
                    className="px-2 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 text-foreground font-semibold transition text-center"
                  >
                    Registrar
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Full Legal Name *
                </label>
                <Input
                  type="text"
                  placeholder="Last Name, First Name, Middle Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="h-9"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Student ID Number *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 2026-00123"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  required
                  className="h-9"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Academic Degree Program *
                </label>
                <select
                  value={regProgram}
                  onChange={(e) => setRegProgram(e.target.value)}
                  className="w-full text-xs border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PLMUN_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  PLMun Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="student@plmun.edu.ph"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Password"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (regError) setRegError("");
                      }}
                      required
                      className="h-9 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Confirm *
                  </label>
                  <Input
                    type="password"
                    placeholder="Repeat"
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      if (regError) setRegError("");
                    }}
                    required
                    className="h-9"
                  />
                </div>
              </div>

              {regError && (
                <p className="text-[11px] text-destructive font-medium">
                  {regError}
                </p>
              )}

              <Button type="submit" className="w-full h-10 font-semibold mt-2">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Create Account & Proceed
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
