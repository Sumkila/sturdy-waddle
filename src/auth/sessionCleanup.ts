import { clearAuthorizationDefaults } from '../api/httpClient';
import { queryClient } from '../lib/queryClient';
import { tokenStorage } from './tokenStorage';

export function clearClientSession(): void {
  tokenStorage.clear();
  clearAuthorizationDefaults();
  queryClient.clear();
}
