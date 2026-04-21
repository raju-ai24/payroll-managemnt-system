# 🚀 PayrollPro – Enterprise Payroll Management System

PayrollPro is a **full-stack enterprise payroll management platform** designed to automate employee payroll processing, salary management, statutory compliance, and payroll analytics.

The platform provides **secure authentication, role-based access control, payroll automation, statutory deductions configuration, and detailed reporting** — making payroll processing efficient and scalable for organizations.

This project was built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with a modular backend architecture and a modern responsive frontend interface.

---

# 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Core Features](#-core-features)
- [Complete Workflow](#-complete-workflow)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Project Structure](#-project-structure)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributors](#-contributors)
- [License](#-license)

---

# 🧠 Project Overview

Managing payroll manually can be complex and error-prone. PayrollPro simplifies this by providing a centralized platform where organizations can:

- **Manage employees** - Complete employee lifecycle management
- **Configure statutory deductions** - PF, ESI, Professional Tax, Income Tax
- **Generate payroll automatically** - Automated salary calculations with attendance integration
- **Produce payslips and reports** - Detailed payslips and statutory reports
- **Track payroll history** - Complete audit trail and payroll analytics
- **Employee self-service** - Employees can view their payslips, salary breakup, tax declarations

The system is designed to simulate **real enterprise payroll workflows** used in modern organizations, with support for Indian statutory compliance requirements.

---

# 🛠 Tech Stack

## Frontend

- **React.js** - UI framework with hooks and functional components
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **Recharts** - Data visualization charts
- **Lucide Icons** - Modern icon library
- **React Toastify** - Toast notifications
- **jsPDF** - PDF generation for payslips

## Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Database

- **MongoDB** - Document database with cloud hosting support (MongoDB Atlas)

---

# ✨ Core Features

## 🔐 Authentication & Role Based Access Control

Secure login system with JWT-based authentication and multiple user roles:

- **Super Admin** - Full system access, organization setup, statutory configuration
- **Payroll Admin** - Run payroll, approve payroll, generate reports
- **HR Admin** - Manage employees, assign salary structures, manage attendance
- **Employee** - View payslips, salary breakup, tax declarations, update profile
- **Finance** - View financial reports, audit records

Each role has **restricted access to specific modules** with granular permission control.

## 🏢 Organization Management

- Organization setup with company details
- Configure payroll environment and policies
- Manage company-wide statutory rules
- Multi-organization support architecture

## 👥 Employee Management

- Add, edit, and manage employee profiles
- Employee onboarding workflow
- Department and designation management
- Bank account details management
- Document management (PAN, UAN, ESI)
- Employee status tracking (Active, Inactive, On Leave)

## 💰 Salary Structure Management

- Define salary components (Basic, HRA, Allowances)
- Flexible component configuration (fixed amount or percentage)
- Manage allowances and deductions
- Configure salary breakdown per employee
- Salary preview calculator
- Bulk salary structure assignment

## ⚙️ Statutory Configuration

Supports configuration of statutory deductions including:

- **Provident Fund (PF)** - Employee and employer contribution rates
- **Employee State Insurance (ESI)** - Applicability thresholds and rates
- **Professional Tax** - State-wise tax slabs
- **Income Tax** - Old and New Regime tax slabs (FY 2024-25)
- **Gratuity** - Configuration and calculation rules

## 📅 Attendance Management

- Daily attendance marking
- Bulk attendance import
- Leave management integration
- Loss of Pay (LOP) calculation
- Overtime tracking
- Monthly attendance summary

## 🧾 Payroll Processing

- Run monthly payroll with one click
- Automated salary calculations
- Attendance-based salary adjustments
- LOP deductions
- Overtime calculations
- Bonus and incentive processing
- Payroll preview before finalization
- Approval workflow
- Multi-stage payroll processing (Ready → Processing → Preview → Approved → Paid)

## 🧾 Payslip Generation

- Automatic payslip generation on payroll approval
- Detailed salary breakdown (earnings and deductions)
- PDF download support
- Email payslip to employees
- Historical payslip access
- Salary certificate generation

## 📊 Reports & Analytics

- **Payroll Reports** - Monthly, quarterly, annual summaries
- **Statutory Reports** - PF, ESI, Professional Tax, TDS reports
- **Department Reports** - Cost analysis by department
- **Employee Reports** - Salary history, tax summaries
- **Audit Logs** - Complete system activity tracking
- **Analytics Dashboard** - Real-time payroll insights
- **CSV Export** - Download reports in CSV format

## 👨‍💼 Employee Self Service (ESS)

- View personal payslips
- Access salary breakup details
- Submit tax declarations
- Upload investment proofs
- Update personal information
- Upload profile photo
- View attendance records
- Download tax documents

## 🔔 Notifications

- In-app notification system
- Email notifications (configurable)
- Payroll processing alerts
- Approval request notifications
- Compliance deadline reminders

## 📋 Audit Logs

- Complete audit trail of all system activities
- User action tracking
- Payroll modification history
- Compliance audit reports
- Exportable audit logs

---

# 🔄 Complete Workflow

## 1. Initial Setup Workflow

```
Step 1: Organization Setup (Super Admin)
├─ Login as Super Admin
├─ Navigate to Organization Setup
├─ Enter company details
├─ Configure statutory rules (PF, ESI, PT, Tax)
└─ Save configuration

Step 2: Create Salary Structures (HR Admin)
├─ Navigate to Salary Structure
├─ Create salary bands/structures
├─ Define components (Basic, HRA, Allowances)
├─ Set statutory applicability
└─ Save structure

Step 3: Add Employees (HR Admin)
├─ Navigate to Employee Management
├─ Add new employee
├─ Fill personal and professional details
├─ Assign salary structure
├─ Add bank account details
└─ Save employee

Step 4: Mark Attendance (HR Admin)
├─ Navigate to Attendance
├─ Select month/year
├─ Mark daily attendance or bulk import
├─ Apply leave adjustments
└─ Save attendance
```

## 2. Monthly Payroll Workflow

```
Step 1: Tax Declarations (Employees)
├─ Employees login to ESS portal
├─ Navigate to Tax Management
├─ Submit IT declarations
├─ Upload investment proofs
└─ Submit for approval

Step 2: Run Payroll (Payroll Admin)
├─ Navigate to Run Payroll
├─ Select month/year
├─ Select employees (or run for all)
├─ Click "Run Payroll"
├─ System calculates salaries automatically
├─ Review payroll preview
└─ Submit for approval

Step 3: Approve Payroll (Payroll Admin)
├─ Navigate to Payroll Preview
├─ Review calculated payroll
├─ Verify totals and deductions
├─ Click "Approve Payroll"
├─ System generates payslips
└─ Payroll status changes to "Approved"

Step 4: Mark as Paid (Payroll Admin/Finance)
├─ Navigate to Payroll History
├─ Select approved payroll
├─ Click "Mark as Paid"
├─ Enter payment details
└─ Complete process

Step 5: View Payslips (Employees)
├─ Employees login to ESS portal
├─ Navigate to My Payslips
├─ View/download payslips
└─ Access salary details
```

## 3. Reporting Workflow

```
Step 1: Generate Statutory Reports
├─ Navigate to Reports
├─ Select report type (PF, ESI, Tax)
├─ Select month/year
├─ Click "Generate Report"
├─ View report data
└─ Download as CSV if needed

Step 2: Generate Analytics Reports
├─ Navigate to Dashboard
├─ View real-time analytics
├─ Filter by date range
├─ Export charts/data
└─ Share with stakeholders

Step 3: Audit Trail Review
├─ Navigate to Audit Logs
├─ Filter by date/user/action
├─ Review system activities
└─ Export for compliance
```

---

# ⚙️ Installation & Setup

## Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v6.0 or higher) - Local installation or MongoDB Atlas
- **npm** or **yarn** package manager
- **Git** for version control

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd Payroll-management-system
```

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/payroll_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 4️⃣ Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with default credentials
3. Complete organization setup (for Super Admin)
4. Start using the payroll system

---

# 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** All protected endpoints require `Authorization: Bearer <token>` header

## Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login and get JWT token |
| GET | `/auth/me` | Private | Get current user profile |
| PUT | `/auth/password` | Private | Update password |
| GET | `/auth/users` | Admin | List all users |

**Login Request Example:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Login Response Example:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "super_admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Organization Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/org/setup` | Super Admin | Setup organization |
| GET | `/org` | Admin | Get organization details |
| PUT | `/org/:id` | Super Admin | Update organization |

## Employee Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/employees` | Admin | List all employees (paginated) |
| GET | `/employees/:id` | Private | Get employee details |
| POST | `/employees` | HR Admin | Create employee |
| PUT | `/employees/:id` | HR Admin | Update employee |
| DELETE | `/employees/:id` | HR Admin | Terminate employee |
| GET | `/employees/departments` | Admin | Get department list |

## Salary Structure Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/salary-structures` | Admin | List structures |
| GET | `/salary-structures/:id` | Admin | Get structure |
| POST | `/salary-structures` | HR Admin | Create structure |
| PUT | `/salary-structures/:id` | HR Admin | Update structure |
| POST | `/salary-structures/preview` | Admin | Preview calculation |

## Attendance Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance` | HR Admin | Mark attendance (bulk/single) |
| GET | `/attendance` | Admin | Get all attendance |
| GET | `/attendance/summary` | Admin | Monthly attendance summary |
| GET | `/attendance/:employeeId` | Private | Employee attendance |

## Payroll Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payroll/run` | Payroll Admin | Run monthly payroll |
| GET | `/payroll` | Finance | Get all payroll records |
| GET | `/payroll/history` | Finance | Get payroll history |
| GET | `/payroll/preview` | Finance | Get payroll preview |
| GET | `/payroll/detail/:id` | Finance | Get payroll detail |
| GET | `/payroll/:employeeId` | Private | Employee payroll history |
| PUT | `/payroll/:id/approve` | Payroll Admin | Approve payroll |
| PUT | `/payroll/:id/pay` | Payroll Admin | Mark as paid |
| POST | `/payroll/lock-approved` | Payroll Admin | Lock approved entries |

## Payslip Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/payslips` | Admin | All payslips |
| GET | `/payslips/:employeeId` | Private | Employee payslips |
| GET | `/payslips/download/:payrollId` | Private | Get payslip data |

## Tax Management Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/tax/declaration` | Private | Submit IT declaration |
| POST | `/tax/proofs` | Private | Submit proof documents |
| POST | `/tax/calculate` | Private | Calculate tax preview |
| GET | `/tax` | Admin | All declarations |
| GET | `/tax/:employeeId` | Private | Employee tax |

## Report Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/reports/pf?month=12&year=2024` | Admin | PF Report |
| GET | `/reports/esi?month=12&year=2024` | Admin | ESI Report |
| GET | `/reports/tax?month=12&year=2024` | Admin | TDS Report |
| GET | `/reports/department?month=12&year=2024` | Admin | Department Report |
| GET | `/reports/monthly-trend?year=2024` | Admin | Monthly Trend |
| GET | `/reports/ctc` | Admin | CTC Analysis |

Add `&format=csv` to any report URL for CSV download.

## Analytics Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/analytics/monthly?year=2024` | Admin | Annual payroll summary |
| GET | `/analytics/departments?month=12&year=2024` | Admin | Dept-wise cost |
| GET | `/analytics/salary-breakdown?month=12&year=2024` | Admin | Salary breakdown |
| GET | `/analytics/headcount` | Admin | Employee headcount |

## Approval Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/approvals` | Admin | Get pending approvals |
| PUT | `/approvals/:id/approve` | Admin | Approve request |
| PUT | `/approvals/:id/reject` | Admin | Reject request |

## Alert Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/alerts` | Admin | Get system alerts |

## ESS (Employee Self Service) Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/ess/payslips` | Employee | My payslips |
| GET | `/ess/salary-breakup` | Employee | My salary breakup |
| GET | `/ess/profile` | Employee | My profile |
| PUT | `/ess/profile` | Employee | Update profile |
| GET | `/ess/data` | Employee | My dashboard data |
| GET | `/ess/notifications` | Employee | My notifications |

## Audit Log Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/audit-logs` | Admin | All audit logs (paginated) |

---

# 🗄 Database Schema

## Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum['super_admin', 'payroll_admin', 'hr_admin', 'employee', 'finance'],
  organization: ObjectId (ref: Organization),
  createdAt: Date,
  updatedAt: Date
}
```

## Employees Collection

```javascript
{
  _id: ObjectId,
  employeeCode: String (unique),
  name: String,
  email: String,
  phone: String,
  department: String,
  designation: String,
  joiningDate: Date,
  status: Enum['active', 'inactive', 'on_leave'],
  salaryStructureId: ObjectId (ref: SalaryStructure),
  bankAccount: {
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  statutoryDetails: {
    panNumber: String,
    uanNumber: String,
    esiNumber: String
  },
  taxRegime: Enum['old', 'new'],
  organization: ObjectId (ref: Organization),
  createdAt: Date,
  updatedAt: Date
}
```

## SalaryStructures Collection

```javascript
{
  _id: ObjectId,
  name: String,
  annualCTC: Number,
  components: {
    basic: { type: Enum['fixed', 'percentage'], value: Number },
    hra: { type: Enum['fixed', 'percentage'], value: Number },
    allowances: [{
      name: String,
      type: Enum['fixed', 'percentage'],
      value: Number
    }]
  },
  pf: {
    isApplicable: Boolean,
    employeeContribution: Number,
    employerContribution: Number
  },
  esi: {
    isApplicable: Boolean,
    employeeContribution: Number,
    employerContribution: Number
  },
  professionalTax: {
    isApplicable: Boolean,
    state: String,
    amount: Number
  },
  organization: ObjectId (ref: Organization),
  createdAt: Date,
  updatedAt: Date
}
```

## Payrolls Collection

```javascript
{
  _id: ObjectId,
  month: Number,
  year: Number,
  organization: ObjectId (ref: Organization),
  payrollEntries: [{
    employeeId: ObjectId (ref: Employee),
    salaryStructureId: ObjectId (ref: SalaryStructure),
    earnings: {
      basic: Number,
      hra: Number,
      specialAllowance: Number,
      lta: Number,
      overtime: Number
    },
    deductions: {
      pf: Number,
      esi: Number,
      professionalTax: Number,
      incomeTax: Number,
      totalDeductions: Number
    },
    grossSalary: Number,
    netSalary: Number,
    attendance: {
      presentDays: Number,
      lopDays: Number,
      overtimeHours: Number
    },
    status: Enum['processed', 'locked']
  }],
  summary: {
    totalEmployees: Number,
    totalGross: Number,
    totalDeductions: Number,
    totalNetPay: Number,
    totalPF: Number,
    totalESI: Number,
    totalTax: Number
  },
  status: Enum['pending_approval', 'approved', 'paid'],
  createdBy: ObjectId (ref: User),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Payslips Collection

```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Employee),
  payrollId: ObjectId (ref: Payroll),
  month: Number,
  year: Number,
  employeeDetails: {
    name: String,
    employeeCode: String,
    designation: String,
    department: String,
    panNumber: String,
    uanNumber: String,
    bankAccount: String,
    dateOfJoining: Date
  },
  earnings: Object,
  deductions: Object,
  attendance: Object,
  grossSalary: Number,
  netSalary: Number,
  organization: ObjectId (ref: Organization),
  createdAt: Date
}
```

## Organizations Collection

```javascript
{
  _id: ObjectId,
  name: String,
  legalName: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String
  },
  statutoryConfig: {
    pf: {
      employeeRate: Number,
      employerRate: Number,
      wageLimit: Number
    },
    esi: {
      employeeRate: Number,
      employerRate: Number,
      wageLimit: Number
    },
    professionalTax: {
      state: String,
      slabs: Array
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## AuditLogs Collection

```javascript
{
  _id: ObjectId,
  action: String,
  module: String,
  performedBy: ObjectId (ref: User),
  performedByName: String,
  targetId: ObjectId,
  targetType: String,
  changes: Object,
  ipAddress: String,
  userAgent: String,
  organization: ObjectId (ref: Organization),
  createdAt: Date
}
```

---

# 👥 User Roles & Permissions

## Role Hierarchy

```
Super Admin (Highest Privilege)
    ├── Full system access
    ├── Organization setup
    ├── Statutory configuration
    └── User management

Payroll Admin
    ├── Run payroll
    ├── Approve payroll
    ├── Generate reports
    └── View analytics

HR Admin
    ├── Manage employees
    ├── Assign salary structures
    ├── Manage attendance
    └── View employee data

Finance
    ├── View financial reports
    ├── Access audit logs
    └── View payroll history

Employee (Lowest Privilege)
    ├── View own payslips
    ├── View salary breakup
    ├── Submit tax declarations
    └── Update profile
```

## Module Access Matrix

| Module | Super Admin | Payroll Admin | HR Admin | Finance | Employee |
|--------|-------------|---------------|----------|---------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organization | ✅ | ❌ | ❌ | ❌ | ❌ |
| Statutory Config | ✅ | ❌ | ❌ | ❌ | ❌ |
| Employees | ✅ | ❌ | ✅ | ❌ | ❌ |
| Salary Structure | ✅ | ❌ | ✅ | ❌ | ❌ |
| Attendance | ✅ | ❌ | ✅ | ❌ | ❌ |
| Run Payroll | ✅ | ✅ | ❌ | ❌ | ❌ |
| Payslips | ✅ | ✅ | ✅ | ✅ | Own |
| Tax Management | ✅ | ❌ | ✅ | ✅ | Own |
| Reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ✅ | ❌ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ |

---

# 📂 Project Structure

```
Payroll-management-system/
│
├── assets/                          # Project screenshots and images
│   ├── Login_Page.jpeg
│   ├── Dashboard-1.jpeg
│   ├── Employee_page.jpeg
│   ├── Salary_Structure-1.jpeg
│   ├── Statutory_Config.jpeg
│   ├── Run_payroll.jpeg
│   ├── Payslips.jpeg
│   └── Reports.jpeg
│
├── backend/                         # Backend API server
│   ├── config/
│   │   └── db.js                   # MongoDB connection configuration
│   ├── controllers/                # Request handlers
│   │   ├── authController.js       # Authentication logic
│   │   ├── orgController.js        # Organization management
│   │   ├── employeeController.js   # Employee CRUD operations
│   │   ├── payrollController.js    # Payroll processing engine
│   │   ├── attendanceController.js # Attendance management
│   │   ├── salaryController.js     # Salary structure logic
│   │   ├── payslipController.js    # Payslip generation
│   │   ├── taxController.js        # Tax calculations
│   │   ├── reportController.js     # Report generation
│   │   ├── analyticsController.js  # Analytics data
│   │   ├── essController.js        # Employee self-service
│   │   ├── auditController.js      # Audit logging
│   │   ├── notificationController.js
│   │   ├── approvalController.js   # Approval workflow
│   │   └── statutoryController.js  # Statutory compliance
│   ├── middleware/                 # Custom middleware
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── roleMiddleware.js      # Role-based access control
│   │   └── errorMiddleware.js     # Global error handler
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Organization.js
│   │   ├── SalaryStructure.js
│   │   ├── Payroll.js
│   │   ├── Payslip.js
│   │   ├── Attendance.js
│   │   ├── TaxDeclaration.js
│   │   ├── AuditLog.js
│   │   ├── Statutory.js
│   │   └── Notification.js
│   ├── routes/                     # API route definitions
│   │   ├── authRoutes.js
│   │   ├── orgRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── payrollRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── salaryRoutes.js
│   │   ├── payslipRoutes.js
│   │   ├── taxRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── essRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── approvalRoutes.js
│   │   └── statutoryRoutes.js
│   ├── utils/                      # Utility functions
│   │   ├── generateToken.js        # JWT token generation
│   │   ├── salaryCalculator.js     # Core payroll calculation engine
│   │   └── auditLogger.js          # Audit logging utility
│   ├── .env                        # Environment variables
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Express server entry point
│
├── frontend/                       # React frontend application
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios configuration
│   │   ├── components/
│   │   │   ├── layout/            # Layout components
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── ui/                # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── pages/
│   │   │   ├── auth/              # Authentication pages
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── dashboard/          # Dashboard page
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── employees/         # Employee management
│   │   │   │   ├── EmployeeList.jsx
│   │   │   │   └── EmployeeProfile.jsx
│   │   │   ├── payroll/           # Payroll pages
│   │   │   │   ├── PayrollRun.jsx
│   │   │   │   └── PayrollPreview.jsx
│   │   │   ├── salary/            # Salary structure
│   │   │   │   └── SalaryStructure.jsx
│   │   │   ├── attendance/        # Attendance management
│   │   │   │   └── AttendanceManagement.jsx
│   │   │   ├── statutory/         # Statutory configuration
│   │   │   │   └── StatutoryConfig.jsx
│   │   │   ├── payslip/           # Payslip viewing
│   │   │   │   └── PayslipView.jsx
│   │   │   ├── tax/               # Tax management
│   │   │   │   └── TaxManagement.jsx
│   │   │   ├── reports/           # Reports and analytics
│   │   │   │   └── Reports.jsx
│   │   │   ├── ess/               # Employee self-service
│   │   │   │   ├── EmployeeSelfService.jsx
│   │   │   │   ├── MyProfile.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Notifications.jsx
│   │   │   ├── audit/             # Audit logs
│   │   │   │   └── AuditLogs.jsx
│   │   │   └── organization/      # Organization setup
│   │   │       └── OrganizationSetup.jsx
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   ├── .env                        # Frontend environment variables
│   ├── package.json                # Frontend dependencies
│   ├── tailwind.config.js          # Tailwind configuration
│   └── vite.config.js              # Vite configuration
│
└── README.md                       # This file
```

---

# 🚀 Deployment Guide

## Production Deployment Steps

### 1. Environment Configuration

**Backend (.env):**
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/payroll_db?retryWrites=true&w=majority
JWT_SECRET=<strong_random_secret_key_min_32_chars>
JWT_EXPIRE=7d
NODE_ENV=production
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-domain.com/api
```

### 2. Database Setup

**Option 1: MongoDB Atlas (Recommended)**
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your server IP address
5. Copy the connection string to `.env`

**Option 2: Self-hosted MongoDB**
1. Install MongoDB on your server
2. Configure authentication
3. Set up replication for production
4. Update connection string in `.env`

### 3. Backend Deployment

**Using PM2 (Process Manager):**
```bash
cd backend
npm install --production
npm install -g pm2
pm2 start server.js --name payroll-api
pm2 save
pm2 startup
```

**Using Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t payroll-api .
docker run -p 5000:5000 --env-file .env payroll-api
```

### 4. Frontend Deployment

**Build for Production:**
```bash
cd frontend
npm run build
```

**Deploy to Vercel/Netlify:**
1. Connect your Git repository
2. Configure build settings
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables
4. Deploy

**Deploy to VPS (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Security Considerations

- Use strong JWT secrets (minimum 32 characters)
- Enable HTTPS (SSL/TLS certificate)
- Configure CORS for production domain only
- Rate limiting on authentication endpoints
- Regular database backups
- Monitor audit logs for suspicious activity
- Keep dependencies updated
- Use environment-specific configurations

---

# 🔧 Troubleshooting

## Common Issues

### 1. MongoDB Connection Failed

**Problem:** `MongoNetworkError: failed to connect to server`

**Solutions:**
- Check MongoDB connection string in `.env`
- Verify MongoDB server is running
- Check network/firewall settings
- For MongoDB Atlas, whitelist your IP address

### 2. CORS Errors

**Problem:** `Access-Control-Allow-Origin` error

**Solutions:**
- Update CORS configuration in `server.js`
- Add your frontend domain to allowed origins
- Check if using correct protocol (http vs https)

### 3. JWT Token Expired

**Problem:** `401 Unauthorized` error

**Solutions:**
- User needs to login again
- Check `JWT_EXPIRE` in `.env`
- Verify JWT_SECRET is consistent

### 4. Payroll Calculation Errors

**Problem:** Incorrect salary calculations

**Solutions:**
- Verify salary structure configuration
- Check attendance data for the month
- Review statutory configuration
- Check tax regime settings (old vs new)

### 5. Frontend Build Errors

**Problem:** Build fails with errors

**Solutions:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (should be v16+)
- Verify all environment variables are set
- Check for circular dependencies in imports

### 6. Port Already in Use

**Problem:** `EADDRINUSE: address already in use`

**Solutions:**
```bash
# Find process using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

---

# 👩‍💻 Contributors

## Backend Development

**Asifa Firdhouse**

- Backend architecture design
- REST API development
- MongoDB database schema design
- Authentication & authorization implementation
- Payroll processing logic
- Salary calculation engine

## Frontend Development

**Savita**

- UI/UX design
- React frontend development
- Dashboard components
- Backend API integration
- State management
- Responsive design

## Project Lead

**RAJ BHATT**

- Project architecture
- Requirement analysis
- Code review and quality assurance
- Deployment coordination
- Documentation

---

# 🚀 Future Enhancements

- [ ] Email notifications for payroll processing
- [ ] SMS alerts for important notifications
- [ ] Payslip PDF export with company branding
- [ ] Multi-organization support (SaaS)
- [ ] Advanced payroll analytics with AI insights
- [ ] Mobile app (React Native)
- [ ] Integration with accounting software (Tally, QuickBooks)
- [ ] Biometric attendance integration
- [ ] Leave management module
- [ ] Loan and advance management
- [ ] Reimbursement processing
- [ ] Performance-based bonuses
- [ ] Variable pay components
- [ ] Gratuity calculation and tracking
- [ ] Bonus and ex-gratia management
- [ ] Investment declaration workflow
- [ ] Tax planning tools
- [ ] Compliance calendar with reminders
- [ ] Multi-currency support
- [ ] Localization for multiple languages

---


# 🤝 Support

For support and questions:
- Create an issue on GitHub


**Built with ❤️ by the PayrollPro Team**