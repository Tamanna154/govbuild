import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/buildings" element={<ProtectedRoute><BuildingsPage /></ProtectedRoute>} />
          <Route path="/buildings/:id" element={<ProtectedRoute><BuildingDetailsPage /></ProtectedRoute>} />
          <Route path="/gis-map" element={<ProtectedRoute><GisMapPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
          <Route path="/assets/:id" element={<ProtectedRoute><AssetDetailsPage /></ProtectedRoute>} />
          <Route path="/scan-qr" element={<ProtectedRoute><ScanQrPage /></ProtectedRoute>} />
          <Route path="/dependencies" element={<ProtectedRoute><DependencyGraphPage /></ProtectedRoute>} />
          <Route path="/inspections" element={<ProtectedRoute><InspectionsPage /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
          <Route path="/failures" element={<ProtectedRoute><FailuresPage /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><RiskDashboardPage /></ProtectedRoute>} />
          <Route path="/sensor-simulator" element={<ProtectedRoute><SensorSimulatorPage /></ProtectedRoute>} />
          <Route path="/warranties" element={<ProtectedRoute><WarrantiesPage /></ProtectedRoute>} />
          <Route path="/amc" element={<ProtectedRoute><WarrantiesPage /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
          <Route path="/demo-walkthrough" element={<ProtectedRoute><DemoWalkthroughPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
