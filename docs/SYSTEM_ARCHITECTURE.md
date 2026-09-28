# GovBuild360 — System Architecture Document

> **GovBuild360 — Prototype / Demonstration System**  
> Inspired by the Roads & Buildings (R&B) Department, Government of Gujarat.

---

## 1. High-Level Architecture Overview

GovBuild360 is built as a full-stack digital infrastructure management platform with a decoupled RESTful architecture.

```
[ Government Officers / Inspectors / Engineers / Authority ]
                         │
                         ▼
        ┌──────────────────────────────────┐
        │  React + TypeScript + Vite UI    │
        │  (Tailwind CSS + Lucide + Map)   │
        └────────────────┬─────────────────┘
                         │ REST API / JSON
                         ▼
        ┌──────────────────────────────────┐
        │  Node.js + Express + TypeScript  │
        │  API Gateway & Middleware Layer  │
        └────────────────┬─────────────────┘
                         │
     ┌───────────────────┼───────────────────┐
     │                   │                   │
     ▼                   ▼                   ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Risk Engine   │ │ Dependency    │ │ Alert & Cron  │
│ Calculator    │ │ Graph Engine  │ │ Scheduler     │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  PostgreSQL / Prisma ORM │
            │  (Relational + History)  │
            └──────────────────────────┘
```

---

## 2. Business Logic Services

- **Building Service**: Manages organizational hierarchy (Dept → Region → Circle → Division → Sub-Division → Building) and GIS geolocation.
- **Asset Service**: Unique Asset ID generation (`GEN-AHM-001`), specs, warranty & AMC linkages, and QR Code generation.
- **Lifecycle Engine**: Non-destructive timeline tracking from Procurement → Purchase → Installation → Commissioning → Operation → Inspection → Maintenance → Overhaul → Replacement → Decommissioning.
- **Health Engine**: Calculates 0–100 Asset Health Score based on condition, inspection readings, defects, age, and telemetry anomalies.
- **Risk Engine**: Calculates 0–100 Risk Score using Health deficit, failure frequency, age ratio, telemetry spikes, overdue maintenance, and dependency criticality.
- **Dependency Engine**: Graph traversal engine executing Failure Impact Analysis (downstream affected assets, systems, criticality).
- **Maintenance Priority Engine**: Dynamic Priority Queue (LOW, MEDIUM, HIGH, URGENT) based on actual risk + dependency impact rather than fixed calendar dates.
- **IoT Telemetry Simulator**: Ingests sensor data (`POST /api/sensors/readings`), updates health/risk dynamically, and triggers deterioration alerts.
- **Alert & Notification Engine**: Automated daily/hourly background jobs for warranty expiry, AMC expiry, risk deterioration, and cascade failures.
- **Audit Logger**: Records user actions, entity changes, old vs new values, timestamps, and IP addresses.
