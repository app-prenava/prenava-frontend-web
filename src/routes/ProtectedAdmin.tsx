import { Navigate } from 'react-router-dom';
import { storage } from '@/lib/storage';

type ProtectedAdminProps = {
  children: React.ReactNode;
};

export default function ProtectedAdmin({ children }: ProtectedAdminProps) {
  const token = storage.getToken();
  const role = storage.getRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
