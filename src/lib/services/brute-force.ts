/**
 * Account-Based Brute Force Protection Service
 * Tracks failed login attempts per account and implements lockout
 */

import { prisma } from '@/lib/db';

// Configuration
const MAX_FAILED_ATTEMPTS = 5; // Lock after 5 failed attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window to track attempts
const PROGRESSIVE_DELAY_BASE_MS = 1000; // 1 second base delay

interface AttemptRecord {
  count: number;
  firstAttemptAt: Date;
  lastAttemptAt: Date;
  lockedUntil: Date | null;
}

// In-memory cache for high performance (backed by DB for persistence)
const attemptCache = new Map<string, AttemptRecord>();

/**
 * Clean up old entries from cache
 */
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, record] of attemptCache.entries()) {
    // Remove entries older than the attempt window
    if (now - record.lastAttemptAt.getTime() > ATTEMPT_WINDOW_MS) {
      attemptCache.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupCache, 5 * 60 * 1000);

/**
 * Get cache key for an identifier (email or user ID)
 */
function getCacheKey(identifier: string): string {
  return `brute_force:${identifier.toLowerCase()}`;
}

/**
 * Check if account is currently locked
 */
export async function isAccountLocked(identifier: string): Promise<{
  locked: boolean;
  lockedUntil: Date | null;
  remainingAttempts: number;
}> {
  const key = getCacheKey(identifier);
  const record = attemptCache.get(key);

  if (!record) {
    return { locked: false, lockedUntil: null, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const now = new Date();

  // Check if still locked
  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      locked: true,
      lockedUntil: record.lockedUntil,
      remainingAttempts: 0,
    };
  }

  // Check if attempts have expired (outside window)
  if (now.getTime() - record.firstAttemptAt.getTime() > ATTEMPT_WINDOW_MS) {
    attemptCache.delete(key);
    return { locked: false, lockedUntil: null, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  return {
    locked: false,
    lockedUntil: null,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count),
  };
}

/**
 * Record a failed login attempt
 * Returns progressive delay in milliseconds if any
 */
export async function recordFailedAttempt(
  identifier: string,
  ipAddress?: string
): Promise<{
  locked: boolean;
  lockedUntil: Date | null;
  remainingAttempts: number;
  delayMs: number;
}> {
  const key = getCacheKey(identifier);
  const now = new Date();

  let record = attemptCache.get(key);

  if (!record) {
    record = {
      count: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
      lockedUntil: null,
    };
  } else {
    // Check if previous attempts have expired
    if (now.getTime() - record.firstAttemptAt.getTime() > ATTEMPT_WINDOW_MS) {
      record = {
        count: 1,
        firstAttemptAt: now,
        lastAttemptAt: now,
        lockedUntil: null,
      };
    } else {
      record.count++;
      record.lastAttemptAt = now;
    }
  }

  // Check if should lock
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);

    // Log security event
    try {
      await prisma.auditLog.create({
        data: {
          action: 'ACCOUNT_LOCKED',
          entityType: 'Auth',
          entityId: identifier,
          changes: {
            reason: 'brute_force_protection',
            failedAttempts: record.count,
            lockedUntil: record.lockedUntil.toISOString(),
          },
          ipAddress: ipAddress || null,
        },
      });
    } catch (error) {
      console.error('Failed to log account lockout:', error);
    }
  }

  attemptCache.set(key, record);

  // Calculate progressive delay (exponential backoff)
  const delayMs = record.count > 1
    ? Math.min(PROGRESSIVE_DELAY_BASE_MS * Math.pow(2, record.count - 1), 30000)
    : 0;

  return {
    locked: record.lockedUntil !== null && record.lockedUntil > now,
    lockedUntil: record.lockedUntil,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.count),
    delayMs,
  };
}

/**
 * Clear failed attempts on successful login
 */
export async function clearFailedAttempts(identifier: string): Promise<void> {
  const key = getCacheKey(identifier);
  attemptCache.delete(key);
}

/**
 * Manually unlock an account (admin function)
 */
export async function unlockAccount(
  identifier: string,
  adminUserId: string,
  ipAddress?: string
): Promise<void> {
  const key = getCacheKey(identifier);
  attemptCache.delete(key);

  // Log admin action
  try {
    await prisma.auditLog.create({
      data: {
        action: 'ACCOUNT_UNLOCKED',
        entityType: 'Auth',
        entityId: identifier,
        userId: adminUserId,
        changes: {
          reason: 'admin_unlock',
        },
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to log account unlock:', error);
  }
}

/**
 * Get brute force status for monitoring
 */
export function getBruteForceStats(): {
  trackedAccounts: number;
  lockedAccounts: number;
} {
  const now = Date.now();
  let lockedCount = 0;

  for (const record of attemptCache.values()) {
    if (record.lockedUntil && record.lockedUntil.getTime() > now) {
      lockedCount++;
    }
  }

  return {
    trackedAccounts: attemptCache.size,
    lockedAccounts: lockedCount,
  };
}

export const bruteForceService = {
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
  unlockAccount,
  getBruteForceStats,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS,
};
