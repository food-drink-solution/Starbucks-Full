/**
 * User API Service
 * Handles all user profile-related API calls to the backend
 */

import { apiService } from './index';
import { User } from '@/lib/schemas';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences?: Record<string, unknown>;
}

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<User> => {
  return apiService.get<User>('/api/v1/Account/profile');
};

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  return apiService.put<User>('/api/v1/Account/profile', data);
};

/**
 * User service object
 */
export const userService = {
  getProfile,
  updateProfile,
};
