import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isSessionValid, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check session validity when component mounts or location changes
    if (user && !isSessionValid()) {
      signOut();
    }
  }, [user, location, isSessionValid, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-green-400 font-mono">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If no user or session invalid, redirect to login
  if (!user || !isSessionValid()) {
    return <Navigate to="/authorize" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}