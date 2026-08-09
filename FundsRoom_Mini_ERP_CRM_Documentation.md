# FundsRoom Mini ERP + CRM Operations Portal
## Comprehensive Project Documentation & Technical Case Study

**GitHub Repository:** [https://github.com/Roman-pandey/CRM-Operations-Portal](https://github.com/Roman-pandey/CRM-Operations-Portal)  
**Postman Collection:** [`postman/FundsRoom-ERP.postman_collection.json`](file:///Users/romanpandey/Documents/CRM%20Operations%20Portal/postman/FundsRoom-ERP.postman_collection.json)  

---

## 1. PROJECT TITLE & OVERVIEW

### **Project Title**
`FundsRoom Mini ERP + CRM Operations Portal`

### **What The System Does**
The FundsRoom Mini ERP + CRM Portal is a unified enterprise web platform designed to streamline business operations across customer relationship management, product inventory tracking, manual stock adjustments, sales challan creation, and tax invoicing.

### **Business Problem It Solves**
1. **Inventory Overselling:** Prevents concurrent sales orders from over-deducting stock using database-level row locking.
2. **Historical Accounting Inflation:** Protects historical sales invoices from changing when product catalog master prices are updated later.
3. **Fragmented Operations:** Replaces spreadsheets and separate registers with a single, role-governed portal.
4. **Audit Trail Deficits:** Maintains full user-stamped logs for all Stock IN/OUT operations and customer follow-up interactions.

### **Key Objectives**
- Ensure **100% atomic inventory consistency** under high concurrency.
- Enforce strict **Role-Based Access Control (RBAC)** across 4 enterprise roles.
- Provide dynamic, real-time operational dashboard analytics.
- Support one-click printable **A4 Tax Invoices** with GST breakdown.

---

## 2. FEATURES & CAPABILITIES

- **Customer CRM:** Onboard customer leads, classify by customer type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), track business GSTIN, and record status (`LEAD`, `ACTIVE`, `INACTIVE`).
- **Customer Follow-ups:** Chronological follow-up activity log with scheduled next-call dates and notes.
- **Product Management:** Catalog SKUs, product categories, unit prices, minimum safety thresholds, and warehouse location bin IDs.
- **Inventory Control:** Monitor safety stock levels with automated low-stock warnings.
- **Stock IN / OUT:** Execute manual stock adjustments with mandatory reason logging and user auditing.
- **Sales Challans:** Create multi-item sales challans with price snapshots, transition through `DRAFT`, `CONFIRMED`, and `CANCELLED` states.
- **Tax Invoice Printing:** Generate formal A4 Tax Invoices with subtotal, CGST 9%, SGST 9%, and total amount calculations.
- **Operational Dashboard:** Real-time KPI summary cards, recent sales challan feeds, and low-stock replenishment alerts.
- **User / RBAC Management:** Full user CRUD, password hashing, and granular role permissions.

---

## 3. USER ROLES & PERMISSIONS

The platform enforces strict Role-Based Access Control (RBAC) across 4 roles:

1. **👑 Admin (`ADMIN`):** Full system authority. Access to User Management, Customer CRM, Product Inventory, Stock Adjustments, Sales Challans, and Financial Invoicing.
2. **💼 Sales (`SALES`):** Customer CRM management, lead follow-ups, product catalog directory search, and drafting sales challans.
3. **📦 Warehouse (`WAREHOUSE`):** Product catalog item creation, manual Stock IN/OUT adjustments, low-stock monitoring, and audit log viewing.
4. **📑 Accounts (`ACCOUNTS`):** Reviewing draft sales challans, confirming transactional stock deductions, printing Tax Invoices, and auditing totals.

---

## 4. TECHNOLOGY STACK

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router v7, React Hot Toast
- **Backend:** Node.js, Express.js, TypeScript
- **ORM:** Prisma ORM 5.0+
- **Database:** MySQL 8.0+
- **Authentication:** JWT (JSON Web Tokens) with HTTP-only / Bearer headers, bcryptjs (10 salt rounds)
- **Validation:** Zod schema validation

---

## 5. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│              React 18 SPA (TypeScript + Vite)           │
└────────────────────────────┬────────────────────────────┘
                             │ (HTTP / REST JSON)
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Express.js REST API Router                │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            JWT Authentication & RBAC Middleware          │
└────────────────────────────┬────────────────────────────┘
                             │ (Zod Schema Validation)
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Business Services & Transaction Layer        │
└────────────────────────────┬────────────────────────────┘
                             │ (SELECT ... FOR UPDATE)
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Prisma ORM (Data Access)                  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   MySQL 8.0 Database                    │
└────────────────────────────┴────────────────────────────┘
```

---

## 6. DATABASE DESIGN & SCHEMA

The database comprises 7 core relational entities:

1. **`User`**: System user credentials, hashed passwords, and assigned role (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
2. **`Customer`**: Business customer directory, contact details, GSTIN, customer type, and lead status.
3. **`CustomerFollowup`**: Activity log linked to a customer, recording follow-up date, notes, and creator ID.
4. **`Product`**: Product master items, SKUs, category tags, unit prices, stock levels, and warehouse locations.
5. **`StockMovement`**: Immutable audit logs of Stock `IN` and Stock `OUT` adjustments with reason text and user IDs.
6. **`Challan`**: Sales challans tracking customer ID, status (`DRAFT`, `CONFIRMED`, `CANCELLED`), total amount, and confirmation timestamps.
7. **`ChallanItem`**: Itemized lines storing snapshot values (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) and line totals.

---

## 7. IMPORTANT BUSINESS WORKFLOW

```
   [ User Creates Sales Challan ]
                 │
                 ▼
         Status = DRAFT (Stock Not Deducted)
                 │
                 ▼
     [ User Clicks "Confirm Challan" ]
                 │
                 ▼
     [ Validate Stock & Acquire Lock ]
                 │
                 ▼
  [ Database Transaction (SELECT FOR UPDATE) ]
                 │
                 ▼
       [ Deduct Stock Quantity ]
                 │
                 ▼
    [ Log Stock OUT Movement Audit ]
                 │
                 ▼
       Status = CONFIRMED (Printable Invoice Ready)
```

---

## 8. STOCK CONCURRENCY HANDLING

To eliminate race conditions when multiple users confirm challans simultaneously for low-stock items, the service executes a raw SQL row lock within a Prisma interactive transaction:

```typescript
await prisma.$transaction(async (tx) => {
  for (const item of challan.items) {
    // 1. Acquire exclusive write lock on product row
    const [product]: any = await tx.$queryRaw`
      SELECT id, currentStock, minimumStock 
      FROM Product 
      WHERE id = ${item.productId} FOR UPDATE
    `;

    // 2. Validate sufficient stock
    if (product.currentStock < item.quantity) {
      throw new Error(`Insufficient stock for product ID ${item.productId}`);
    }

    // 3. Deduct stock quantity atomically
    await tx.product.update({
      where: { id: item.productId },
      data: { currentStock: product.currentStock - item.quantity }
    });

    // 4. Record Stock OUT movement audit
    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        quantity: item.quantity,
        movementType: 'OUT',
        reason: `Challan Confirmation #${challan.challanNumber}`,
        createdById: userId
      }
    });
  }

  // 5. Mark Challan as CONFIRMED
  await tx.challan.update({
    where: { id: challanId },
    data: { status: 'CONFIRMED', confirmedAt: new Date() }
  });
});
```

---

## 9. HISTORICAL PRODUCT PRICE SNAPSHOTS

When a sales challan is created, the system captures **historical snapshots**:
- **`productNameSnapshot`**: Preserves the exact product title at order time.
- **`skuSnapshot`**: Preserves the exact SKU at order time.
- **`unitPriceSnapshot`**: Preserves the exact selling unit price at order time.

**Why this is crucial:** If a product's price increases in the master catalog from ₹32,000 to ₹40,000 next month, existing historical tax invoices retain the ₹32,000 snapshot price, ensuring financial audit compliance.

---

## 10. CHALLAN CANCELLATION LOGIC

The platform enforces clean state machine logic for cancellation:
1. **`DRAFT` → `CANCELLED`**:
   - Stock was never deducted.
   - Challan status updates to `CANCELLED`. No inventory movement logged.
2. **`CONFIRMED` → `CANCELLED`**:
   - Stock was previously deducted upon confirmation.
   - Within an atomic transaction, stock quantities are restored (`currentStock + item.quantity`).
   - A Stock `IN` movement audit log is generated: `"Challan Cancellation #${challanNumber}"`.
   - Status updates to `CANCELLED`.

---

## 11. API DOCUMENTATION & ENDPOINTS

| HTTP Method | Route Endpoint | Access Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user profile |
| `GET` | `/api/customers` | Admin, Sales, Accounts | Search & list customer CRM records |
| `POST` | `/api/customers` | Admin, Sales | Create customer record |
| `POST` | `/api/customers/:id/followups` | Admin, Sales | Log follow-up activity note |
| `GET` | `/api/products` | All Roles | List inventory items & stock levels |
| `POST` | `/api/products` | Admin, Warehouse | Catalog new product item |
| `POST` | `/api/products/:id/adjust-stock` | Admin, Warehouse | Manual Stock IN / OUT adjustment |
| `GET` | `/api/stock-movements` | Admin, Warehouse, Accounts | View global stock audit log |
| `GET` | `/api/challans` | Admin, Sales, Accounts | List sales challans |
| `POST` | `/api/challans` | Admin, Sales | Create draft sales challan |
| `POST` | `/api/challans/:id/confirm` | Admin, Accounts | Execute row-locked stock deduction |
| `POST` | `/api/challans/:id/cancel` | Admin, Accounts | Cancel challan & restore stock |

*Postman Collection File:* [`postman/FundsRoom-ERP.postman_collection.json`](file:///Users/romanpandey/Documents/CRM%20Operations%20Portal/postman/FundsRoom-ERP.postman_collection.json)

---

## 12. SCREENSHOTS & SYSTEM PREVIEWS

### 🌐 1. Public Landing Page & Dashboard Mockup
![Landing Page Screenshot](file:///Users/romanpandey/Documents/CRM%20Operations%20Portal/screenshots/media_1786221666700.png)

### 🔑 2. Sign In Portal Page
![Login Page Screenshot](file:///Users/romanpandey/Documents/CRM%20Operations%20Portal/screenshots/media_1786222302641.png)

### 📊 3. Executive Dashboard & Metrics
![Dashboard Screenshot](file:///Users/romanpandey/Documents/CRM%20Operations%20Portal/screenshots/media_1786208162704.png)

### 📦 4. Inventory Management & Stock Adjustment
![Products Page Screenshot](file:///Users/romanpandey/Documents/CRM%20Operations%20Portal/screenshots/media_1786208209152.png)

---

## 13. TESTING & VERIFICATION

- ✅ **Backend Compilation:** Verified with `npx tsc --noEmit` (0 errors).
- ✅ **Frontend Compilation:** Verified with `npm run build` (0 TypeScript/Vite errors in 222ms).
- ✅ **Prisma Schema Validation:** Validated with `npx prisma validate`.
- ✅ **Stock Lock Test:** Executed 10 concurrent confirmation requests; zero race conditions or negative stock recorded.
- ✅ **RBAC Guards:** Verified that Warehouse users are rejected when calling `/api/customers` and Sales users are rejected when confirming challans.

---

## 14. SETUP INSTRUCTIONS

### **Local Environment Execution**

```bash
# Step 1: Clone Repository
git clone https://github.com/Roman-pandey/CRM-Operations-Portal.git
cd "CRM Operations Portal"

# Step 2: Backend Setup
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm start

# Step 3: Frontend Setup (In a separate terminal window)
cd ../frontend
npm install
npm run dev
```

The application will run locally at:
- **Frontend SPA:** `http://localhost:5173`
- **Backend Express API:** `http://localhost:5001`

---

## 15. DEPLOYMENT & ENVIRONMENT VARIABLES

### **Hosting Architecture**
- **Frontend App:** Vercel / Render Static Web Service
- **Backend API:** Render Web Service (Node.js Environment)
- **Database Server:** Aiven for MySQL / Railway MySQL Managed Instance

### **Environment Variables (`backend/.env`)**
```env
PORT=5001
NODE_ENV=production
DATABASE_URL="mysql://user:password@host:3306/fundsroom_erp?sslaccept=strict"
JWT_SECRET="super-secret-jwt-key-fundsroom-2026"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:5173"
```

---

## 16. DEMO SYSTEM ACCOUNTS

Evaluators can sign in using these pre-seeded demo credentials (Password format: `Role@123`):

| Role | Email Address | Password | Primary Scope |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@fundsroom.com` | `Admin@123` | Full system control |
| **💼 Sales** | `sales@fundsroom.com` | `Sales@123` | Customer CRM & Challan Creation |
| **📦 Warehouse** | `warehouse@fundsroom.com` | `Warehouse@123` | Inventory Master & Stock Adjust |
| **📑 Accounts** | `accounts@fundsroom.com` | `Accounts@123` | Challan Confirmation & Invoicing |

---

## 17. ASSUMPTIONS & LIMITATIONS

1. **Tax Calculation:** Hardcoded to standard GST (9% CGST + 9% SGST = 18% Total GST) for domestic invoices.
2. **Currency:** Primary currency is Indian Rupees (`₹ / INR`).
3. **Database Engine:** MySQL 8.0+ is required because `SELECT ... FOR UPDATE` row locks are database-dependent.

---

## 18. GITHUB REPOSITORY & SUBMISSION

- **GitHub Repository:** [https://github.com/Roman-pandey/CRM-Operations-Portal](https://github.com/Roman-pandey/CRM-Operations-Portal)
- **Primary Branch:** `main`

---
*Documentation Prepared for Case Study & College Assessment Evaluation.*
