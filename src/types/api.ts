/**
 * Common API error and response interfaces.
 *
 * Normalizes backend responses so UI components are insulated from raw Axios
 * or HTTP protocol specifics.
 */

export interface AppApiError {
  status: number;
  code?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  raw?: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;
