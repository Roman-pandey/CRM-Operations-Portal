# FundsRoom Mini ERP + CRM Operations Portal

A production-grade, full-stack Mini ERP & CRM Operations Portal built for wholesale and distribution businesses. Features Role-Based Access Control (RBAC), Customer CRM with follow-up tracking, Inventory Management with low-stock alerts, printable Tax Invoices, and an atomic, concurrency-safe Sales Challan workflow backed by MySQL row-level locking (`SELECT ... FOR UPDATE`).

---

## 📋 Evaluation Submission Checklist

- [x] **Working Local Setup**: Fully functional Express.js backend (Port 5001) + React Vite frontend (Port 5173).
- [x] **Postman Collection**: Located in `postman/FundsRoom-ERP.postman_collection.json`.
- [x] **Clear Documentation**: Server setup, environment management, execution, deployment, and technical assumptions detailed below.

---

## 🌟 Key Features & Modules

- 🔐 **Authentication & RBAC**: JWT + bcrypt authentication supporting 4 specialized employee roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- 👥 **Customer CRM**: Complete customer lifecycle management (Lead/Active/Inactive, Retail/Wholesale/Distributor) with follow-up history logs.
- 📦 **Inventory & Stock Management**: Real-time product management, SKU tracking, low-stock threshold alerts, and manual Stock IN/OUT audit logging.
- 📄 **Sales Challan Workflow**:
  - **Draft Phase**: Create & edit draft challans without impacting stock.
  - **Product Snapshot**: Stores immutable product snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) at creation time to protect historical financial integrity against future price changes.
  - **Atomic Stock Confirmation**: Executes inside a MySQL transaction using **row-level locking (`SELECT ... FOR UPDATE`)** to prevent race conditions and inventory over-deduction.
  - **Cancellation Safeguards**: Restores inventory cleanly on cancellation with double-restoration protection (idempotent state transitions).
- 🖨️ **Printable Tax Invoice**: Generator modal with GST calculations (CGST 9% + SGST 9%), itemized snapshots, customer details, and signatory block formatted cleanly for A4 print.
- 📊 **Executive Dashboard**: Real-time business overview featuring total customers, active products, low-stock alerts, sales challan breakdowns, and recent order feeds.

---

## 🏗️ Technical Architecture & Server Setup

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

### How the Server Was Set Up
1. **Modular Architecture**: Built using a strict 3-tier Layered Architecture (`Routes` → `Controllers` → `Services` → `Prisma ORM`).
2. **Validation & Security**: Incoming HTTP requests are parsed and sanitized using **Zod** schema validators before reaching controllers.
3. **Database Layer**: Data access is managed via **Prisma ORM** with strong TypeScript typing and declarative schema migrations.
4. **Error Handling**: Centralized error middleware captures validation errors (Zod), authorization failures, database locks, and returns structured JSON responses `{ success: false, message, errors }`.

---

## 🔒 Role-Permission Matrix (Design Decision)

| Resource / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|-------------------|:-----:|:-----:|:---------:|:--------:|
| User Management   |  ✅   |  ❌   |    ❌     |    ❌    |
| Customers (Read)  |  ✅   |  ✅   |    ❌     |    ✅    |
| Customers (CRUD)  |  ✅   |  ✅   |    ❌     |    ❌    |
| Follow-up Notes   |  ✅   |  ✅   |    ❌     |    ❌    |
| Products (Read)   |  ✅   |  ✅   |    ✅     |    ✅    |
| Products (CRUD)   |  ✅   |  ❌   |    ✅     |    ❌    |
| Stock Adjustments |  ✅   |  ❌   |    ✅     |    ❌    |
| Stock History     |  ✅   |  ❌   |    ✅     |    ✅    |
| Create Challan    |  ✅   |  ✅   |    ❌     |    ❌    |
| Confirm/Cancel    |  ✅   |  ✅   |    ❌     |    ✅    |
| View Challans     |  ✅   |  ✅   |    ❌     |    ✅    |
| Dashboard         |  ✅   |  ✅   |    ✅     |    ✅    |

---

## 🛡️ Key Assumptions & Design Decisions

1. **Stock Restoration on Cancellation**:
   - `CONFIRMED → CANCELLED`: Restores product stock and logs an `IN` stock movement record.
   - `DRAFT → CANCELLED`: Changes status without altering inventory (stock was never deducted).
   - `CANCELLED → CANCELLED`: Idempotent safeguard against double-restoration.

2. **Concurrency Safety & Row Locking**:
   When confirming a sales challan, simultaneous requests could cause race conditions. We execute `SELECT ... FOR UPDATE` inside a Prisma transaction to lock product rows before validating stock levels:
   ```
   BEGIN TRANSACTION
     ├── Lock Challan Row (FOR UPDATE)
     ├── Verify status === 'DRAFT'
     ├── Lock Product Rows (FOR UPDATE)
     ├── Verify stock >= requested quantity
     ├── Deduct stock & create OUT stock movements
     └── Update Challan status → CONFIRMED
   COMMIT
   ```

3. **Immutable Price Snapshots**:
   Challans capture price and product name snapshot data inside `challan_items` during creation. Subsequent product price changes do not alter past challan or tax invoice totals.

---

## ⚙️ How Environment Variables Are Managed

Environment variables are managed separately for backend and frontend using standard `.env` files.

### 1. Backend Environment Variables (`backend/.env`)

```env
PORT=5001
DATABASE_URL="mysql://root:password@localhost:3306/fundsroom_erp"
JWT_SECRET="fundsroom-super-secret-jwt-key-2026"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `PORT` | Backend server port | `5001` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/dbname` |
| `JWT_SECRET` | Secret key for JWT authentication | `fundsroom-super-secret-jwt-key-2026` |
| `JWT_EXPIRES_IN` | JWT token validity duration | `7d` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

### 2. Frontend Environment Variables (`frontend/.env`)

```env
VITE_API_URL="http://localhost:5001/api"
```

---

## ⚡ How to Run the Project Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL**: Server running locally on port 3306 (or remote host like Aiven/Railway)

### 1. Clone Repository & Setup Backend

```bash
git clone https://github.com/Roman-pandey/CRM-Operations-Portal.git
cd CRM-Operations-Portal/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma Client & push schema to database
npx prisma generate
npx prisma db push

# Seed initial seed data & demo accounts
npm run seed

# Start backend server (Port 5001)
npm start
```

### 2. Setup Frontend

Open a new terminal window:

```bash
cd CRM-Operations-Portal/frontend

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Default Login Credentials

All test accounts use the password pattern: `<Role>@123`

| Role | Email | Password | Allowed Scope |
|------|-------|----------|---------------|
| **Admin** | `admin@fundsroom.com` | `Admin@123` | Full System Access |
| **Sales** | `sales@fundsroom.com` | `Sales@123` | CRM + Sales Challans + Products (Read) |
| **Warehouse** | `warehouse@fundsroom.com` | `Warehouse@123` | Products + Stock Adjustments + Movements |
| **Accounts** | `accounts@fundsroom.com` | `Accounts@123` | Financial Review + Challan Confirmation |

---

## 📮 Postman Collection Instructions

A complete, ready-to-import Postman Collection is included at:
📁 `postman/FundsRoom-ERP.postman_collection.json`

### How to Import & Test:
1. Open Postman app.
2. Click **Import** → select `postman/FundsRoom-ERP.postman_collection.json`.
3. Set collection environment variable `baseUrl` = `http://localhost:5001/api`.
4. Run request **`Authentication -> Login (Admin)`**.
5. Copy the returned `token` into collection variable `authToken`.
6. Test endpoints:
   - `GET /api/customers` (List & Search)
   - `POST /api/customers/:id/followups` (Follow-up log)
   - `GET /api/products/low-stock` (Inventory alerts)
   - `POST /api/products/:id/stock` (Stock IN/OUT adjustment)
   - `POST /api/challans` (Create draft challan)
   - `POST /api/challans/:id/confirm` (Row-locked stock deduction)
   - `GET /api/dashboard` (Executive dashboard stats)

---

## ☁️ How to Deploy the Project Online

### 1. Database (Free MySQL on Aiven / Railway)
1. Create a MySQL database instance on [Aiven.io](https://aiven.io) or [Railway.app](https://railway.app).
2. Copy the connection URI string: `mysql://user:pass@host:port/dbname`.

### 2. Backend API (Render.com)
1. Create a **Web Service** on [Render.com](https://render.com) connected to your GitHub repository.
2. Set Root Directory = `backend`.
3. Set Build Command: `npm install && npx prisma generate && npm run build`.
4. Set Start Command: `npm start`.
5. Add Environment Variables:
   - `DATABASE_URL` = *(Your MySQL URL)*
   - `PORT` = `5001`
   - `JWT_SECRET` = `super_secret_jwt_key`
   - `NODE_ENV` = `production`
6. Run database migrations / seed:
   ```bash
   DATABASE_URL="your-remote-db-url" npx prisma db push && npm run seed
   ```

### 3. Frontend Web App (Vercel.com)
1. Create a **New Project** on [Vercel.com](https://vercel.com) importing the GitHub repository.
2. Set Root Directory = `frontend`.
3. Set Framework Preset = `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-render-url.onrender.com/api`
5. Deploy!

---

## 📁 Repository Structure

```
CRM Operations Portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & enums
│   │   └── seed.ts             # Demo data seeder
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, RBAC, Validation & Error handler
│   │   ├── routes/             # REST API endpoints
│   │   ├── services/           # Business logic & Transactions
│   │   ├── validators/         # Zod schema validators
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Modal, ConfirmDialog, StatsCard UI components
│   │   ├── context/            # AuthContext provider
│   │   ├── layouts/            # DashboardLayout & ProtectedRoute
│   │   ├── pages/              # Responsive React pages
│   │   ├── services/           # Axios API service calls
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # Permissions matrix & helper functions
│   │   ├── App.tsx             # React Router v6 setup
│   │   └── main.tsx
│   └── package.json
├── postman/
│   └── FundsRoom-ERP.postman_collection.json
└── README.md
```
