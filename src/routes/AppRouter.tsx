import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage';
import Protected from './Protected';
import ProtectedAdmin from './ProtectedAdmin';
import ProtectedBidan from './ProtectedBidan';
import ProtectedDinkes from './ProtectedDinkes';
import AdminLayout from '@/features/admin/components/AdminLayout';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import CreateAccountPage from '@/features/admin/pages/CreateAccountPage';
import BidanLayout from '@/features/bidan/components/BidanLayout';
import BidanDashboardPage from '@/features/bidan/pages/BidanDashboardPage';
import BidanUsersPage from '@/features/bidan/pages/BidanUsersPage';
import DinkesDashboard from '@/features/dinkes/DinkesDashboard';
import DinkesUsersPage from '@/features/dinkes/pages/DinkesUsersPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/create-account"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <CreateAccountPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <div className="text-center py-12 text-gray-500">
                  Halaman Daftar User (Coming Soon)
                </div>
              </AdminLayout>
            </ProtectedAdmin>
          }
        />

        {/* Bidan Routes */}
        <Route
          path="/bidan"
          element={
            <ProtectedBidan>
              <BidanLayout>
                <BidanDashboardPage />
              </BidanLayout>
            </ProtectedBidan>
          }
        />
        <Route
          path="/bidan/users"
          element={
            <ProtectedBidan>
              <BidanLayout>
                <BidanUsersPage />
              </BidanLayout>
            </ProtectedBidan>
          }
        />

        {/* Dinkes Routes */}
        <Route
          path="/dinkes"
          element={
            <ProtectedDinkes>
              <DinkesDashboard />
            </ProtectedDinkes>
          }
        />
        <Route
          path="/dinkes/users"
          element={
            <ProtectedDinkes>
              <DinkesUsersPage />
            </ProtectedDinkes>
          }
        />

        {/* Generic Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <div className="p-8">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome to your dashboard</p>
              </div>
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
