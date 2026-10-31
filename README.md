# Pamantasan ng Lungsod ng Muntinlupa (PLMun) - Registrar Portal

Official Student Document Request & Claim Scheduling Web Application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**, directly generated from Stitch Project `11842955892595709652`.

---

## 🎨 Theme & Architecture Updates

- **🌗 Full Dark Mode & Light Mode**:
  - Seamless theme toggle (Sun / Moon) integrated directly into the navigation header.
  - Custom React ThemeProvider with persistent preference storage in `localStorage` and system preference detection.
  - Complete dark styling across cards, tables, inputs, badges, and confirmation slips.
- **🏛️ Single Registrar Releasing Window**:
  - Simplified from multiple simulated windows into PLMun's actual structure: **1 Designated Registrar Releasing Counter** (Ground Floor, Administration Building).
  - All requisitions, appointments, and staff queue operations are consolidated into this single service counter.

---

## 🏛️ Application Screens & Workflows

### 1. 🌐 Public Landing & Student Auth (`/`)
- Branded hero in PLMun emerald (`#0F5132`) & amber gold (`#D97706`).
- Interactive student sign-in / registration card with quick profile switcher (`Maria Clara Santos - 2021-04981`).
- Document catalog with search, category filtering, turnaround times, and direct "Request" links.

### 2. 📋 4-Step Document Request & Claim Scheduling Wizard (`/request`)
- **Phase 01**: Policy & RA 10173 Data Privacy Act consent.
- **Phase 02**: Student enrollment & academic record identity.
- **Phase 03**: Document selection with quantity steppers (`+` / `-`), personal claim vs. proxy representative form, and authorization letter attachment preview.
- **Phase 04**: Appointment date and time slot reservation for the single Registrar Releasing Window.
- **Phase 05**: Official reference confirmation notice with tracking code.

### 3. 🎓 Student Portal & Official Confirmation Slip (`/portal`)
- Printable official confirmation slip with Fast-Counter QR code, barcode, and document fee details.
- Live appointment rescheduling modal that updates counter capacity and audit logs in real time.
- Processing audit trail timeline (Online Filing → Clearances Verified → Dry-Sealed → Bin Dispatched → Claimed).

### 4. 🏢 Registrar Staff Workspace (`/staff`)
- Registrar Releasing Window queue dashboard.
- Express Claimant Lookup with reference search and optical barcode simulation.
- Claimant inspection panel with verification checklist and proxy letter preview modal.
- Document Requisition Register with tabs (`All Queued`, `Today's Pickups`, `In Process`, `Needs Review`, `No-Show`).
- Single Window hourly appointment capacity grid.

---

## 🚀 Getting Started

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
