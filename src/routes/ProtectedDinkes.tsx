import { Navigate } from 'react-router-dom';
import { storage } from '@/lib/storage';

type ProtectedDinkesProps = {
  children: React.ReactNode;
};

export default function ProtectedDinkes({ children }: ProtectedDinkesProps) {
  const token = storage.getToken();
  const role = storage.getRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'dinkes') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
