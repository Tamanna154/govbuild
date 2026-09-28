# GovBuild360 — Government Building Asset Lifecycle, Dependency & Risk-Based Maintenance Management System

> **Prototype / Demonstration System**  
> Inspired by the domain responsibilities of the **Roads & Buildings (R&B) Department, Government of Gujarat**.

---

## 🏛️ Project Overview & Problem Statement

Government departments manage hundreds of public buildings—Secretariats, Collectorates, Hospitals, High Courts, Guest Houses, Colleges, and Infrastructure Facilities. Inside these buildings exist critical physical, electrical, and mechanical assets:
- Generators & Automatic Transfer Switches (ATS)
- Electrical Transformers & Switchgear
- Central HVAC Systems & Chillers
- Passenger & Freight Elevators (Lifts)
- Water Supply & Hydro-Pneumatic Pumps
- Fire Safety Hydrants & Smoke Detectors
- Solar Energy Power Grids
- CCTV & Access Control Systems

In traditional manual workflows, asset records become fragmented. Scheduled maintenance relies on fixed calendar dates, ignoring actual machine degradation, telemetry anomalies, or critical infrastructure dependencies.

**GovBuild360** creates a centralized digital registry that tracks buildings, physical machinery, warranties, AMCs, dynamic health scores, risk escalation trends, dependency impact graphs, and dynamic work order prioritization.

---

## 💡 Core Innovation

Instead of relying solely on fixed calendar dates for maintenance:

$$\text{Actual Asset Health} + \text{Risk Score} + \text{Dependency Criticality} \longrightarrow \text{Dynamic Maintenance Priority}$$

### The Core Paradigm Shift
- **Traditional Maintenance**: Calendar Date $\rightarrow$ Maintenance (regardless of condition).
- **GovBuild360**: Sensor Data + Inspection + Health Score + Failure History + Age + Dependency Criticality $\rightarrow$ Risk $\rightarrow$ Dynamic Maintenance Priority $\rightarrow$ Work Order $\rightarrow$ Post-Repair Risk Mitigation $\rightarrow$ Historical Audit Log.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, Tailwind CSS, Lucide React Icons, Recharts, React Flow (`@xyflow/react`), Leaflet (`leaflet` & `react-leaflet`), QRCode.
- **Backend**: Node.js, Express.js, TypeScript, REST API, JWT Authentication, bcrypt password hashing, Zod validation, Prisma ORM, Node-cron.
- **Database**: PostgreSQL / SQLite via Prisma ORM with full relational integrity, foreign keys, indexes, and non-destructive history tracking tables.

---

## 👥 Demo User Accounts & Roles

| Role | Demo Email | Password | Designation |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@rnb.gujarat.gov.in` | `admin123` | Chief Engineer & Technical Secretary |
| **Dept Admin** | `dept.admin@rnb.gujarat.gov.in` | `admin123` | Superintending Engineer (E&M) |
| **Engineer** | `engineer@rnb.gujarat.gov.in` | `admin123` | Executive Engineer (Mechanical) |
| **Inspector** | `inspector@rnb.gujarat.gov.in` | `admin123` | Senior Quality Inspector |
| **Technician** | `technician@rnb.gujarat.gov.in` | `admin123` | Senior Electrical Technician |
| **Viewer** | `viewer@rnb.gujarat.gov.in` | `admin123` | Additional Chief Secretary |

---

## 🎬 4 Master Demo Scenarios

The system includes pre-seeded data and dedicated walkthrough triggers for the 4 prompt demo scenarios:

### 1. Scenario 1: Critical Asset Deterioration & Repair Overhaul Cycle (`GEN-AHM-001`)
- **Initial State**: Generator `GEN-AHM-001` at Swarnim Sankul 1 has Health 42%, Risk 82 (Critical Zone), and calendar maintenance set to 20 Dec 2026.
- **Deterioration Trigger**: Ingests telemetry anomaly (Temp 88.5°C, Vibration 4.8 mm/s). System shifts priority to **URGENT** and dispatches a Risk Deterioration Alert!
- **Repair Cycle**: Completes overhaul ticket (Replaced bearings & AVR, Labor ₹12,000, Material ₹28,000). Health recovers to **88%**, Risk drops to **25 (LOW)**, and dynamic priority drops to **LOW**! Shows BEFORE vs AFTER metrics.

### 2. Scenario 2: Dependency Failure Cascade Simulation
- Targets `Generator` (`GEN-AHM-001`).
- Sets Generator to `FAILED` status.
- Dependency Engine executes BFS traversal $\rightarrow$ identifies affected `ATS-AHM-001`, `PNL-AHM-001` (Emergency Panel), and `LGT-AHM-001` (Emergency Lighting).
- Generates `CRITICAL INFRASTRUCTURE CASCADE IMPACT ALERT`.

### 3. Scenario 3: Warranty Expiry Alert & Contract Action (`LFT-AHM-001`)
- Sets Executive Passenger Lift warranty end date to **10 days from today**.
- System generates `Warranty Expiring Soon` alert and provides AMC contract renewal action.

### 4. Scenario 4: Dynamic Risk Priority > Fixed Calendar Schedule
- **Asset A** (`PMP-AHM-001`): Calendar due in 7 days, Health 90%, Risk 20%.
- **Asset B** (`GEN-AHM-001`): Calendar due in 45 days, Health 42%, Risk 82%.
- System automatically ranks **Asset B ahead of Asset A** in the priority queue due to risk escalation!

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application runs on `http://localhost:3000`.

---

## 📊 Key REST API Endpoints

- `GET /api/buildings` — List government buildings with health scores
- `GET /api/assets` — List physical assets with category & risk filters
- `GET /api/assets/:id` — Get asset details, history, warranties, & QR code
- `POST /api/inspections` — Submit inspection & recalculate health/risk
- `POST /api/maintenance` — Create work order ticket
- `POST /api/maintenance/:id/complete` — Complete repair & run post-maintenance verification
- `GET /api/dependencies/graph` — Get graph nodes/edges for React Flow
- `GET /api/dependencies/impact-analysis/:assetId` — Run Failure Impact Analysis
- `GET /api/risk/explain/:assetId` — Explainable AI risk reasons ("Why is this asset high risk?")
- `POST /api/sensors/readings` — Ingest live IoT telemetry reading payload
- `POST /api/scenarios/demo-1/deteriorate` — Trigger Scenario 1 High Risk
- `POST /api/scenarios/demo-1/repair` — Trigger Scenario 1 Repair Completion
- `POST /api/scenarios/demo-2/fail-generator` — Trigger Scenario 2 Failure Cascade

---

## 📄 License & Disclaimer

**GovBuild360 — Prototype / Demonstration System**  
Built for demonstration purposes. Inspired by domain functions of the Gujarat Roads & Buildings Department.
