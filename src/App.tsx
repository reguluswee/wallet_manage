import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Departments } from './pages/Departments';
import { Personnel } from './pages/Personnel';
import Payroll from './pages/Payroll';
import PayrollStaff from './pages/PayrollStaff';
import TenantManagement from './pages/TenantManagement';
import Payslips from './pages/Payslips';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import { ToastProvider } from './contexts/ToastContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="departments" element={<Departments />} />
            <Route path="personnel" element={<Personnel />} />
            <Route path="roles" element={<Roles />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="payroll-staff" element={<PayrollStaff />} />
            <Route path="payslips" element={<Payslips />} />
            <Route path="tenants" element={<TenantManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
