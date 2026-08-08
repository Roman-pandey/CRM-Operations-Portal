# FundsRoom Mini ERP + CRM Operations Portal

A production-grade, full-stack Mini ERP & CRM Operations Portal built for wholesale/distribution businesses. Features Role-Based Access Control (RBAC), Customer CRM with follow-up tracking, Inventory Management with low-stock alerts, and an atomic, concurrency-safe Sales Challan workflow backed by MySQL row-level locking.

---

## 🌟 Key Features

- 🔐 **Authentication & RBAC**: JWT + bcrypt authentication supporting 4 specialized employee roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- 👥 **Customer CRM**: Complete customer lifecycle management (Lead/Active/Inactive, Retail/Wholesale/Distributor) with detailed follow-up history logs.
- 📦 **Inventory & Stock Management**: Real-time product management, SKU tracking, low-stock threshold alerts, and manual Stock IN/OUT audit logging.
- 📄 **Sales Challan Workflow**:
  - **Draft Phase**: Create & edit draft challans without impacting stock.
  - **Product Snapshot**: Stores immutable product snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) at the time of creation to protect historical financial integrity against price changes.
  - **Atomic Stock Confirmation**: Executes inside a MySQL transaction using **row-level locking (`SELECT ... FOR UPDATE`)** to prevent concurrency over-deduction race conditions.
  - **Cancellation Safeguards**: Restores inventory cleanly on cancellation with double-restoration protection (idempotent state transitions).
- 📊 **Executive Dashboard**: Real-time business overview featuring total customers, active products, low-stock alerts, sales challan breakdowns, and recent order feeds.
- 🎨 **Modern Dark UI**: Modern responsive interface built with React 18, TypeScript, and Tailwind CSS v4 featuring glassmorphism cards, dynamic badges, and micro-interactions.

---

## 🏗️ Architecture & Technology Stack

```
                       ┌─────────────────────────┐
                       │     React 18 Frontend   │
                       │  TypeScript + Tailwind  │
                       └────────────┬────────────┘
                                    │
                               HTTP / JSON
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   Express.js Node API   │
                       │  TypeScript + REST APIs │
                       └────────────┬────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      Auth Middleware       Validation Layer       Business Logic
       JWT + RBAC                Zod              Services (Atomic)
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │    Prisma ORM      │
                         └──────────┬─────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │     MySQL DB       │
                         └────────────────────┘
```

### Stack Summary
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Hot Toast, Axios.
- **Backend**: Node.js, Express.js (v5), TypeScript, Prisma ORM, Zod, JWT, bcryptjs.
- **Database**: MySQL.

---

## 🔒 Role-Permission Matrix (Design Decision)

| Resource / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|-------------------|:-----:|:-----:|:---------:|:--------:|
| User Management   |  ✅   |  ❌   |    ❌     |    ❌    |
| Customers (Read)  |  ✅   |  ✅   |    ❌     |    ✅    |
| Customers (CRUD)  |  ✅   |  ✅   |    ❌     |    ❌    |
| Follow-up Notes   |  ✅   |  ✅   |    ❌     |    ❌    |
| Products (Read)   |  ✅   |  ❌   |    ✅     |    ✅    |
| Products (CRUD)   |  ✅   |  ❌   |    ✅     |    ❌    |
| Stock Adjustments |  ✅   |  ❌   |    ✅     |    ❌    |
| Stock History     |  ✅   |  ❌   |    ✅     |    ✅    |
| Create Challan    |  ✅   |  ✅   |    ❌     |    ❌    |
| Confirm/Cancel    |  ✅   |  ✅   |    ❌     |    ✅    |
| View Challans     |  ✅   |  ✅   |    ❌     |    ✅    |
| Dashboard         |  ✅   |  ✅   |    ✅     |    ✅    |

---

## 🛡️ Implementation Assumptions & Design Decisions

1. **Stock Restoration on Cancellation**:
   The assignment requires `DRAFT`, `CONFIRMED`, and `CANCELLED` statuses. As an implementation assumption:
   - `CONFIRMED → CANCELLED`: Restores product stock and logs an `IN` stock movement.
   - `DRAFT → CANCELLED`: Changes status without altering inventory (stock was never deducted).
   - `CANCELLED → CANCELLED`: Idempotent no-op safeguard against double-restoration.

2. **Concurrency Safety & Row Locking**:
   When confirming a challan, simultaneous user requests could lead to race conditions. We execute `SELECT ... FOR UPDATE` inside a database transaction to lock product rows before validating stock levels:
   ```
   BEGIN TRANSACTION
     ├── Lock Challan Row (FOR UPDATE)
     ├── Verify status === 'DRAFT'
     ├── Lock Product Rows (FOR UPDATE)
     ├── Verify stock >= requested
     ├── Deduct stock & create OUT stock movements
     └── Update Challan status → CONFIRMED
   COMMIT
   ```

3. **Product Price Snapshots**:
   Challans capture price/name snapshot data inside `challan_items` during creation. Subsequent product price updates do not affect past challan totals.

---

## 🔑 Demo Credentials

All test accounts use the password pattern: `<Role>@123`

| Role | Email | Password | Allowed Scope |
|------|-------|----------|---------------|
| **Admin** | `admin@fundsroom.com` | `Admin@123` | Full System Access |
| **Sales** | `sales@fundsroom.com` | `Sales@123` | CRM + Create/Confirm Challans |
| **Warehouse** | `warehouse@fundsroom.com` | `Warehouse@123` | Products + Stock Adjustments |
| **Accounts** | `accounts@fundsroom.com` | `Accounts@123` | Financial Review + Challan Confirmation |

---

## ⚡ Quick Start & Setup

### Prerequisites
- Node.js v18+
- MySQL Server running locally (or remote MySQL connection string)

### 1. Database & Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables (.env)
# DATABASE_URL="mysql://root:password@localhost:3306/fundsroom_erp"

# Generate Prisma Client
npx prisma generate

# Run Database Migrations
npx prisma migrate dev --name init

# Seed Database with Demo Accounts & Sample Data
npm run seed

# Start Backend Dev Server (Port 5000)
npm run dev
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start Frontend Dev Server (Port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 Postman API Collection

A pre-configured Postman collection is included in `postman/FundsRoom-ERP.postman_collection.json`.

It covers:
- `POST /api/auth/login` (Auth token auto-save)
- `GET /api/customers` (Search, pagination, filters)
- `POST /api/customers/:id/followups` (Follow-up notes)
- `GET /api/products/low-stock` (Alerts)
- `POST /api/products/:id/stock` (Stock IN/OUT)
- `POST /api/challans` (Draft creation)
- `POST /api/challans/:id/confirm` (Row-locked confirmation)
- `POST /api/challans/:id/cancel` (Stock restoration)
- `GET /api/dashboard` (Stats overview)

---

## 📁 Repository Structure

```
CRM Operations Portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & enums
│   │   └── seed.ts             # Demo data seeder
│   ├── src/
│   │   ├── config/             # Env configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, RBAC, Validation & Errors
│   │   ├── routes/             # REST endpoints
│   │   ├── services/           # Business logic & Transactions
│   │   ├── validators/         # Zod schemas
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (StatsCard, Modals, etc.)
│   │   ├── context/            # AuthContext provider
│   │   ├── layouts/            # Dashboard & ProtectedRoute layouts
│   │   ├── pages/              # Responsive React pages (14 routes)
│   │   ├── services/           # Axios API services
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # Permissions & helper functions
│   │   ├── App.tsx             # React Router v6 setup
│   │   └── main.tsx
│   └── package.json
├── postman/
│   └── FundsRoom-ERP.postman_collection.json
└── README.md
```
