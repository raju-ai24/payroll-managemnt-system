import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../common/Loader';

export default function ProtectedRoute({ children, module, roles }) {
    const { isAuthenticated, loading, user, hasPermission } = useAuth();

    if (loading) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Role restriction
    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Module permission check
    if (module && !hasPermission(module)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
