# FundsRoom ERP + CRM Operations Portal - Submission & Deployment Guide

This document provides clear documentation for local execution, server setup, environment variables management, Postman API testing, deployment instructions, and technical design assumptions.

---

## 📋 Evaluation Submission Checklist

- [x] **Working Local Setup**: Fully functional Express.js backend (Port 5001) + React Vite frontend (Port 5173).
- [x] **Postman Collection**: Pre-configured JSON file located at `postman/FundsRoom-ERP.postman_collection.json`.
- [x] **Clear Documentation**: Step-by-step setup, server architecture, environment variables, deployment steps, and technical assumptions detailed below.

---

## 🏗️ How the Server Was Set Up

1. **Layered Architecture**: The backend is structured using a strict 3-tier Layered Architecture:
   - `src/routes/`: Express routes mapping REST endpoints.
   - `src/controllers/`: Request handlers parsing query/params/body.
   - `src/services/`: Business logic & transactional database operations.
   - `src/middleware/`: Authentication (JWT), RBAC authorization, and error handling.
2. **Validation Layer**: Incoming request payloads are validated using **Zod** schema validators (`src/validators/`).
3. **Database & ORM**: Model schemas, relationships, and queries are defined in **Prisma ORM** with MySQL (`prisma/schema.prisma`).
4. **Error Management**: Centralized error middleware formats errors into clean JSON payloads: `{ success: false, message, errors }`.

---

## ⚙️ How Environment Variables Are Managed

Environment configuration is isolated per project folder.

### 1. Backend (`backend/.env`)

```env
PORT=5001
DATABASE_URL="mysql://root:password@localhost:3306/fundsroom_erp"
JWT_SECRET="fundsroom-super-secret-jwt-key-2026"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

| Key | Description | Example |
|---|---|---|
| `PORT` | Node.js backend port | `5001` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/dbname` |
| `JWT_SECRET` | Secret key for JWT signing | `fundsroom-super-secret-jwt-key-2026` |
| `JWT_EXPIRES_IN` | JWT token lifespan | `7d` |
| `FRONTEND_URL` | CORS origin policy | `http://localhost:5173` |

### 2. Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:5001/api"
```

---

## ⚡ How to Run the Project Locally

### Prerequisites
- Node.js v18.0.0+
- MySQL Server (Port 3306) running locally or via remote host (e.g. Aiven/Railway)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment file
cp .env.example .env

# Generate Prisma Client & push database tables
npx prisma generate
npx prisma db push

# Seed default demo accounts & sample products
npm run seed

# Start backend server (Port 5001)
npm start
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server (Port 5173)
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🔑 Demo User Accounts

| Role | Email | Password | Allowed Scope |
|---|---|---|---|
| **Admin** | `admin@fundsroom.com` | `Admin@123` | Full System Access |
| **Sales** | `sales@fundsroom.com` | `Sales@123` | CRM + Sales Challans + Products (Read) |
| **Warehouse** | `warehouse@fundsroom.com` | `Warehouse@123` | Products + Stock Adjustments + Movements |
| **Accounts** | `accounts@fundsroom.com` | `Accounts@123` | Financial Review + Challan Confirmation |

---

## 📮 Postman Collection Instructions

A pre-built Postman collection is saved at:
📁 `postman/FundsRoom-ERP.postman_collection.json`

### Import & Execution:
1. Launch Postman → click **Import** → select `postman/FundsRoom-ERP.postman_collection.json`.
2. Confirm collection variable `baseUrl` is set to `http://localhost:5001/api`.
3. Run request **`Authentication -> Login (Admin)`** to obtain a valid JWT token.
4. Copy the token into collection variable `authToken`.
5. Test key endpoints:
   - `GET /api/customers` (Customer search & pagination)
   - `POST /api/customers/:id/followups` (Follow-up note logging)
   - `GET /api/products/low-stock` (Inventory threshold alerts)
   - `POST /api/products/:id/stock` (Manual Stock IN/OUT adjustment)
   - `POST /api/challans` (Create draft sales challan)
   - `POST /api/challans/:id/confirm` (Row-locked stock deduction)
   - `GET /api/dashboard` (Executive metrics & recent feed)

---

## ☁️ How to Deploy the Project Online

### 1. Database (Free MySQL on Aiven.io or Railway.app)
- Create a MySQL instance on [Aiven.io](https://aiven.io) or [Railway.app](https://railway.app).
- Copy the connection URI: `mysql://user:password@host:port/dbname`.

### 2. Backend (Render.com)
- Create a **Web Service** on [Render.com](https://render.com) connected to the GitHub repo.
- Set Root Directory = `backend`.
- Set Build Command: `npm install && npx prisma generate && npm run build`.
- Set Start Command: `npm start`.
- Add Environment Variables: `DATABASE_URL`, `PORT=5001`, `JWT_SECRET`, `NODE_ENV=production`.
- Push tables and seed:
  ```bash
  DATABASE_URL="your-remote-db-url" npx prisma db push && npm run seed
  ```

### 3. Frontend (Vercel.com)
- Create a **New Project** on [Vercel.com](https://vercel.com).
- Set Root Directory = `frontend`.
- Framework Preset = `Vite`.
- Add Environment Variable: `VITE_API_URL` = `https://your-backend.onrender.com/api`.
- Deploy!

---

## 🛡️ Technical Assumptions Made

1. **Stock Restoration on Cancellation**:
   - `CONFIRMED → CANCELLED`: Restores product inventory stock and creates an `IN` stock movement record.
   - `DRAFT → CANCELLED`: Updates status without altering stock (since stock was never deducted).
   - `CANCELLED → CANCELLED`: Idempotent safeguard against double restoration.

2. **Row Locking & Concurrency Protection**:
   - Challan confirmation executes inside a Prisma database transaction with `SELECT ... FOR UPDATE` row locks to prevent simultaneous user race conditions from over-deducting stock.

3. **Product Price Snapshots**:
   - Product name, SKU, and unit price are saved as snapshots inside `challan_items` at creation time. Historical financial records remain unaffected by future product price edits.
