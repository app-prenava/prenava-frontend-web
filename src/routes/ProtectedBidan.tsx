import { Navigate } from 'react-router-dom';
import { storage } from '@/lib/storage';

type ProtectedBidanProps = {
  children: React.ReactNode;
};

export default function ProtectedBidan({ children }: ProtectedBidanProps) {
  const token = storage.getToken();
  const role = storage.getRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'bidan') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
