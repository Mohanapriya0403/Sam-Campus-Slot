import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user, isAuthenticated, checkingSession } = useAuth();

  // Still validating a persisted token against the backend — hold off on
  // redirecting, or a real logged-in session gets bounced to /login on every
  // page refresh before the /me check has a chance to come back.
  if (checkingSession) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return children;
}
