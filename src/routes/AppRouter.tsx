import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage';
import Protected from './Protected';
import ProtectedAdmin from './ProtectedAdmin';
import ProtectedBidan from './ProtectedBidan';
import ProtectedDinkes from './ProtectedDinkes';
import AdminLayout from '@/features/admin/components/AdminLayout';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import CreateAccountPage from '@/features/admin/pages/CreateAccountPage';
import CreateBidanPage from '@/features/admin/pages/CreateBidanPage';
import CreateDinkesPage from '@/features/admin/pages/CreateDinkesPage';
import AdminBidanUsersPage from '@/features/admin/pages/BidanUsersPage';
import AdminDinkesUsersPage from '@/features/admin/pages/DinkesUsersPage';
import BidanDashboard from '@/features/bidan/BidanDashboard';
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
          path="/admin/create-bidan"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <CreateBidanPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/create-dinkes"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <CreateDinkesPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/bidan-users"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminBidanUsersPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/dinkes-users"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminDinkesUsersPage />
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
        <Route
          path="/bidan/users"
          element={
            <ProtectedBidan>
              <BidanUsersPage />
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
