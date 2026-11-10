/**
 * Authentication Context and Provider.
 *
 * Manages user state, login, registration, logout, and token lifecycle.
 */

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthResponse, AuthUser, LoginCredentials, RegisterPayload, UserRole } from '../types/auth';
import { tokenStorage } from './tokenStorage';
import { authService } from '../api/services/auth.service';
import { AppCapability, hasPermission } from '../config/permissionsConfig';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  hasCapability: (capability: AppCapability) => boolean;
  switchRoleForDev: (newRole: UserRole) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => tokenStorage.getToken());
  const [role, setRole] = useState<UserRole | null>(() => tokenStorage.getRole());
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedToken = tokenStorage.getToken();
    const storedRole = tokenStorage.getRole();
    if (storedToken) {
      return {
        username: 'User',
        role: storedRole || 'STUDENT',
      };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Synchronize on mount and handle unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setRole(null);
      setUser(null);
      tokenStorage.clear();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const activeToken = response.token;
      const activeRole = response.role || 'STUDENT';
      const activeUsername = response.username || credentials.username;

      setToken(activeToken);
      setRole(activeRole);
      setUser({
        username: activeUsername,
        role: activeRole,
      });

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      if (response.token) {
        const activeToken = response.token;
        const activeRole = response.role || payload.role;
        setToken(activeToken);
        setRole(activeRole);
        setUser({
          username: payload.username,
          email: payload.email,
          role: activeRole,
        });
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setRole(null);
    setUser(null);
  }, []);

  const hasCapability = useCallback(
    (capability: AppCapability): boolean => {
      return hasPermission(role, capability);
    },
    [role]
  );

  const switchRoleForDev = useCallback((newRole: UserRole) => {
    tokenStorage.setRole(newRole);
    setRole(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : { username: 'DevUser', role: newRole }));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      role,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
      hasCapability,
      switchRoleForDev,
    }),
    [user, token, role, isLoading, login, register, logout, hasCapability, switchRoleForDev]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
