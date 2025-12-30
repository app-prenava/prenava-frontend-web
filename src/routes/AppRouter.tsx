import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
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
import AddBannerPage from '@/features/admin/pages/AddBannerPage';
import CreateBannerPage from '@/features/admin/pages/CreateBannerPage';
import BidanDashboard from '@/features/bidan/BidanDashboard';
import BidanLayout from '@/features/bidan/components/BidanLayout';
import BidanUsersPage from '@/features/bidan/pages/BidanUsersPage';
import DinkesDashboard from '@/features/dinkes/DinkesDashboard';
import DinkesLayout from '@/features/dinkes/components/DinkesLayout';
import DinkesUsersPage from '@/features/dinkes/pages/DinkesUsersPage';
import AdminShopPage from '@/features/admin/pages/AdminShopPage';
import ViewProfilePage from '@/features/bidan/pages/ViewProfilePage';
import EditProfilePage from '@/features/bidan/pages/EditProfilePage';
import ViewDinkesProfilePage from '@/features/dinkes/pages/ViewDinkesProfilePage';
import EditDinkesProfilePage from '@/features/dinkes/pages/EditDinkesProfilePage';
import TipCategoryManagerPage from '@/features/admin/pages/TipCategoryManagerPage';
import AdminTipManagerPage from '@/features/admin/pages/TipManagerPage';
import BidanTipManagerPage from '@/features/bidan/pages/TipManagerPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route
          path="/admin/add-banner"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AddBannerPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/create-banner"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <CreateBannerPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/shop"
          element={
            <ProtectedAdmin>
              <AdminShopPage />
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/tip-categories"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <TipCategoryManagerPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/tips"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminTipManagerPage />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />

        {/* Bidan Routes */}
        <Route
          path="/bidan"
          element={
            <ProtectedBidan>
              <BidanDashboard />
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
          path="/bidan/profile"
          element={
            <ProtectedBidan>
              <BidanLayout>
                <ViewProfilePage />
              </BidanLayout>
            </ProtectedBidan>
          }
        />
        <Route
          path="/bidan/edit-profile-data"
          element={
            <ProtectedBidan>
              <BidanLayout>
                <EditProfilePage />
              </BidanLayout>
            </ProtectedBidan>
          }
        />
        <Route
          path="/bidan/tips"
          element={
            <ProtectedBidan>
              <BidanLayout>
                <BidanTipManagerPage />
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
              <DinkesLayout>
                <DinkesUsersPage />
              </DinkesLayout>
            </ProtectedDinkes>
          }
        />
        <Route
          path="/dinkes/profile"
          element={
            <ProtectedDinkes>
              <DinkesLayout>
                <ViewDinkesProfilePage />
              </DinkesLayout>
            </ProtectedDinkes>
          }
        />
        <Route
          path="/dinkes/edit-profile-data"
          element={
            <ProtectedDinkes>
              <DinkesLayout>
                <EditDinkesProfilePage />
              </DinkesLayout>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
