import { describe, it, expect } from 'vitest';
import { normalizeError } from '../api/errorMapper';

describe('errorMapper.normalizeError', () => {
  it('returns default error on null or undefined input', () => {
    const err = normalizeError(null);
    expect(err.status).toBe(0);
    expect(err.message).toBe('An unknown error occurred.');
  });

  it('normalizes Axios 400 error with Spring Boot field errors', () => {
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: 'Validation failed',
          errors: [
            { field: 'email', defaultMessage: 'Email already registered' },
            { field: 'studentNumber', defaultMessage: 'Student number required' },
          ],
        },
      },
    };

    const result = normalizeError(mockAxiosError);
    expect(result.status).toBe(400);
    expect(result.message).toBe('Validation failed');
    expect(result.fieldErrors?.email).toBe('Email already registered');
    expect(result.fieldErrors?.studentNumber).toBe('Student number required');
  });

  it('normalizes Axios 401 session expired error', () => {
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        status: 401,
        data: {},
      },
    };

    const result = normalizeError(mockAxiosError);
    expect(result.status).toBe(401);
    expect(result.code).toBe('UNAUTHORIZED');
    expect(result.message).toContain('session has expired');
  });

  it('gives login failures a clear invalid-credentials message and registration suggestion', () => {
    const mockAxiosError = {
      isAxiosError: true,
      status: 400,
      message: 'Request failed with status code 400',
      config: { url: '/api/auth/login' },
      response: {
        status: 400,
        data: {
          status: 400,
          error: 'Bad Request',
        },
      },
    };

    const result = normalizeError(mockAxiosError);
    expect(result.status).toBe(400);
    expect(result.code).toBe('INVALID_CREDENTIALS');
    expect(result.message).toContain('Invalid credentials');
    expect(result.message).toContain('create one below');
    expect(result.message).not.toContain('Request failed with status code');
  });

  it('normalizes Axios 403 forbidden error', () => {
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        status: 403,
        data: {},
      },
    };

    const result = normalizeError(mockAxiosError);
    expect(result.status).toBe(403);
    expect(result.code).toBe('FORBIDDEN');
    expect(result.message).toContain('do not have permission');
  });

  it('uses a helpful fallback for an unstructured 404 response', () => {
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          status: 404,
          error: 'Not Found',
          path: '/api/missing',
        },
      },
    };

    const result = normalizeError(mockAxiosError);
    expect(result.message).toContain("couldn't find the requested record");
  });

  it('normalizes network disconnect error', () => {
    const mockNetworkError = {
      isAxiosError: true,
      request: {},
    };

    const result = normalizeError(mockNetworkError);
    expect(result.status).toBe(0);
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toContain('Unable to reach');
  });
});
