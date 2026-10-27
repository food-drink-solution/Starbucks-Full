import { ApiConfig } from '@/types/services';

/**
 * Service paths already include the `/api` prefix (e.g. `/api/v1/Auth/login`),
 * so strip a trailing `/api` from the configured base URL to avoid resolving
 * to `…/api/api/v1/…` (404s surfaced as "Network Error").
 */
const normalizeApiBaseUrl = (url: string): string => url.replace(/\/api\/?$/, '');

/**
 * Default API configuration
 */
export const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: normalizeApiBaseUrl(
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  ),
  timeout: 30000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  },
};
