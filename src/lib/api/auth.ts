/**
 * Auth API service
 */

import apiClient, { ApiResponse } from './client';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'BASIC' | 'STANDARD' | 'GOLD' | 'ADMIN' | 'SUPER_ADMIN';
  verified: boolean;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  expiresAt: string;
}

export const authApi = {
  // Login - tokens are stored in HttpOnly cookies by the server
  async login(data: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/token', data, {
      credentials: 'include',
    });
    return response;
  },

  // Register - tokens are stored in HttpOnly cookies by the server
  async register(data: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data, {
      credentials: 'include',
    });
    return response;
  },

  // Logout - clears HttpOnly cookies on server
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {}, {
      credentials: 'include',
    });
  },

  // Refresh token - uses HttpOnly cookie, no localStorage needed
  async refreshToken(): Promise<ApiResponse<TokenRefreshResponse>> {
    const response = await apiClient.post<TokenRefreshResponse>('/auth/refresh', {}, {
      credentials: 'include',
    });
    return response;
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password', {
      currentPassword,
      newPassword,
    });
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', {
      token,
      newPassword,
    });
  },
};

export default authApi;
