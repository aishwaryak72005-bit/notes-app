import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If student tries to visit teacher route, send to student dashboard, and vice-versa
    if (user?.role === 'student') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/teacher/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
