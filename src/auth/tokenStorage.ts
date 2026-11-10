/**
 * Token and authentication credentials storage utility.
 *
 * Encapsulates client-side storage mechanisms so they can easily be
 * swapped with Cookies or in-memory stores in future iterations.
 */

import { appConfig } from '../config/appConfig';
import { UserRole } from '../types/auth';

export const tokenStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(appConfig.authTokenKey);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(appConfig.authTokenKey, token);
    } catch {
      // Ignore storage errors in restricted iframe environments
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem(appConfig.authTokenKey);
    } catch {
      // Ignore storage errors
    }
  },

  getRole(): UserRole | null {
    try {
      const role = localStorage.getItem(appConfig.authRoleKey);
      return (role as UserRole) || null;
    } catch {
      return null;
    }
  },

  setRole(role: UserRole): void {
    try {
      localStorage.setItem(appConfig.authRoleKey, role);
    } catch {
      // Ignore storage errors
    }
  },

  removeRole(): void {
    try {
      localStorage.removeItem(appConfig.authRoleKey);
    } catch {
      // Ignore storage errors
    }
  },

  clear(): void {
    tokenStorage.removeToken();
    tokenStorage.removeRole();
  },
};
