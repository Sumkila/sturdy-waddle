/**
 * Normalizes backend error responses into a consistent AppApiError structure.
 *
 * Handles Spring Boot format, standard RFC-7807 problem details,
 * validation error maps, and fallback network errors.
 */

import { AxiosError } from 'axios';
import { AppApiError } from '../types/api';

const genericHttpMessages = new Set([
  'bad request',
  'unauthorized',
  'forbidden',
  'not found',
  'conflict',
  'unprocessable entity',
  'too many requests',
  'internal server error',
]);

function fallbackMessage(status: number, isLoginRequest: boolean): string {
  if (isLoginRequest && (status === 400 || status === 401)) {
    return "Invalid credentials. Check your username and password. If you don't have an account, create one below.";
  }
  if (status === 400) return 'Some information is missing or invalid. Review the form and try again.';
  if (status === 401) return 'Your session has expired or you are not signed in. Please log in.';
  if (status === 403) return "You don't have permission to perform this action.";
  if (status === 404) return "We couldn't find the requested record.";
  if (status === 409) return 'This conflicts with an existing record. Check your details and try again.';
  if (status === 422) return 'Some submitted information could not be accepted. Review the form and try again.';
  if (status === 429) return 'Too many requests. Wait a moment and try again.';
  if (status >= 500) return "We couldn't complete your request due to a server problem. Please try again later.";
  return 'The request could not be completed. Check your details and try again.';
}

function isGenericHttpMessage(message: string): boolean {
  return genericHttpMessages.has(message.trim().toLowerCase());
}

export function normalizeError(error: unknown): AppApiError {
  if (!error) {
    return {
      status: 0,
      message: 'An unknown error occurred.',
    };
  }

  const axiosError = error as AxiosError<Record<string, unknown>>;
  const isAxiosError = typeof error === 'object'
    && error !== null
    && 'isAxiosError' in error
    && error.isAxiosError === true;

  // Axios errors also have status and message properties; normalize those first.
  if (!isAxiosError && typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
    return error as AppApiError;
  }

  if (axiosError.isAxiosError && axiosError.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data;
    const isLoginRequest = /\/auth\/login(?:[/?#]|$)/i.test(axiosError.config?.url ?? '');
    const isInvalidLogin = isLoginRequest && (status === 400 || status === 401);
    let message = fallbackMessage(status, isLoginRequest);
    let code: string | undefined;
    const fieldErrors: Record<string, string> = {};

    if (typeof data === 'string' && status < 500 && !isInvalidLogin) {
      message = data;
    } else if (data && typeof data === 'object') {
      if (status < 500 && !isInvalidLogin) {
        const responseMessage = [data.message, data.detail, data.error]
          .find((value): value is string =>
            typeof value === 'string' && value.trim().length > 0 && !isGenericHttpMessage(value)
          );
        if (responseMessage) message = responseMessage;
      }

      if (typeof data.code === 'string') {
        code = data.code;
      }

      // Handle Spring Boot / RFC-7807 validation errors
      // e.g. { errors: [{ field: 'email', defaultMessage: 'Invalid' }] }
      if (!isInvalidLogin && Array.isArray(data.errors)) {
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
      } else if (!isInvalidLogin && data.fieldErrors && typeof data.fieldErrors === 'object') {
        // e.g. { fieldErrors: { email: 'already exists' } }
        Object.entries(data.fieldErrors as Record<string, unknown>).forEach(([k, v]) => {
          if (typeof v === 'string') {
            fieldErrors[k] = v;
          }
        });
      } else if (!isInvalidLogin && status === 400) {
        // Flat field map: e.g. { firstName: 'First name is required', email: 'Email exists' }
        Object.entries(data).forEach(([key, val]) => {
          if (
            typeof val === 'string'
            && !['message', 'error', 'timestamp', 'path', 'status', 'code', 'fieldErrors', 'title', 'detail'].includes(key)
          ) {
            fieldErrors[key] = val;
          }
        });
      }
    }

    if (isInvalidLogin) {
      code = 'INVALID_CREDENTIALS';
      message = fallbackMessage(status, true);
    } else if (status === 400) {
      code = code ?? 'VALIDATION_FAILED';
    } else if (status === 401) {
      code = code ?? 'UNAUTHORIZED';
    } else if (status === 403) {
      code = code ?? 'FORBIDDEN';
    } else if (status === 404) {
      code = code ?? 'NOT_FOUND';
    } else if (status === 409) {
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
