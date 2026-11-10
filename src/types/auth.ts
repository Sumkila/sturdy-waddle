/**
 * Authentication and authorization type definitions.
 *
 * Supports the standard roles: ADMIN, PRINCIPAL, TEACHER, PARENT, STUDENT.
 */

export type UserRole =
  | 'ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT';

export interface AuthUser {
  id?: string;
  username: string;
  email?: string;
  role: UserRole;
  displayName?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  role?: UserRole;
  username?: string;
  user?: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
