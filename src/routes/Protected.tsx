import { Navigate } from 'react-router-dom';
import { storage } from '@/lib/storage';

type ProtectedProps = {
  children: React.ReactNode;
};

export default function Protected({ children }: ProtectedProps) {
  const token = storage.getToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
