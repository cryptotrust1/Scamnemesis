/**
 * JWT Authentication Utilities
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { UserRole } from '@prisma/client';

// JWT Secret - MUST be set in production
const jwtSecretString = process.env.JWT_SECRET;
if (!jwtSecretString) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  console.warn('[JWT] WARNING: JWT_SECRET not set. Using development fallback. Set JWT_SECRET for production!');
}
const JWT_SECRET = new TextEncoder().encode(
  jwtSecretString || 'dev-jwt-secret-not-for-production'
);
const JWT_ISSUER = 'scamnemesis';
const JWT_AUDIENCE = 'scamnemesis-api';

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
    .sign(JWT_SECRET);

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
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
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
      return baseScopes;

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
      iterations: 100000,
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
      iterations: 100000,
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
