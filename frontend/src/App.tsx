import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Pages & Layouts
import LoginPage from './pages/auth/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

import AssetsPage from './pages/admin/AssetsPage';
import AssetDetailPage from './pages/admin/AssetDetailPage';
import LocationsPage from './pages/admin/LocationsPage';
import UsersPage from './pages/admin/UsersPage';
import DashboardPage from './pages/admin/DashboardPage';

import ScanPage from './pages/user/ScanPage';
import AssetDetailUserPage from './pages/user/AssetDetailUserPage';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/scan'} replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/scan'} replace />;
  }
  return <>{children}</>;
};

// Routing logic

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        
        {/* Administrator Base Interface */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="scan/asset/:assetCode" element={<AssetDetailUserPage />} />
        </Route>

        {/* Scan Native Application for regular employees */}
        <Route path="/scan" element={<ProtectedRoute allowedRoles={['user', 'admin']}><UserLayout /></ProtectedRoute>}>
           <Route index element={<ScanPage />} />
           <Route path="asset/:assetCode" element={<AssetDetailUserPage />} />
        </Route>

        {/* Global Redirect Core */}
        <Route path="/" element={<ProtectedRoute><Navigate to="/login" replace /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
