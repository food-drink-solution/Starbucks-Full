/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiService } from './index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    /** Matches the store's User role union (lib/schemas). Wire may carry other backend roles; narrow at the boundary. */
    role: 'Customer' | 'Admin' | 'SuperAdmin';
  };
}

/**
 * The API's wire format (see Starbucks.Application.DTOs.Auth.LoginResponse):
 * tokens are exposed as `accessToken` / `refreshToken`. The store layer
 * consumes `token`, so responses are mapped here.
 */
interface ApiLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  requiresTwoFactor?: boolean;
}

const mapAuthResponse = (r: ApiLoginResponse): AuthResponse => ({
  token: r.accessToken,
  refreshToken: r.refreshToken,
  expiresAt: r.expiresAt,
  user: {
    id: r.user.id,
    email: r.user.email,
    firstName: r.user.firstName,
    lastName: r.user.lastName,
    role: r.user.role as AuthResponse['user']['role'],
  },
});

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const r = await apiService.post<ApiLoginResponse>('/api/v1/Auth/login', credentials);
  return mapAuthResponse(r);
};

/**
 * Register new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const r = await apiService.post<ApiLoginResponse>('/api/v1/Auth/register', userData);
  return mapAuthResponse(r);
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const r = await apiService.post<ApiLoginResponse>('/api/v1/Auth/refresh', { refreshToken });
  return { token: r.accessToken };
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  return apiService.post('/api/v1/Auth/logout');
};

/**
 * Auth service object
 */
export const authService = {
  login,
  register,
  refreshToken,
  logout,
};
