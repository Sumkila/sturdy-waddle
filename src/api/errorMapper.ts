/**
 * Normalizes backend error responses into a consistent AppApiError structure.
 *
 * Handles Spring Boot format, standard RFC-7807 problem details,
 * validation error maps, and fallback network errors.
 */

import { AxiosError } from 'axios';
import { AppApiError } from '../types/api';

export function normalizeError(error: unknown): AppApiError {
  if (!error) {
    return {
      status: 0,
      message: 'An unknown error occurred.',
    };
  }

  // If already an AppApiError
  if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
    return error as AppApiError;
  }

  const axiosError = error as AxiosError<Record<string, unknown>>;

  if (axiosError.isAxiosError && axiosError.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data;

    let message = 'A server error occurred. Please try again.';
    let code: string | undefined;
    const fieldErrors: Record<string, string> = {};

    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object') {
      // Common backend message fields
      if (typeof data.message === 'string') {
        message = data.message;
      } else if (typeof data.error === 'string') {
        message = data.error;
      } else if (typeof data.detail === 'string') {
        message = data.detail;
      }

      if (typeof data.code === 'string') {
        code = data.code;
      }

      // Handle Spring Boot / RFC-7807 validation errors
      // e.g. { errors: [{ field: 'email', defaultMessage: 'Invalid' }] }
      if (Array.isArray(data.errors)) {
        data.errors.forEach((item) => {
          if (typeof item === 'object' && item !== null) {
            const errObj = item as Record<string, unknown>;
            const field = String(errObj.field || errObj.property || '');
            const msg = String(errObj.defaultMessage || errObj.message || 'Invalid value');
            if (field) {
              fieldErrors[field] = msg;
            }
          }
        });
      } else if (data.fieldErrors && typeof data.fieldErrors === 'object') {
        // e.g. { fieldErrors: { email: 'already exists' } }
        Object.entries(data.fieldErrors as Record<string, unknown>).forEach(([k, v]) => {
          if (typeof v === 'string') {
            fieldErrors[k] = v;
          }
        });
      } else if (status === 400) {
        // Flat field map: e.g. { firstName: 'First name is required', email: 'Email exists' }
        Object.entries(data).forEach(([key, val]) => {
          if (typeof val === 'string' && key !== 'message' && key !== 'error' && key !== 'timestamp' && key !== 'path') {
            fieldErrors[key] = val;
          }
        });
      }
    }

    // Role / status specific fallbacks
    if (status === 401) {
      message = message === 'A server error occurred. Please try again.' ? 'Your session has expired. Please log in again.' : message;
      code = code ?? 'UNAUTHORIZED';
    } else if (status === 403) {
      message = message === 'A server error occurred. Please try again.' ? 'You do not have permission to perform this action.' : message;
      code = code ?? 'FORBIDDEN';
    } else if (status === 404) {
      message = message === 'A server error occurred. Please try again.' ? 'The requested resource was not found.' : message;
      code = code ?? 'NOT_FOUND';
    } else if (status === 409) {
      message = message === 'A server error occurred. Please try again.' ? 'A conflict occurred. A record with this identifier may already exist.' : message;
      code = code ?? 'CONFLICT';
    }

    return {
      status,
      code,
      message,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      raw: data,
    };
  }

  // Network / timeout error
  if (axiosError.request && !axiosError.response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the school server. Please verify the backend is running and check your connection.',
    };
  }

  return {
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: axiosError.message || 'An unexpected error occurred.',
  };
}
