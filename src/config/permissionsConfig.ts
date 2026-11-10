/**
 * Centralized Role-Based Access Control (RBAC) permission configuration.
 *
 * Defines the capability matrix for all system roles:
 * ADMIN, PRINCIPAL, TEACHER, PARENT, STUDENT.
 *
 * IMPORTANT: Client-side permission checks are UX conveniences for navigation
 * and action button rendering. The backend remains the source of truth and enforces
 * actual authorization.
 */

import { UserRole } from '../types/auth';

export type AppCapability =
  | 'VIEW_DASHBOARD'
  | 'CREATE_STUDENT'
  | 'EDIT_STUDENT'
  | 'DEACTIVATE_STUDENT'
  | 'VIEW_ALL_STUDENTS'
  | 'VIEW_OWN_CHILDREN'
  | 'VIEW_OWN_RECORD'
  | 'MARK_ATTENDANCE'
  | 'VIEW_ATTENDANCE'
  | 'VIEW_ATTENDANCE_OWN_CHILDREN'
  | 'VIEW_ATTENDANCE_OWN_RECORD'
  | 'CREATE_RESULT'
  | 'EDIT_RESULT'
  | 'DELETE_RESULT'
  | 'MANAGE_SUBJECTS'
  | 'MANAGE_TEACHERS'
  | 'VIEW_TEACHERS'
  | 'MANAGE_PARENTS'
  | 'MANAGE_OWN_PARENT_PROFILE';

export type PermissionMatrix = Record<UserRole, readonly AppCapability[]>;

export const permissionMatrix: PermissionMatrix = {
  ADMIN: [
    'VIEW_DASHBOARD',
    'CREATE_STUDENT',
    'EDIT_STUDENT',
    'DEACTIVATE_STUDENT',
    'VIEW_ALL_STUDENTS',
    'MARK_ATTENDANCE',
    'VIEW_ATTENDANCE',
    'CREATE_RESULT',
    'EDIT_RESULT',
    'DELETE_RESULT',
    'MANAGE_SUBJECTS',
    'MANAGE_TEACHERS',
    'VIEW_TEACHERS',
    'MANAGE_PARENTS',
  ],
  PRINCIPAL: [
    'VIEW_DASHBOARD',
    'CREATE_STUDENT',
    'EDIT_STUDENT',
    'DEACTIVATE_STUDENT',
    'VIEW_ALL_STUDENTS',
    'MARK_ATTENDANCE',
    'VIEW_ATTENDANCE',
    'EDIT_RESULT',
    'MANAGE_SUBJECTS',
    'VIEW_TEACHERS',
    'MANAGE_PARENTS',
  ],
  TEACHER: [
    'VIEW_DASHBOARD',
    'VIEW_ALL_STUDENTS',
    'MARK_ATTENDANCE',
    'VIEW_ATTENDANCE',
    'CREATE_RESULT',
  ],
  PARENT: [
    'VIEW_DASHBOARD',
    'VIEW_OWN_CHILDREN',
    'VIEW_ATTENDANCE_OWN_CHILDREN',
    'MANAGE_OWN_PARENT_PROFILE',
  ],
  STUDENT: [
    'VIEW_DASHBOARD',
    'VIEW_OWN_RECORD',
    'VIEW_ATTENDANCE_OWN_RECORD',
  ],
} as const;

/**
 * Checks if a given role is granted a specific capability.
 */
export function hasPermission(role: UserRole | undefined | null, capability: AppCapability): boolean {
  if (!role) return false;
  const capabilities = permissionMatrix[role];
  if (!capabilities) return false;
  return (capabilities as readonly string[]).includes(capability);
}

/**
 * Convenience helper to check if a role is administrative (Admin or Principal).
 */
export function isAdminOrPrincipal(role: UserRole | undefined | null): boolean {
  return role === 'ADMIN' || role === 'PRINCIPAL';
}

/**
 * Convenience helper to check if a role is staff (Admin, Principal, or Teacher).
 */
export function isStaff(role: UserRole | undefined | null): boolean {
  return role === 'ADMIN' || role === 'PRINCIPAL' || role === 'TEACHER';
}
