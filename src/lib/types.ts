export type RequestStatus =
  | "PENDING_REVIEW"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "CLAIMED"
  | "NO_SHOW"
  | "REJECTED";

export interface DocumentItem {
  id: string;
  name: string;
  category: "Certifications" | "Credentials" | "Diplomas";
  description: string;
  requirements: string[];
  processingDays: string;
  fee: number;
  feeUnit?: string;
  iconName: string;
}

export interface SelectedDocument {
  documentId: string;
  name: string;
  fee: number;
  quantity: number;
  notes?: string;
}

export interface RepresentativeInfo {
  isRepresentative: boolean;
  name?: string;
  relationship?: string;
  idType?: string;
  idNumber?: string;
  letterAttached?: boolean;
}

export interface AuditLog {
  timestamp: string;
  action: string;
  actor: string;
  note?: string;
}

export interface DocumentRequest {
  id: string; // e.g. "PLM-2026-08942"
  studentId: string; // "2021-04981"
  studentName: string;
  email: string;
  phone: string;
  program: string;
  yearLevel: string;
  purpose: string;
  items: SelectedDocument[];
  totalFee: number;
  paymentStatus: "PAID_ONLINE" | "PAY_AT_CASHIER" | "WAIVED";
  representative: RepresentativeInfo;
  appointmentDate: string; // "2026-11-06"
  appointmentSlot: string; // "09:00 AM – 09:30 AM"
  windowNumber: string; // "Window 03"
  status: RequestStatus;
  createdAt: string;
  auditTrail: AuditLog[];
  remarks?: string;
  deficiencyReason?: string;
}

