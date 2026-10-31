"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PLMUN_PROGRAMS } from "@/lib/data";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Shield,
  Home,
  ClipboardList,
  Settings,
  LogOut,
  UserPen,
  SlidersHorizontal,
  Sun,
  Moon,
  ChevronDown,
  X,
  Check,
  Bell,
  Lock,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentStudent,
    setCurrentStudent,
    requests,
    userRole,
    logoutUser,
  } = useStore();
  const { theme, setTheme } = useTheme();

  // Avatar Dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Edit Profile Form state
  const [editName, setEditName] = useState(currentStudent.name);
  const [editId, setEditId] = useState(currentStudent.id);
  const [editEmail, setEditEmail] = useState(currentStudent.email);
  const [editProgram, setEditProgram] = useState(
    currentStudent.program || PLMUN_PROGRAMS[0]
  );

  // Settings Modal state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Sync Edit Profile state when currentStudent changes
  useEffect(() => {
    setEditName(currentStudent.name);
    setEditId(currentStudent.id);
    setEditEmail(currentStudent.email);
    setEditProgram(currentStudent.program || PLMUN_PROGRAMS[0]);
  }, [currentStudent]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const readyCount = requests.filter(
    (r) => r.status === "READY_FOR_PICKUP"
  ).length;

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    description: string;
  }

  const studentNavItems: NavItem[] = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      description: "Document Catalog & Account Sign-In",
    },
    {
      name: "Request",
      href: "/request",
      icon: FileText,
      description: "4-Phase Application & Appointment",
    },
    {
      name: "View Requests",
      href: "/portal",
      icon: ClipboardList,
      description: "Confirmation Slip & Tracking",
    },
  ];

  const staffNavItems: NavItem[] = [
    {
      name: "Staff Desk",
      href: "/staff",
      icon: Shield,
      badge: readyCount > 0 ? `${readyCount} Ready` : undefined,
      description: "Registrar Operations & Counter Release",
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      name: "Admin Portal",
      href: "/admin",
      icon: Settings,
      description: "Registrar System Administration & Analytics",
    },
    {
      name: "Staff Desk",
      href: "/staff",
      icon: Shield,
      badge: readyCount > 0 ? `${readyCount} Ready` : undefined,
      description: "Registrar Operations & Counter Release",
    },
  ];

  const guestNavItems: NavItem[] = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      description: "Document Catalog & Account Sign-In",
    },
  ];

  const navItems =
    userRole === "ADMIN"
      ? adminNavItems
      : userRole === "STAFF"
      ? staffNavItems
      : userRole === "STUDENT"
      ? studentNavItems
      : guestNavItems;

  const displayName =
    userRole === "ADMIN"
      ? "Dr. Elena R. Villanueva"
      : userRole === "STAFF"
      ? "Marco A. Reyes"
      : currentStudent.name;

  const displaySub =
    userRole === "ADMIN"
      ? "University Registrar (Admin)"
      : userRole === "STAFF"
      ? "Releasing Officer (Staff)"
      : currentStudent.id;

  const displayEmail =
    userRole === "ADMIN"
      ? "admin@plmun.edu.ph"
      : userRole === "STAFF"
      ? "staff@plmun.edu.ph"
      : currentStudent.email;

  const initials = displayName
    .split(" ")
    .filter((part) => !part.includes("."))
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStudent({
      name: editName.trim() || currentStudent.name,
      id: editId.trim() || currentStudent.id,
      email: editEmail.trim() || currentStudent.email,
      program: editProgram,
    });
    setIsEditProfileOpen(false);
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    logoutUser();
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md text-card-foreground shadow-2xs transition-colors print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand with Official PLMun Seal */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-11 h-11 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src="/plmun-logo.png"
                  alt="Pamantasan ng Lungsod ng Muntinlupa Official Seal"
                  width={44}
                  height={44}
                  className="object-contain drop-shadow-2xs"
                  priority
                />
              </div>
              <div>
                <div className="font-bold text-base tracking-tight text-foreground leading-tight flex items-center gap-1.5">
                  Pamantasan ng Lungsod ng Muntinlupa
                  <span className="text-[10px] bg-secondary text-secondary-foreground border border-border px-1.5 py-0.5 rounded font-semibold">
                    Registrar
                  </span>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Official Student Document Request & Scheduling System
                </p>
              </div>
            </Link>

            {/* Right: Navigation Links + shadcn Profile Avatar Dropdown */}
            <div className="flex items-center space-x-2">
              <nav className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                          : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-primary-foreground" : "text-primary"
                        )}
                      />
                      <span className="hidden md:inline">{item.name}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full border",
                            isActive
                              ? "bg-background text-foreground border-border"
                              : "bg-primary/20 text-foreground border-primary/30"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Theme Toggle + Profile Avatar Dropdown Trigger (or Sign In when logged out) */}
              <div className="flex items-center space-x-2 border-l border-border pl-3 ml-1" ref={dropdownRef}>
                <ThemeToggle />
                {userRole ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className="flex items-center space-x-2.5 p-1 pr-2.5 rounded-full border border-border bg-background hover:bg-muted/70 transition focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-expanded={menuOpen}
                      aria-label="Open user profile menu"
                    >
                      <Avatar className="h-8 w-8 border-primary/30">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-extrabold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left leading-tight">
                        <div className="text-xs font-bold text-foreground max-w-[125px] truncate">
                          {displayName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {displaySub}
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-muted-foreground transition-transform duration-150",
                          menuOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Dropdown Menu Popover */}
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-border flex items-start space-x-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-extrabold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-foreground truncate">
                                {displayName}
                              </p>
                              <Badge variant="approved" className="text-[9px] px-1.5 py-0">
                                {userRole}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              {displaySub}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {displayEmail}
                            </p>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1.5 px-1.5 space-y-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              setIsEditProfileOpen(true);
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition text-left font-medium"
                          >
                            <UserPen className="w-4 h-4 text-primary shrink-0" />
                            <span>Edit Profile</span>
                          </button>

                          {userRole === "STUDENT" && (
                            <Link
                              href="/portal"
                              onClick={() => setMenuOpen(false)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-foreground hover:bg-muted transition font-medium"
                            >
                              <div className="flex items-center space-x-2.5">
                                <ClipboardList className="w-4 h-4 text-primary shrink-0" />
                                <span>My Requests & QR Slip</span>
                              </div>
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/15 text-primary">
                                {requests.length}
                              </span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              setIsSettingsOpen(true);
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition text-left font-medium"
                          >
                            <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" />
                            <span>Settings & Notifications</span>
                          </button>
                        </div>

                        {/* Light & Dark Mode Selector inside Dropdown */}
                        <div className="px-3 py-2.5 border-t border-border">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 px-1">
                            Appearance Theme
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
                            <button
                              type="button"
                              onClick={(e) => setTheme("light", e)}
                              className={cn(
                                "flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition",
                                theme === "light"
                                  ? "bg-card text-foreground shadow-2xs border border-border"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Sun className="w-3.5 h-3.5 text-primary" />
                              <span>Light</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => setTheme("dark", e)}
                              className={cn(
                                "flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition",
                                theme === "dark"
                                  ? "bg-card text-foreground shadow-2xs border border-border"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Moon className="w-3.5 h-3.5 text-primary" />
                              <span>Dark</span>
                            </button>
                          </div>
                        </div>

                        {/* Sign Out */}
                        <div className="pt-1.5 px-1.5 border-t border-border">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/15 transition text-left"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/#login-card">
                    <Button size="sm" variant="outline" className="h-9 text-xs font-semibold">
                      <LogIn className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MODAL 1: EDIT PROFILE */}
      {/* ============================================================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPen className="w-5 h-5" />
                <h3 className="font-bold text-base">Edit Profile Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="opacity-80 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <CardContent className="p-6 space-y-4 text-xs">
                <div className="flex items-center space-x-3 pb-2 border-b border-border">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-base font-extrabold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {editName || currentStudent.name}
                    </div>
                    <div className="text-muted-foreground">
                      PLMun Official Portal Identity
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Full Legal Name
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Student / Account ID Number
                  </label>
                  <Input
                    value={editId}
                    onChange={(e) => setEditId(e.target.value)}
                    className="font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    University Email Address
                  </label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Academic Degree Program
                  </label>
                  <select
                    value={editProgram}
                    onChange={(e) => setEditProgram(e.target.value)}
                    className="w-full h-9 text-xs border border-input rounded-md px-3 bg-background text-foreground"
                  >
                    {PLMUN_PROGRAMS.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditProfileOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Check className="w-4 h-4 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ACCOUNT & NOTIFICATION SETTINGS */}
      {/* ============================================================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5" />
                <h3 className="font-bold text-base">Account Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="opacity-80 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CardContent className="p-6 space-y-5 text-xs">
              <div className="space-y-3">
                <div className="font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                  <span>Release & Appointment Notifications</span>
                </div>

                <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40 cursor-pointer">
                  <div>
                    <div className="font-semibold text-foreground">
                      University WebMail Alerts
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Receive email when credentials are placed in the Counter Bin
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40 cursor-pointer">
                  <div>
                    <div className="font-semibold text-foreground">
                      SMS Appointment Reminders
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Receive SMS reminder 2 hours before your Registrar Window slot
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </label>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <div className="font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Security & Appearance</span>
                </div>

                <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40 cursor-pointer">
                  <div>
                    <div className="font-semibold text-foreground">
                      Two-Step Verification (OTP)
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Require OTP verification when authorizing a proxy claimant
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </label>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
                  <div>
                    <div className="font-semibold text-foreground">
                      Interface Theme
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Switch between Light and Dark mode
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-card p-1 rounded-md border border-border">
                    <button
                      type="button"
                      onClick={(e) => setTheme("light", e)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-semibold transition",
                        theme === "light"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={(e) => setTheme("dark", e)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-semibold transition",
                        theme === "dark"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button onClick={() => setIsSettingsOpen(false)}>Done</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
