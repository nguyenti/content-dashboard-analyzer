import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'viewer';
}

export const ProtectedRoute = ({ children, requiredRole = 'user' }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#4a5568' }}>Checking authentication...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions
  if (requiredRole && user) {
    const roleHierarchy = { viewer: 1, user: 2, admin: 3 };
    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#c53030' }}>Access Denied</h2>
          <p style={{ color: '#4a5568' }}>
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
          <p style={{ color: '#718096', fontSize: '14px' }}>
            Your current role: {user.role}
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};