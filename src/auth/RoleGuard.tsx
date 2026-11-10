/**
 * Role & Capability UI Guard.
 *
 * Conditionally renders UI actions (buttons, tabs, action links)
 * based on user role or permission matrix capabilities.
 */

import React from 'react';
import { useAuth } from './useAuth';
import { AppCapability, hasPermission } from '../config/permissionsConfig';
import { UserRole } from '../types/auth';

export interface RoleGuardProps {
  children: React.ReactNode;
  capability?: AppCapability;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  capability,
  allowedRoles,
  fallback = null,
}) => {
  const { role } = useAuth();

  if (capability && !hasPermission(role, capability)) {
    return <>{fallback}</>;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
