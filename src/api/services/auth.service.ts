/**
 * Authentication feature service.
 *
 * Wraps the API adapter with business logic, token persistence, and role decoding.
 */

import { apiAdapter } from '../apiAdapter';
import { tokenStorage } from '../../auth/tokenStorage';
import { AuthResponse, LoginCredentials, RegisterPayload, UserRole } from '../../types/auth';

/**
 * Attempts to parse a JWT payload to extract user details when the backend
 * returns only a raw JWT string.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authService = {
  /**
   * Logs in with credentials, extracts role from response or JWT,
   * stores authentication state, and returns the AuthResponse.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiAdapter.login(credentials);
    const token = response.token;

    if (token) {
      tokenStorage.setToken(token);

      let role: UserRole = response.role || 'STUDENT';
      let username = response.username || credentials.username;

      // If backend returns only { token: '...' }, decode JWT for role and subject
      if (!response.role) {
        const decoded = decodeJwtPayload(token);
        if (decoded) {
          if (decoded.role && typeof decoded.role === 'string') {
            role = decoded.role as UserRole;
          } else if (Array.isArray(decoded.roles) && decoded.roles[0]) {
            role = String(decoded.roles[0]).replace('ROLE_', '') as UserRole;
          } else if (decoded.authorities && Array.isArray(decoded.authorities)) {
            const first = decoded.authorities[0];
            role = (typeof first === 'string' ? first : first.authority || '').replace('ROLE_', '') as UserRole;
          }

          if (decoded.sub && typeof decoded.sub === 'string') {
            username = decoded.sub;
          }
        }
      }

      tokenStorage.setRole(role);

      return {
        ...response,
        role,
        username,
        user: {
          username,
          role,
        },
      };
    }

    return response;
  },

  /**
   * Registers a new user account.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiAdapter.register(payload);
    if (response.token) {
      tokenStorage.setToken(response.token);
      const role = response.role || payload.role;
      tokenStorage.setRole(role);
      return {
        ...response,
        role,
        username: response.username || payload.username,
      };
    }
    return response;
  },

  /**
   * Logs out the user and clears stored credentials.
   */
  logout(): void {
    tokenStorage.clear();
  },

  /**
   * Retrieves the current stored token.
   */
  getToken(): string | null {
    return tokenStorage.getToken();
  },

  /**
   * Retrieves the current stored role.
   */
  getRole(): UserRole | null {
    return tokenStorage.getRole();
  },
};
