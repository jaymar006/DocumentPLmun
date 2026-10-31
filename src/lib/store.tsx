"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DocumentItem, DocumentRequest, RequestStatus } from "./types";
import { DOCUMENT_CATALOG, INITIAL_REQUESTS } from "./data";

export type UserRole = "STUDENT" | "STAFF" | "ADMIN" | null;

export interface WindowSettings {
  maxCapacityPerSlot: number;
  isWindowOpen: boolean;
  cutoffTime: string;
  allowProxyClaim: boolean;
}

interface StoreContextType {
  requests: DocumentRequest[];
  selectedRequest: DocumentRequest | null;
  setSelectedRequestId: (id: string) => void;
  addRequest: (newReq: Omit<DocumentRequest, "id" | "createdAt" | "auditTrail">) => DocumentRequest;
  updateRequestStatus: (
    id: string,
    status: RequestStatus,
    actor: string,
    note?: string,
    deficiencyReason?: string
  ) => void;
  updatePaymentStatus: (
    id: string,
    paymentStatus: "PAID_ONLINE" | "PAY_AT_CASHIER" | "WAIVED",
    actor: string
  ) => void;
  deleteRequest: (id: string) => void;
  rescheduleRequest: (id: string, newDate: string, newSlot: string) => void;
  catalog: DocumentItem[];
  updateCatalogItem: (item: DocumentItem) => void;
  addCatalogItem: (item: DocumentItem) => void;
  deleteCatalogItem: (id: string) => void;
  windowSettings: WindowSettings;
  updateWindowSettings: (settings: Partial<WindowSettings>) => void;
  resetDemoData: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  authenticateUser: (identifier: string) => Exclude<UserRole, null>;
  logoutUser: () => void;
  currentStudent: {
    id: string;
    name: string;
    email: string;
    program: string;
  };
  setCurrentStudent: (student: { id: string; name: string; email: string; program: string }) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = "plmun_document_requests_v2";
const CATALOG_STORAGE_KEY = "plmun_document_catalog_v3";
const SETTINGS_STORAGE_KEY = "plmun_window_settings_v2";
const ROLE_STORAGE_KEY = "plmun_user_role_v3";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<DocumentRequest[]>(INITIAL_REQUESTS);
  const [catalog, setCatalog] = useState<DocumentItem[]>(DOCUMENT_CATALOG);
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [windowSettings, setWindowSettings] = useState<WindowSettings>({
    maxCapacityPerSlot: 20,
    isWindowOpen: true,
    cutoffTime: "04:30 PM",
    allowProxyClaim: true,
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string>("PLM-2026-08942");
  const [currentStudent, setCurrentStudent] = useState({
    id: "2021-04981",
    name: "Maria Clara Santos",
    email: "maria.santos@plmun.edu.ph",
    program: "BS Information Technology (BSIT)",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRequests(parsed);
        }
      }
      const savedCatalog = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (savedCatalog) {
        const parsedCatalog = JSON.parse(savedCatalog);
        if (Array.isArray(parsedCatalog) && parsedCatalog.length > 0) {
          setCatalog(parsedCatalog);
        }
      }
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setWindowSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
      const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
      if (savedRole === "STUDENT" || savedRole === "STAFF" || savedRole === "ADMIN") {
        setUserRoleState(savedRole);
      } else {
        setUserRoleState(null);
      }
    } catch {
      // ignore
    }
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      if (role === null) {
        localStorage.removeItem(ROLE_STORAGE_KEY);
      } else {
        localStorage.setItem(ROLE_STORAGE_KEY, role);
      }
    } catch {
      // ignore
    }
  };

  const authenticateUser = (identifier: string): Exclude<UserRole, null> => {
    const clean = identifier.trim().toLowerCase();
    if (
      clean === "admin" ||
      clean === "admin@plmun.edu.ph" ||
      clean === "adm-01" ||
      clean.startsWith("admin")
    ) {
      setUserRole("ADMIN");
      return "ADMIN";
    }
    if (
      clean === "staff" ||
      clean === "staff@plmun.edu.ph" ||
      clean === "registrar" ||
      clean === "registrar@plmun.edu.ph" ||
      clean === "stf-01" ||
      clean.startsWith("staff") ||
      clean.startsWith("stf-")
    ) {
      setUserRole("STAFF");
      return "STAFF";
    }

    // Default to Student
    setUserRole("STUDENT");
    if (clean === "2022-10422" || clean.includes("juan")) {
      setCurrentStudent({
        id: "2022-10422",
        name: "Juan Miguel Dela Cruz",
        email: "juan.delacruz@plmun.edu.ph",
        program: "BS Computer Science (BSCS)",
      });
    } else if (clean === "2021-04981" || clean.includes("maria")) {
      setCurrentStudent({
        id: "2021-04981",
        name: "Maria Clara Santos",
        email: "maria.santos@plmun.edu.ph",
        program: "BS Information Technology (BSIT)",
      });
    } else {
      setCurrentStudent({
        id: identifier.trim(),
        name: "PLMun Student",
        email: clean.includes("@") ? clean : `${clean}@plmun.edu.ph`,
        program: "BS Information Technology (BSIT)",
      });
    }
    return "STUDENT";
  };

  const logoutUser = () => {
    setUserRole(null);
  };

  const saveRequests = (updated: DocumentRequest[]) => {
    setRequests(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const saveCatalog = (updated: DocumentItem[]) => {
    setCatalog(updated);
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const updateWindowSettings = (partial: Partial<WindowSettings>) => {
    const updated = { ...windowSettings, ...partial };
    setWindowSettings(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const updateCatalogItem = (item: DocumentItem) => {
    const updated = catalog.map((c) => (c.id === item.id ? item : c));
    saveCatalog(updated);
  };

  const addCatalogItem = (item: DocumentItem) => {
    saveCatalog([...catalog, item]);
  };

  const deleteCatalogItem = (id: string) => {
    saveCatalog(catalog.filter((c) => c.id !== id));
  };

  const updatePaymentStatus = (
    id: string,
    paymentStatus: "PAID_ONLINE" | "PAY_AT_CASHIER" | "WAIVED",
    actor: string
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updated = requests.map((req) => {
      if (req.id !== id) return req;
      return {
        ...req,
        paymentStatus,
        auditTrail: [
          ...req.auditTrail,
          {
            timestamp: dateStr,
            action: `Payment Status Updated to ${paymentStatus.replace(/_/g, " ")}`,
            actor,
          },
        ],
      };
    });
    saveRequests(updated);
  };

  const deleteRequest = (id: string) => {
    const updated = requests.filter((req) => req.id !== id);
    saveRequests(updated);
  };

  const resetDemoData = () => {
    saveRequests(INITIAL_REQUESTS);
    saveCatalog(DOCUMENT_CATALOG);
    updateWindowSettings({
      maxCapacityPerSlot: 20,
      isWindowOpen: true,
      cutoffTime: "04:30 PM",
      allowProxyClaim: true,
    });
  };

  const addRequest = (
    newReq: Omit<DocumentRequest, "id" | "createdAt" | "auditTrail">
  ): DocumentRequest => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const id = `PLM-2026-0${randomSeq}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const fullRequest: DocumentRequest = {
      ...newReq,
      id,
      windowNumber: "Registrar Window",
      createdAt: dateStr,
      auditTrail: [
        {
          timestamp: dateStr,
          action: "Request Filed Online via Student Portal",
          actor: `${newReq.studentName} (${newReq.studentId})`,
          note: "Designated: Registrar Releasing Window",
        },
      ],
    };

    const updated = [fullRequest, ...requests];
    saveRequests(updated);
    setSelectedRequestId(id);
    return fullRequest;
  };

  const updateRequestStatus = (
    id: string,
    status: RequestStatus,
    actor: string,
    note?: string,
    deficiencyReason?: string
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const actionTextMap: Record<RequestStatus, string> = {
      PENDING_REVIEW: "Marked Under Review",
      PROCESSING: "Forwarded to Document Printing & Dry-Seal Stamping",
      READY_FOR_PICKUP: "Dispatched to Counter Bin (Ready for Release)",
      CLAIMED: "Document Released & Claimed at Counter",
      NO_SHOW: "Appointment Slot Passed - Tagged as No-Show",
      REJECTED: "Disapproved / Deficiency Notice Issued",
    };

    const updated = requests.map((req) => {
      if (req.id !== id) return req;
      const updatedReq: DocumentRequest = {
        ...req,
        status,
        remarks: note || req.remarks,
        deficiencyReason: deficiencyReason || req.deficiencyReason,
        auditTrail: [
          ...req.auditTrail,
          {
            timestamp: dateStr,
            action: actionTextMap[status] || `Status updated to ${status}`,
            actor,
            note: deficiencyReason ? `Reason: ${deficiencyReason}. Note: ${note}` : note,
          },
        ],
      };
      return updatedReq;
    });

    saveRequests(updated);
  };

  const rescheduleRequest = (id: string, newDate: string, newSlot: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updated = requests.map((req) => {
      if (req.id !== id) return req;
      return {
        ...req,
        appointmentDate: newDate,
        appointmentSlot: newSlot,
        status: "PROCESSING" as RequestStatus,
        auditTrail: [
          ...req.auditTrail,
          {
            timestamp: dateStr,
            action: "Pickup Slot Rescheduled",
            actor: req.studentName,
            note: `New Schedule: ${newDate} at ${newSlot}`,
          },
        ],
      };
    });

    saveRequests(updated);
  };

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0] || null;

  return (
    <StoreContext.Provider
      value={{
        requests,
        selectedRequest,
        setSelectedRequestId,
        addRequest,
        updateRequestStatus,
        updatePaymentStatus,
        deleteRequest,
        rescheduleRequest,
        catalog,
        updateCatalogItem,
        addCatalogItem,
        deleteCatalogItem,
        windowSettings,
        updateWindowSettings,
        resetDemoData,
        userRole,
        setUserRole,
        authenticateUser,
        logoutUser,
        currentStudent,
        setCurrentStudent,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return ctx;
}
