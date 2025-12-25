/**
 * JWT Authentication Utilities
 *
 * This module provides centralized JWT handling for the authentication system.
 * All auth endpoints should use these functions for token generation and verification.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { UserRole } from '@prisma/client';

// JWT Configuration Constants
export const JWT_ISSUER = 'scamnemesis';
export const JWT_AUDIENCE = 'scamnemesis-api';

/**
 * Password validation regex
 * Requires: 9+ chars, uppercase, lowercase, number, and special character
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

/**
 * Password requirements message for user feedback
 */
export const PASSWORD_REQUIREMENTS =
  'Password must be at least 9 characters and contain at least one uppercase letter, ' +
  'one lowercase letter, one number, and one special character (!@#$%^&*...)';

/**
 * Validate password against requirements
 *
 * @param password - Password to validate
 * @returns true if password meets requirements
 */
export function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

// Lazy initialization of JWT secret to avoid build-time errors
let _jwtSecret: Uint8Array | null = null;
let _jwtSecretString: string | null = null;

/**
 * Get JWT secret as Uint8Array (for jose library)
 * Use this for token generation and verification with jose
 *
 * @throws Error if JWT_SECRET is not set
 * @returns JWT secret as Uint8Array
 */
export function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;

  const jwtSecretString = process.env.JWT_SECRET;

  // JWT_SECRET is required in all environments for security
  if (!jwtSecretString) {
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Please set JWT_SECRET in your .env file with a secure random string (min 32 characters).'
    );
  }

  _jwtSecretString = jwtSecretString;
  _jwtSecret = new TextEncoder().encode(jwtSecretString);

  return _jwtSecret;
}

/**
 * Get JWT secret as string
 * Use this for cases where you need the raw string (e.g., manual JWT operations)
 *
 * @throws Error if JWT_SECRET is not set
 * @returns JWT secret as string
 */
export function getJwtSecretString(): string {
  if (_jwtSecretString) return _jwtSecretString;

  const jwtSecretString = process.env.JWT_SECRET;

  // JWT_SECRET is required in all environments for security
  if (!jwtSecretString) {
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Please set JWT_SECRET in your .env file with a secure random string (min 32 characters).'
    );
  }

  _jwtSecretString = jwtSecretString;
  _jwtSecret = new TextEncoder().encode(jwtSecretString);

  return _jwtSecretString;
}

export interface TokenPayload extends JWTPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  scopes: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  scopes: string[];
}

/**
 * Generate access token
 */
export async function generateAccessToken(
  userId: string,
  email: string,
  role: UserRole,
  scopes: string[]
): Promise<string> {
  const expiresIn = '1h';

  const token = await new SignJWT({
    sub: userId,
    email,
    role,
    scopes,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());

  return token;
}

/**
 * Generate refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const expiresIn = '7d';

  const token = await new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());

  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Get default scopes for a role
 */
export function getScopesForRole(role: UserRole): string[] {
  const baseScopes = ['reports:read', 'search:read'];

  switch (role) {
    case 'BASIC':
      // BASIC users can submit fraud reports (they are typically victims)
      return [...baseScopes, 'reports:write'];

    case 'STANDARD':
      return [...baseScopes, 'reports:write', 'search:face'];

    case 'GOLD':
      return [...baseScopes, 'reports:write', 'search:face', 'reports:export'];

    case 'ADMIN':
      return [
        ...baseScopes,
        'reports:write',
        'search:face',
        'reports:export',
        'admin:read',
        'admin:approve',
        'admin:edit',
        'admin:moderate',
      ];

    case 'SUPER_ADMIN':
      return ['*'];

    default:
      return baseScopes;
  }
}

/**
 * Check if user has required scope
 */
export function hasScope(userScopes: string[], requiredScope: string): boolean {
  if (userScopes.includes('*')) return true;
  return userScopes.includes(requiredScope);
}

/**
 * Hash password using bcrypt-like approach with crypto
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 310000, // OWASP 2023: min 600k for SHA-256, using 310k for performance balance
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, storedHashHex] = hash.split(':');
  if (!saltHex || !storedHashHex) return false;

  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 310000, // OWASP 2023: min 600k for SHA-256, using 310k for performance balance
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashArray = new Uint8Array(derivedBits);
  const computedHashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');

  return computedHashHex === storedHashHex;
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  const prefix = 'sk_live_';
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return prefix + key;
}

/**
 * Generate email verification token
 *
 * @param userId - User ID
 * @param email - User email
 * @param expiresIn - Token expiration time (default: 24h)
 * @returns Signed JWT token
 */
export async function generateEmailVerificationToken(
  userId: string,
  email: string,
  expiresIn: string = '24h'
): Promise<string> {
  const token = await new SignJWT({
    sub: userId,
    email,
    type: 'email_verification',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());

  return token;
}

/**
 * Generate password reset token
 *
 * @param userId - User ID
 * @param email - User email
 * @param expiresIn - Token expiration time (default: 1h)
 * @returns Signed JWT token
 */
export async function generatePasswordResetToken(
  userId: string,
  email: string,
  expiresIn: string = '1h'
): Promise<string> {
  const token = await new SignJWT({
    sub: userId,
    email,
    type: 'password_reset',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());

  return token;
}

/**
 * Verify a special-purpose token (email verification, password reset)
 *
 * @param token - Token to verify
 * @param expectedType - Expected token type
 * @returns Token payload or null if invalid
 */
export async function verifySpecialToken(
  token: string,
  expectedType: 'email_verification' | 'password_reset'
): Promise<{ sub: string; email: string; type: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
    });

    if (payload.type !== expectedType) {
      return null;
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      type: payload.type as string,
    };
  } catch {
    return null;
  }
}
