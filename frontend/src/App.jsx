import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import OrganizationSetup from './pages/organization/OrganizationSetup';
import StatutoryConfig from './pages/statutory/StatutoryConfig';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import SalaryStructure from './pages/salary/SalaryStructure';
import AttendanceManagement from './pages/attendance/AttendanceManagement';
import PayrollRun from './pages/payroll/PayrollRun';
import PayrollPreview from './pages/payroll/PayrollPreview';
import PayslipView from './pages/payslip/PayslipView';
import TaxManagement from './pages/tax/TaxManagement';
import Reports from './pages/reports/Reports';
import EmployeeSelfService from './pages/ess/EmployeeSelfService';
import MyProfile from './pages/ess/MyProfile';
import Settings from './pages/ess/Settings';
import Notifications from './pages/ess/Notifications';
import AuditLogs from './pages/audit/AuditLogs';

const SIDEBAR_FULL = 240;
const SIDEBAR_COLLAPSED = 64;

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarW = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{ marginLeft: sidebarW, transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>
        <Navbar sidebarWidth={sidebarW} />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Unauthorized() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Access Denied</h2>
      <p style={{ color: '#64748b' }}>You don't have permission to access this page.</p>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === ROLES.EMPLOYEE ? '/ess' : '/dashboard'} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* App Layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/organization" element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]}><OrganizationSetup /></ProtectedRoute>} />
        <Route path="/statutory" element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.PAYROLL_ADMIN]}><StatutoryConfig /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute module="employees"><EmployeeList /></ProtectedRoute>} />
        <Route path="/employees/:id" element={<ProtectedRoute module="employees"><EmployeeProfile /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute module="salary"><SalaryStructure /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute module="attendance"><AttendanceManagement /></ProtectedRoute>} />
        <Route path="/payroll" element={<ProtectedRoute module="payroll"><PayrollRun /></ProtectedRoute>} />
        <Route path="/payroll/preview" element={<ProtectedRoute module="payroll"><PayrollPreview /></ProtectedRoute>} />
        <Route path="/payslip" element={<ProtectedRoute module="payslip"><PayslipView /></ProtectedRoute>} />
        <Route path="/tax" element={<ProtectedRoute module="tax"><TaxManagement /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
        <Route path="/ess" element={<ProtectedRoute module="ess"><EmployeeSelfService /></ProtectedRoute>} />
        <Route path="/ess/notifications" element={<ProtectedRoute module="ess"><Notifications /></ProtectedRoute>} />
        <Route path="/ess/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/ess/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute module="audit"><AuditLogs /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
