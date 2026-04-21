# 🚀 Payroll Management System - Backend API

A complete, production-ready backend for a Payroll Management System inspired by Zoho Payroll.
Built with **Node.js, Express.js, MongoDB (Mongoose), JWT Authentication**.

---

## 📁 Folder Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication
│   ├── orgController.js         # Organization setup
│   ├── employeeController.js    # Employee management
│   ├── payrollController.js     # Payroll processing engine
│   ├── attendanceController.js  # Attendance & leave
│   ├── salaryController.js      # Salary structure management
│   ├── payslipController.js     # Payslip generation
│   ├── taxController.js         # Tax management & TDS
│   ├── reportController.js      # PF, ESI, Tax reports
│   ├── analyticsController.js   # Payroll analytics
│   ├── essController.js         # Employee self-service
│   ├── auditController.js       # Audit logs
│   ├── notificationController.js# Notifications
│   └── statutoryController.js   # Statutory compliance
├── models/
│   ├── User.js
│   ├── Employee.js
│   ├── Organization.js
│   ├── SalaryStructure.js
│   ├── Payroll.js
│   ├── Attendance.js
│   ├── Payslip.js
│   ├── TaxDeclaration.js
│   ├── AuditLog.js
│   ├── Statutory.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── orgRoutes.js
│   ├── employeeRoutes.js
│   ├── payrollRoutes.js
│   ├── attendanceRoutes.js
│   ├── salaryRoutes.js
│   ├── payslipRoutes.js
│   ├── taxRoutes.js
│   ├── reportRoutes.js
│   ├── analyticsRoutes.js
│   ├── essRoutes.js
│   ├── auditRoutes.js
│   ├── notificationRoutes.js
│   └── statutoryRoutes.js
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   ├── roleMiddleware.js        # RBAC
│   └── errorMiddleware.js       # Global error handler
├── utils/
│   ├── generateToken.js         # JWT token generator
│   ├── salaryCalculator.js      # Core payroll engine
│   └── auditLogger.js           # Audit logging utility
├── .env.example
├── package.json
├── server.js
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start Development Server
```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## 🔧 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/payroll_db
JWT_SECRET=supersecretkey_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| `super_admin` | Full access, org config, statutory rules |
| `payroll_admin` | Run payroll, approve, generate reports |
| `hr_admin` | Manage employees, assign salary structures |
| `employee` | View payslips, salary breakup, tax declarations |
| `finance` | View financial reports, audit records |

---

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api`

**Auth Header:** `Authorization: Bearer <token>`

---

### 🔐 Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login & get JWT token |
| GET | `/auth/me` | Private | Get current user |
| PUT | `/auth/password` | Private | Update password |
| GET | `/auth/users` | Admin | List all users |

**Login Request:**
```json
POST /api/auth/login
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "super_admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 🏢 Organization

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/org/setup` | Super Admin | Setup organization |
| GET | `/org` | Admin | Get organization details |
| PUT | `/org/:id` | Super Admin | Update organization |

---

### 📜 Statutory & Compliance

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/statutory` | Super Admin | Configure statutory rules |
| GET | `/statutory` | Admin | Get statutory config (PF, ESI, Tax slabs) |

---

### 👤 Employees

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/employees` | Admin | List all employees (pagination, filter) |
| GET | `/employees/:id` | Private | Get employee details |
| POST | `/employees` | HR Admin | Create employee |
| PUT | `/employees/:id` | HR Admin | Update employee |
| DELETE | `/employees/:id` | HR Admin | Terminate employee |
| GET | `/employees/departments` | Admin | Get department list |

**Create Employee:**
```json
POST /api/employees
{
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "9876543210",
  "department": "Engineering",
  "designation": "Software Engineer",
  "joiningDate": "2024-01-15",
  "salaryStructureId": "...",
  "taxRegime": "new",
  "bankAccount": {
    "accountNumber": "123456789",
    "bankName": "HDFC Bank",
    "ifscCode": "HDFC0001234"
  }
}
```

---

### 💰 Salary Structures

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/salary-structures` | Admin | List structures |
| GET | `/salary-structures/:id` | Admin | Get structure |
| POST | `/salary-structures` | HR Admin | Create structure |
| PUT | `/salary-structures/:id` | HR Admin | Update structure |
| POST | `/salary-structures/preview` | Admin | Preview calculation |

**Create Salary Structure:**
```json
POST /api/salary-structures
{
  "name": "Senior Engineer Band",
  "ctc": 1200000,
  "components": {
    "basic": { "type": "percentage", "value": 50 },
    "hra": { "type": "percentage", "value": 20 },
    "allowances": [
      { "name": "Travel Allowance", "type": "fixed", "value": 2000 },
      { "name": "Medical Allowance", "type": "fixed", "value": 1250 }
    ]
  },
  "pf": { "isApplicable": true, "employeeContribution": 12, "employerContribution": 12 },
  "esi": { "isApplicable": false },
  "professionalTax": { "isApplicable": true, "state": "Karnataka" }
}
```

---

### 📅 Attendance

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance` | HR Admin | Mark attendance (bulk/single) |
| GET | `/attendance` | Admin | Get all attendance |
| GET | `/attendance/summary` | Admin | Monthly attendance summary |
| GET | `/attendance/:employeeId` | Private | Employee attendance |

**Bulk Attendance:**
```json
POST /api/attendance
{
  "records": [
    { "employeeId": "...", "date": "2024-12-01", "status": "Present" },
    { "employeeId": "...", "date": "2024-12-01", "status": "Absent", "isLop": true }
  ]
}
```

---

### 🧮 Payroll Processing

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payroll/run` | Payroll Admin | Run monthly payroll |
| GET | `/payroll` | Admin | Get all payroll records |
| GET | `/payroll/detail/:id` | Admin | Get payroll detail |
| GET | `/payroll/:employeeId` | Private | Employee payroll history |
| PUT | `/payroll/:id/approve` | Payroll Admin | Approve payroll |
| PUT | `/payroll/:id/pay` | Payroll Admin | Mark as paid |

**Run Payroll:**
```json
POST /api/payroll/run
{
  "month": 12,
  "year": 2024
}
```

---

### 🧾 Payslips

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/payslips` | Admin | All payslips |
| GET | `/payslips/:employeeId` | Private | Employee payslips |
| GET | `/payslips/download/:payrollId` | Private | Get payslip data |

---

### 🏦 Tax Management

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/tax/declaration` | Private | Submit IT declaration |
| POST | `/tax/proofs` | Private | Submit proof documents |
| POST | `/tax/calculate` | Private | Calculate tax preview |
| GET | `/tax` | Admin | All declarations |
| GET | `/tax/:employeeId` | Private | Employee tax |

---

### 📊 Statutory Reports (CSV Export Supported)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/reports/pf?month=12&year=2024` | Admin | PF Report |
| GET | `/reports/esi?month=12&year=2024` | Admin | ESI Report |
| GET | `/reports/tax?month=12&year=2024` | Admin | TDS Report |

Add `&format=csv` to any report URL for CSV download.

---

### 📈 Analytics

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/analytics/payroll-summary?year=2024` | Admin | Annual payroll summary |
| GET | `/analytics/department-cost?month=12&year=2024` | Admin | Dept-wise cost |
| GET | `/analytics/headcount` | Admin | Employee headcount |

---

### 👨‍💼 Employee Self Service (ESS)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/ess/payslips` | Employee | My payslips |
| GET | `/ess/salary-breakup` | Employee | My salary breakup |
| GET | `/ess/profile` | Employee | My profile |

---

### 🔔 Notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/notifications` | Admin | Send notification |
| GET | `/notifications` | Private | My notifications |
| PUT | `/notifications/:id/read` | Private | Mark as read |

---

### 📋 Audit Logs

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/audit-logs` | Admin | All audit logs (paginated) |

---

## 📝 Standard API Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔑 Token Storage (Frontend Integration)

The frontend stores the JWT token in:
```javascript
localStorage.setItem('payroll_token', token);
```

All protected requests use:
```javascript
headers: { Authorization: `Bearer ${token}` }
```

If a 401 is returned → frontend automatically logs out user.

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens with configurable expiry
- Role-Based Access Control (RBAC) on every route
- Global error handler with environment-aware stack traces
- MongoDB injection protection via Mongoose validators
- CORS configured for React dev server (ports 5173, 3000, 5174)

---

## 🧮 Salary Calculation Engine

The `salaryCalculator.js` handles:
- Basic salary (fixed or % of CTC)
- HRA (fixed or % of basic)
- Custom allowances (fixed or %)
- PF: 12% of basic (capped at ₹15,000 wage)
- ESI: 0.75% employee / 3.25% employer (if gross ≤ ₹21,000)
- Professional Tax (state-wise slabs)
- Loss of Pay (LOP) deductions
- Overtime calculation (2x rate)
- Income Tax (Old & New Regime FY 2024-25)

---

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use MongoDB Atlas for cloud database
3. Set a strong `JWT_SECRET`
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name payroll-api
```
