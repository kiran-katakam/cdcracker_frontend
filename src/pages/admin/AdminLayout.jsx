import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Admin is now just a protected wrapper — navigation happens via the normal navbar.
// The sidebar has been removed to avoid encouraging eager "load everything" patterns.
export default function AdminLayout() {
  const { admin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
