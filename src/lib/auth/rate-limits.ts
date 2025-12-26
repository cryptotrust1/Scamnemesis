/**
 * Centralized Rate Limiting Configuration
 *
 * This module provides unified rate limit settings for all auth endpoints.
 * All auth routes should use these constants for consistent rate limiting.
 */

/**
 * Rate limit configuration for each auth endpoint
 */
export const AUTH_RATE_LIMITS = {
  /**
   * Token endpoint (login)
   * Stricter limit to prevent brute force attacks
   * NOTE: Temporarily increased from 10 to 100 for debugging - revert after testing!
   */
  TOKEN: {
    limit: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  /**
   * Registration endpoint
   * More lenient for better UX but still protected
   */
  REGISTER: {
    limit: 25,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Token refresh endpoint
   */
  REFRESH: {
    limit: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  /**
   * Logout endpoint
   */
  LOGOUT: {
    limit: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  /**
   * Password change endpoint
   * Stricter limit for security
   */
  PASSWORD_CHANGE: {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Forgot password endpoint
   * Stricter to prevent email bombing
   */
  FORGOT_PASSWORD: {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Reset password endpoint
   */
  RESET_PASSWORD: {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Email verification endpoint
   */
  VERIFY_EMAIL: {
    limit: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Resend verification email
   * Stricter to prevent email bombing
   */
  RESEND_VERIFICATION: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Get rate limit key for an endpoint
 *
 * @param endpoint - The endpoint name (e.g., 'token', 'register')
 * @param identifier - The identifier (usually IP or user ID)
 * @returns Rate limit key string
 */
export function getRateLimitKey(endpoint: string, identifier: string): string {
  return `auth:${endpoint}:${identifier}`;
}
