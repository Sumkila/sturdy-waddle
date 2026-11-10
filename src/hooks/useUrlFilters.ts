/**
 * Custom hook to synchronize filter states with URL search parameters.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlFilters<T extends Record<string, string | undefined>>() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      obj[key] = val;
    });
    return obj as T;
  }, [searchParams]);

  const setFilter = useCallback(
    (key: string, value?: string | number | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === undefined || value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    filters,
    setFilter,
    resetFilters,
  };
}
