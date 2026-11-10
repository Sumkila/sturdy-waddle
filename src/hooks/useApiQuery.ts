/**
 * Standardized TanStack Query wrapper hook.
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AppApiError } from '../types/api';

export function useApiQuery<TData, TError = AppApiError>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError>(options);
}
