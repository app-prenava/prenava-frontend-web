import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage';
import Protected from './Protected';
import SideBar from '@/component/UI/SideBar';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <SideBar>
                <div className="p-8">
                  <h1 className="text-2xl font-semibold">Dashboard</h1>
                  <p className="text-gray-600 mt-2">Welcome to your dashboard</p>
                </div>  
              </SideBar>
            </Protected>
          }
        />
        <Route  
          path="/admin"
          element={
            <Protected>
              <div className="p-8">
                <h1 className="text-2xl font-semibold">Admin Panel</h1>
                <p className="text-gray-600 mt-2">Admin dashboard</p>
              </div>
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
