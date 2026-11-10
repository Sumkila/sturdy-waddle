/**
 * Custom hook to map backend AppApiError field validation errors
 * directly into React Hook Form error states.
 */

import { useState, useCallback } from 'react';
import { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { AppApiError } from '../types/api';

export function useFormErrors<TFieldValues extends FieldValues>(
  setError?: UseFormSetError<TFieldValues>
) {
  const [rootError, setRootError] = useState<string | null>(null);

  const handleApiError = useCallback(
    (error: unknown) => {
      const apiError = error as AppApiError;
      if (!apiError) return;

      setRootError(apiError.message || 'An unexpected error occurred. Please try again.');

      if (setError && apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          setError(field as Path<TFieldValues>, {
            type: 'server',
            message,
          });
        });
      }
    },
    [setError]
  );

  const clearErrors = useCallback(() => {
    setRootError(null);
  }, []);

  return {
    rootError,
    handleApiError,
    clearErrors,
  };
}
