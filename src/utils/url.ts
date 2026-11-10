/**
 * URL building and parameter normalization utilities.
 */

import { QueryParams } from '../types/api';

/**
 * Builds a query string from key-value pairs, stripping null, undefined,
 * and empty strings, and properly encoding keys and values.
 */
export function buildQueryString(params?: QueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Safely encodes a path segment, handling special characters like '+', spaces, and '@'.
 */
export function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment);
}
