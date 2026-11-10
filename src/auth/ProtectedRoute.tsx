/**
 * Protected Route component.
 *
 * Ensures the route is accessible only to authenticated users,
 * preserving the requested URL for post-login redirect.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { AppCapability, hasPermission } from '../config/permissionsConfig';
import { UserRole } from '../types/auth';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: UserRole | UserRole[];
  requiredCapability?: AppCapability;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredCapability,
}) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!role || !roles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredCapability) {
    if (!hasPermission(role, requiredCapability)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
