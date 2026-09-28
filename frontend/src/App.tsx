import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Role } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { BuildingDetailsPage } from './pages/BuildingDetailsPage';
import { GisMapPage } from './pages/GisMapPage';
import { AssetsPage } from './pages/AssetsPage';
import { AssetDetailsPage } from './pages/AssetDetailsPage';
import { ScanQrPage } from './pages/ScanQrPage';
import { DependencyGraphPage } from './pages/DependencyGraphPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { FailuresPage } from './pages/FailuresPage';
import { RiskDashboardPage } from './pages/RiskDashboardPage';
import { SensorSimulatorPage } from './pages/SensorSimulatorPage';
import { WarrantiesPage } from './pages/WarrantiesPage';
import { VendorsPage } from './pages/VendorsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { DemoWalkthroughPage } from './pages/DemoWalkthroughPage';
import { LoginPage } from './pages/LoginPage';
import { CitizenGrievancePage } from './pages/CitizenGrievancePage';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-x-hidden max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Role-Protected Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          <Route
            path="/citizen-grievance"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'VIEWER', 'SUPER_ADMIN']}>
                <CitizenGrievancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buildings"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'VIEWER', 'INSPECTOR', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <BuildingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buildings/:id"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'VIEWER', 'INSPECTOR', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <BuildingDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gis-map"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'VIEWER', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <GisMapPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets"
            element={
              <ProtectedRoute allowedRoles={['INSPECTOR', 'TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <AssetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets/:id"
            element={
              <ProtectedRoute allowedRoles={['INSPECTOR', 'TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <AssetDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scan-qr"
            element={
              <ProtectedRoute allowedRoles={['INSPECTOR', 'TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <ScanQrPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dependencies"
            element={
              <ProtectedRoute allowedRoles={['ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <DependencyGraphPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspections"
            element={
              <ProtectedRoute allowedRoles={['INSPECTOR', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <InspectionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <MaintenancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/failures"
            element={
              <ProtectedRoute allowedRoles={['INSPECTOR', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <FailuresPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/risk"
            element={
              <ProtectedRoute allowedRoles={['ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <RiskDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sensor-simulator"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SensorSimulatorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warranties"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <WarrantiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/amc"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN', 'ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN']}>
                <WarrantiesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DEPT_ADMIN']}>
                <VendorsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['ENGINEER', 'DEPT_ADMIN', 'SUPER_ADMIN', 'VIEWER']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/demo-walkthrough"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DEPT_ADMIN', 'ENGINEER']}>
                <DemoWalkthroughPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
