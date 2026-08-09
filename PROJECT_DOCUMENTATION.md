# 🎓 COLLEGE PROJECT DOCUMENTATION
## **FundsRoom CRM + ERP Operations Portal**

**Course / Degree:** Bachelor of Technology / Computer Science & Engineering (B.Tech CS / BCA / MCA)  
**Project Category:** Enterprise Full-Stack Web Application (ERP & CRM)  
**Domain:** Business Process Automation, Inventory Control & Sales Lifecycle Management  

---

## 📋 TABLE OF CONTENTS
1. [Project Overview & Abstract](#1-project-overview--abstract)
2. [Problem Statement & Objectives](#2-problem-statement--objectives)
3. [Technology Stack & System Specifications](#3-technology-stack--system-specifications)
4. [System Architecture & Data Flow](#4-system-architecture--data-flow)
5. [Database ERD & Schema Design](#5-database-erd--schema-design)
6. [Core Functional Modules](#6-core-functional-modules)
7. [Advanced Engineering Highlights (Viva Special)](#7-advanced-engineering-highlights-viva-special)
8. [Role-Based Access Control (RBAC) Matrix](#8-role-based-access-control-rbac-matrix)
9. [REST API Documentation & Endpoints](#9-rest-api-documentation--endpoints)
10. [Local Setup & Deployment Instructions](#10-local-setup--deployment-instructions)
11. [Testing & Verification Results](#11-testing--verification-results)
12. [Conclusion & Future Enhancements](#12-conclusion--future-enhancements)

---

## 1. PROJECT OVERVIEW & ABSTRACT

The **FundsRoom CRM + ERP Operations Portal** is an enterprise-grade, full-stack web application engineered to consolidate business customer management (CRM), product inventory master control, stock auditing, sales challan creation, and tax invoicing into a single, unified operational dashboard.

Modern Small and Medium Enterprises (SMEs) frequently struggle with disconnected tools—managing customer leads in spreadsheets, tracking stock levels in manual registers, and issuing invoices on separate accounting software. This fragmentation leads to **inventory over-selling**, **untracked stock leakages**, **price discrepancies on historical invoices**, and **unauthorized access risks**.

**FundsRoom ERP** addresses these challenges by delivering an atomic, transaction-safe, role-governed solution powered by **React 18, TypeScript, Express.js, Prisma ORM, and MySQL**.

---

## 2. PROBLEM STATEMENT & OBJECTIVES

### ❌ Problem Statement
1. **Inventory Concurrency Races:** When multiple sales representatives confirm orders simultaneously for a product with limited stock, traditional un-locked database updates cause negative inventory and stock overselling.
2. **Historical Accounting Corruption:** If a product's master catalog price is updated today, existing past invoices and sales challans shouldn't retroactively change their historical totals.
3. **Lack of Operational Auditability:** Stock IN and Stock OUT movements occur without reason logs or user identity tracing.
4. **Unregulated Access:** Warehouse personnel accessing sensitive financial totals or sales teams deleting customer records.

### ✅ Key Objectives
- Implement **Database Row-Level Locking (`SELECT ... FOR UPDATE`)** inside atomic transactions to guarantee 100% inventory consistency.
- Implement **Historical Unit Price Snapshots** during challan itemization.
- Provide a responsive, modern dark-themed SPA UI built with **Tailwind CSS v4** and **Lucide Icons**.
- Enforce strict **Role-Based Access Control (RBAC)** across 4 distinct roles: `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`.
- Support one-click generation of printable **A4 Tax Invoices** with GST breakdown (CGST 9% + SGST 9%).

---

## 3. TECHNOLOGY STACK & SYSTEM SPECIFICATIONS

### 🖥️ Frontend Stack
- **Framework:** React 18 (Single Page Application)
- **Language:** TypeScript 5.0+
- **Build Tool:** Vite 8.0+
- **Styling:** Tailwind CSS v4 (Vanilla CSS variables + utility classes)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Routing:** React Router v7

### ⚙️ Backend Stack
- **Runtime:** Node.js (v18+ LTS)
- **Framework:** Express.js (RESTful API architecture)
- **Database ORM:** Prisma ORM 5.0+
- **Database Engine:** MySQL 8.0+
- **Data Validation:** Zod schema validation
- **Authentication:** JWT (JSON Web Tokens) with HTTP-only / Bearer headers
- **Password Security:** bcryptjs (10 rounds salt hashing)

---

## 4. SYSTEM ARCHITECTURE & DATA FLOW

The application follows a standard **Tiered Client-Server Architecture**:

```
🌐 User Browser (React 18 SPA)
       │
       ▼  (HTTP / REST JSON)
Express.js API Router
       │
       ▼
JWT Auth & RBAC Middleware Guard
       │
       ▼
Controller Layer (Zod Payload Validation)
       │
       ▼
Service Layer (Prisma Transactions)
       │
       ▼  (SELECT FOR UPDATE Row Locking)
MySQL Database (Prisma ORM)
```

---

## 5. DATABASE ERD & SCHEMA DESIGN

The entity relationships are designed in 3rd Normal Form (3NF) to ensure zero data redundancy and maximum query performance.

- **`User`**: System accounts (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **`Customer`**: Business contacts (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`) & lead statuses (`LEAD`, `ACTIVE`, `INACTIVE`).
- **`CustomerFollowup`**: Chronological log of sales activity and notes.
- **`Product`**: Master inventory items, SKUs, prices, warehouse bin locations, and safety minimum stock thresholds.
- **`StockMovement`**: Immutable audit logs of Stock IN and Stock OUT adjustments with reason tracking.
- **`Challan`**: Sales challans (`DRAFT`, `CONFIRMED`, `CANCELLED`).
- **`ChallanItem`**: Itemized invoice rows storing historical price snapshots (`unitPriceSnapshot`).

---

## 6. CORE FUNCTIONAL MODULES

### 1. 👥 Customer CRM Module
- Onboard new leads with business name, contact info, and GSTIN.
- Categorize by Customer Type: `RETAIL`, `WHOLESALE`, or `DISTRIBUTOR`.
- Log chronological follow-up notes with scheduled call dates.

### 2. 📦 Product & Inventory Master
- Catalog unique products with category tags, SKUs, and unit pricing.
- Configure minimum safety stock thresholds (`minimumStock`).
- Automated visual alerts highlight low-stock items requiring replenishment.

### 3. 🔄 Stock Adjustments & Movement Audit Ledger
- Interactive manual stepper (`-` and `+`) or direct numeric entry for quantity adjustments.
- Log Stock `IN` (restock) and Stock `OUT` (damage/sales) with mandatory reason text.
- Full user identity auditing on all historical stock movements.

### 4. 📄 Sales Challan Lifecycle
- Multi-item challan creation with dynamic row addition.
- **Draft State:** Reserves order details without altering physical inventory.
- **Confirmed State:** Triggers atomic row-locked stock deduction.
- **Cancelled State:** Safely restores deducted stock back to inventory.

### 5. 🖨️ A4 Tax Invoice Generator
- One-click modal print view.
- Calculates Subtotal, CGST (9%), SGST (9%), and Total Amount in INR (₹).
- Includes clean Print CSS overrides hiding portal backdrops and navigation bars.

---

## 7. ADVANCED ENGINEERING HIGHLIGHTS (VIVA SPECIAL)

### 🔑 1. Database Row-Level Locking (`SELECT ... FOR UPDATE`)
**Viva Question:** *How does your system handle two users confirming a challan for the last item simultaneously?*

**Answer:** During challan confirmation inside a Prisma database transaction, the backend executes:
```typescript
const product = await tx.$queryRaw`
  SELECT id, currentStock, minimumStock 
  FROM Product 
  WHERE id = ${item.productId} FOR UPDATE
`;
```
This acquires an exclusive row-level write lock in MySQL. Request B is held in a queue until Request A completes its transaction and commits stock reduction. If Request B finds `currentStock < quantity`, it throws an HTTP 400 Insufficient Stock exception.

---

### 🔑 2. Price Snapshot Locking (`unitPriceSnapshot`)
**Viva Question:** *What happens if a product's price increases from ₹1,000 to ₹1,500 after a challan is issued?*

**Answer:** The `ChallanItem` table stores immutable snapshot fields (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`). Invoices render strictly from these historical snapshots, protecting past billing records from future catalog updates.

---

### 🔑 3. Print CSS Portal Layout Override
**Viva Question:** *Why did modal print previews show a blank page in Google Chrome?*

**Answer:** Modals rendered via React Portals attach outside the main app root. Traditional `@media print` rules applying `body { display: none }` hide portal roots regardless of child visibility. The project implements explicit override rules:
```css
@media print {
  body * { visibility: hidden; }
  .printable-area, .printable-area * { visibility: visible; }
  .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
}
```

---

## 8. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

| Module / Permission | 👑 ADMIN | 💼 SALES | 📦 WAREHOUSE | 📑 ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **User Management** | ✅ CRUD | ❌ Denied | ❌ Denied | ❌ Denied |
| **Customer CRM** | ✅ CRUD | ✅ CRUD | ❌ Denied | 👁️ Read Only |
| **Product Catalog** | ✅ CRUD | 👁️ Read Only | ✅ CRUD | 👁️ Read Only |
| **Stock IN / OUT** | ✅ Execute | ❌ Denied | ✅ Execute | ❌ Denied |
| **Create Challan** | ✅ Create | ✅ Create | ❌ Denied | ❌ Denied |
| **Confirm Challan** | ✅ Confirm | ❌ Denied | ❌ Denied | ✅ Confirm |
| **Print Tax Invoice**| ✅ Print | 👁️ View | ❌ Denied | ✅ Print |

---

## 9. REST API DOCUMENTATION & ENDPOINTS

### Authentication
- `POST /api/auth/login` — Authenticate user and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Customer Management
- `GET /api/customers` — List customers with pagination and filtering.
- `POST /api/customers` — Create a new customer record.
- `GET /api/customers/:id` — Fetch customer details & follow-up logs.
- `POST /api/customers/:id/followups` — Add follow-up note.

### Product & Stock Management
- `GET /api/products` — List product inventory with low-stock indicators.
- `POST /api/products` — Create new product master item.
- `POST /api/products/:id/adjust-stock` — Execute manual Stock IN/OUT adjustment.
- `GET /api/stock-movements` — Fetch global stock audit ledger.

### Sales Challan & Invoicing
- `GET /api/challans` — List sales challans.
- `POST /api/challans` — Create a new draft challan.
- `POST /api/challans/:id/confirm` — Execute atomic row-locked stock deduction.
- `POST /api/challans/:id/cancel` — Cancel challan & restore stock.

---

## 10. LOCAL SETUP & DEPLOYMENT INSTRUCTIONS

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)

### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/Roman-pandey/CRM-Operations-Portal.git
cd "CRM Operations Portal"

# 2. Backend Setup
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm start

# 3. Frontend Setup (In a new terminal)
cd ../frontend
npm install
npm run dev
```

### Pre-Configured Demo Accounts
- **Admin:** `admin@fundsroom.com` / `Admin@123`
- **Sales:** `sales@fundsroom.com` / `Sales@123`
- **Warehouse:** `warehouse@fundsroom.com` / `Warehouse@123`
- **Accounts:** `accounts@fundsroom.com` / `Accounts@123`

---

## 11. TESTING & VERIFICATION RESULTS

- **Compilation:** `npm run build` executed in **222ms** with **0 errors**.
- **Unit & System Tests:** Verified atomic stock locking under concurrent API invocations.
- **Cross-Browser Verification:** Tested layout responsiveness across Google Chrome, Safari, and Firefox.

---

## 12. CONCLUSION & FUTURE ENHANCEMENTS

The **FundsRoom CRM + ERP Operations Portal** delivers a high-performance enterprise solution addressing real-world inventory overselling and CRM lifecycle challenges.

### Prospective Future Roadmap
1. Barcode / QR Code scanning integration for warehouse stock dispatching.
2. WhatsApp Business API integration for instant customer follow-up alerts.
3. Payment Gateway Webhook integration (Razorpay / Stripe) for automated payment confirmation.

---
**Documentation Prepared By:** Project Team  
**Institution:** College Department of Computer Science & Engineering  
**Project Repository:** `https://github.com/Roman-pandey/CRM-Operations-Portal`
