/**
 * Application environment configuration.
 *
 * Centralized, validated configuration loaded from Vite environment variables.
 * Backend-agnostic: developers configure API URLs, prefixes, and storage keys here
 * without modifying feature components.
 */

interface AppConfig {
  apiUrl: string;
  apiPrefix: string;
  appName: string;
  authTokenKey: string;
  authRoleKey: string;
  devProxyTarget: string;
  fullApiBaseUrl: string;
  isDev: boolean;
}

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');

const rawApiPrefix = (import.meta.env.VITE_API_PREFIX as string | undefined) ?? '/api';
const cleanApiPrefix = rawApiPrefix ? (rawApiPrefix.startsWith('/') ? rawApiPrefix : `/${rawApiPrefix}`).replace(/\/+$/, '') : '';

export const appConfig: AppConfig = {
  apiUrl: cleanApiUrl,
  apiPrefix: cleanApiPrefix,
  appName: (import.meta.env.VITE_APP_NAME as string | undefined) ?? 'Lumani',
  authTokenKey: (import.meta.env.VITE_AUTH_TOKEN_KEY as string | undefined) ?? 'app_token',
  authRoleKey: (import.meta.env.VITE_AUTH_ROLE_KEY as string | undefined) ?? 'app_role',
  devProxyTarget: (import.meta.env.VITE_DEV_PROXY_TARGET as string | undefined) ?? 'http://localhost:8080',
  fullApiBaseUrl: `${cleanApiUrl}${cleanApiPrefix}`,
  isDev: import.meta.env.DEV ?? false,
};
