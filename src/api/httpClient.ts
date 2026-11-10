/**
 * Configurable HTTP Client powered by Axios.
 *
 * Implements:
 * - Base URL prefixing from environment configuration
 * - Automatic Bearer token attachment via interceptors
 * - 401 unauthorized session expiry handling
 * - Error normalization into AppApiError
 * - Request cancellation support with AbortSignal
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { appConfig } from '../config/appConfig';
import { tokenStorage } from '../auth/tokenStorage';
import { normalizeError } from './errorMapper';
import { AppApiError } from '../types/api';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfig.fullApiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach Bearer token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

// Response interceptor: handle 401 session expiry and error normalization
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error);

    if (normalized.status === 401) {
      tokenStorage.clear();
      // Only dispatch redirect if not already on login or register page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    return Promise.reject(normalized);
  }
);

export interface RequestOptions extends AxiosRequestConfig {
  signal?: AbortSignal;
}

export const httpClient = {
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    try {
      const response = await axiosInstance.get<T>(url, options);
      return response.data;
    } catch (err) {
      throw (err as AppApiError);
    }
  },

  async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    try {
      const response = await axiosInstance.post<T>(url, data, options);
      return response.data;
    } catch (err) {
      throw (err as AppApiError);
    }
  },

  async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    try {
      const response = await axiosInstance.put<T>(url, data, options);
      return response.data;
    } catch (err) {
      throw (err as AppApiError);
    }
  },

  async patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    try {
      const response = await axiosInstance.patch<T>(url, data, options);
      return response.data;
    } catch (err) {
      throw (err as AppApiError);
    }
  },

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    try {
      const response = await axiosInstance.delete<T>(url, options);
      return response.data;
    } catch (err) {
      throw (err as AppApiError);
    }
  },
};
