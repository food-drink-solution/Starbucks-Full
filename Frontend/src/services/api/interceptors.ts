/**
 * API Interceptors
 */

import { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logError } from '@/lib/error';
import { ServiceError } from '@/types/services';

// Extend Axios types to include custom metadata
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
}

export class ApiInterceptors {
  constructor(private client: AxiosInstance) {}

  setup(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracing
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Add performance timing
        (config as CustomAxiosRequestConfig).metadata = { startTime: Date.now() };

        return config;
      },
      (error) => {
        logError(error, 'API Request Interceptor');
        return Promise.reject(this.createServiceError(error));
      }
    );
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => {
        // Log performance metrics
        const customConfig = response.config as CustomAxiosRequestConfig;
        const duration = Date.now() - (customConfig.metadata?.startTime || 0);
        this.logPerformance(response.config.url || '', duration);

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshAuthToken();
            const token = this.getAuthToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleAuthFailure();
            return Promise.reject(this.createServiceError(refreshError));
          }
        }

        logError(error, 'API Response');
        return Promise.reject(this.createServiceError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async refreshAuthToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/api/v1/Auth/refresh', {
      refreshToken,
    });

    const { token } = response.data;
    localStorage.setItem('auth_token', token);
  }

  private handleAuthFailure(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logPerformance(url: string, duration: number): void {
    if (duration > 1000) {
      console.warn(`Slow API request: ${url} took ${duration}ms`);
    }
  }

  private createServiceError(error: unknown): ServiceError {
    if (error instanceof AxiosError) {
      return {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.message || error.message || 'An error occurred',
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      timestamp: new Date().toISOString(),
    };
  }
}
