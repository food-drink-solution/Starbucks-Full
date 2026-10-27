import axios from 'axios';
import { API_CONFIG } from '@/lib/core/constants';
import { captureError, addBreadcrumb } from '@/lib/error/errorMonitoring';

/**
 * Standard API Client with interceptors for error monitoring
 *
 * Base URL normalization: service paths already include the `/api` prefix
 * (e.g. `/api/v1/Auth/login`), while VITE_API_URL is configured WITH the
 * trailing `/api` segment (e.g. `http://localhost:8080/api`). Strip the
 * trailing segment here so requests resolve to `…/api/v1/…` exactly once —
 * a double `/api/api/v1/…` produced 404s (surfaced as "Network Error").
 */
const normalizeApiBaseUrl = (url: string): string => url.replace(/\/api\/?$/, '');

export const apiClient = axios.create({
  baseURL: normalizeApiBaseUrl(API_CONFIG.BASE_URL),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add breadcrumb for outgoing requests
    addBreadcrumb(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      'http',
      'info'
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Report API errors to monitor
    captureError(error, {
      context: 'API_RESPONSE_ERROR',
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

/**
 * Simulated delay for development (mimics network latency)
 */
export const simulateDelay = (ms: number = API_CONFIG.SIMULATED_DELAY) =>
  new Promise((_resolve) => setTimeout(_resolve, ms));
