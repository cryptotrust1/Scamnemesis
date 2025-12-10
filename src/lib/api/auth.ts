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
  // Login
  async login(data: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.accessToken) {
      apiClient.setAccessToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    return response;
  },

  // Register
  async register(data: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.accessToken) {
      apiClient.setAccessToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  },

  // Refresh token
  async refreshToken(): Promise<ApiResponse<TokenRefreshResponse>> {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;

    if (!refreshToken) {
      throw { message: 'No refresh token', code: 'NO_REFRESH_TOKEN' };
    }

    const response = await apiClient.post<TokenRefreshResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.accessToken) {
      apiClient.setAccessToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
    }

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
