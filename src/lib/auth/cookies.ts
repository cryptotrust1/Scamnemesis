/**
 * Centralized Auth Cookie Management
 *
 * This module provides unified cookie handling for authentication tokens.
 * All auth endpoints should use these functions instead of defining their own.
 */

import { NextResponse } from 'next/server';

// Environment configuration
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Cookie configuration options
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'lax' as const,
  path: '/',
} as const;

/**
 * Token expiration times
 */
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 60 * 60, // 1 hour in seconds
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

/**
 * Set auth tokens as HttpOnly cookies on the response
 *
 * @param response - NextResponse object to set cookies on
 * @param accessToken - JWT access token
 * @param refreshToken - Optional JWT refresh token
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string
): void {
  // Access token cookie - 1 hour
  response.cookies.set('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
  });

  // Refresh token cookie - 7 days (only for password auth)
  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
      path: '/api/v1/auth', // Restrict to auth endpoints only
    });
  }
}

/**
 * Clear auth cookies on the response
 * Used for logout and session invalidation
 *
 * @param response - NextResponse object to clear cookies on
 */
export function clearAuthCookies(response: NextResponse): void {
  // Clear access token
  response.cookies.set('access_token', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  // Clear refresh token
  response.cookies.set('refresh_token', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
    path: '/api/v1/auth',
  });
}

/**
 * Get access token from cookies
 *
 * @param cookies - Cookie store (from request.cookies)
 * @returns Access token string or null
 */
export function getAccessTokenFromCookies(
  cookies: { get: (name: string) => { value: string } | undefined }
): string | null {
  return cookies.get('access_token')?.value || null;
}

/**
 * Get refresh token from cookies
 *
 * @param cookies - Cookie store (from request.cookies)
 * @returns Refresh token string or null
 */
export function getRefreshTokenFromCookies(
  cookies: { get: (name: string) => { value: string } | undefined }
): string | null {
  return cookies.get('refresh_token')?.value || null;
}
