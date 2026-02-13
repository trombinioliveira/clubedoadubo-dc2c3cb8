import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStaff?: boolean;
  clientOnly?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireStaff, clientOnly }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isStaff } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireStaff && !isStaff && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin users cannot access client-only routes
  if (clientOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
