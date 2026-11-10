/**
 * Standardized TanStack Mutation wrapper hook.
 */

import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AppApiError } from '../types/api';

export function useApiMutation<TData, TVariables, TError = AppApiError>(
  options: UseMutationOptions<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  return useMutation<TData, TError, TVariables>(options);
}
