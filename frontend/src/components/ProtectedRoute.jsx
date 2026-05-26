import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center text-slate-200">
        <div className="relative flex flex-col items-center">
          {/* Neon spinning circle */}
          <div className="w-16 h-16 border-4 border-t-cyanAccent border-r-transparent border-slate-800 rounded-full animate-spin"></div>
          <span className="mt-4 text-sm font-medium tracking-widest text-slate-400 uppercase animate-pulse">
            Verifying Connection...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
