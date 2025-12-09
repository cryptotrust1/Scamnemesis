/**
 * Deterministic hashing utilities for data masking
 * @module utils/hash
 */

import * as crypto from 'crypto';

/**
 * Generate a deterministic hash for a given value
 * @param value - The value to hash
 * @param salt - Deployment-specific salt
 * @returns Hexadecimal hash string
 */
export function generateDeterministicHash(
  value: string,
  salt: string
): string {
  return crypto
    .createHmac('sha256', salt)
    .update(value.toLowerCase().trim())
    .digest('hex');
}

/**
 * Generate a seed from a hash for deterministic random operations
 * @param hash - The hash string
 * @returns Integer seed value
 */
export function hashToSeed(hash: string): number {
  return parseInt(hash.substring(0, 8), 16);
}

/**
 * Seeded random number generator for deterministic operations
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number (0 to 1)
   */
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate random integer in range [min, max)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min);
  }

  /**
   * Shuffle array deterministically
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Create a consistent masked value using hash-based mapping
 * @param value - Original value
 * @param maskingFn - Function to apply masking
 * @param salt - Deployment salt
 * @returns Masked value
 */
export function deterministicMask(
  value: string,
  maskingFn: (val: string, seed?: number) => string,
  salt: string
): string {
  if (!value) return value;

  const hash = generateDeterministicHash(value, salt);
  const seed = hashToSeed(hash);

  return maskingFn(value, seed);
}

/**
 * Handle hash collisions by appending hash suffix
 * @param maskedValue - The masked value
 * @param hash - The deterministic hash
 * @param existingMappings - Map of existing masked values
 * @returns Collision-free masked value
 */
export function handleCollision(
  maskedValue: string,
  hash: string,
  existingMappings: Map<string, string>
): string {
  const originalMapping = existingMappings.get(maskedValue);

  if (originalMapping && originalMapping !== hash) {
    // Collision detected, append hash suffix
    return `${maskedValue}#${hash.substring(0, 4)}`;
  }

  return maskedValue;
}

/**
 * Create a mapping table for deterministic masking
 */
export class MaskingMappingTable {
  private mappings: Map<string, { hash: string; masked: string }>;

  constructor() {
    this.mappings = new Map();
  }

  /**
   * Store a mapping between original hash and masked value
   */
  set(originalValue: string, hash: string, maskedValue: string): void {
    this.mappings.set(originalValue, { hash, masked: maskedValue });
  }

  /**
   * Retrieve masked value for original value
   */
  get(originalValue: string): string | undefined {
    return this.mappings.get(originalValue)?.masked;
  }

  /**
   * Check if a masked value already exists
   */
  hasMasked(maskedValue: string): boolean {
    return Array.from(this.mappings.values()).some(
      (entry) => entry.masked === maskedValue
    );
  }

  /**
   * Get hash for original value
   */
  getHash(originalValue: string): string | undefined {
    return this.mappings.get(originalValue)?.hash;
  }

  /**
   * Clear all mappings
   */
  clear(): void {
    this.mappings.clear();
  }

  /**
   * Get statistics about the mapping table
   */
  stats(): {
    totalEntries: number;
    uniqueMasked: number;
    collisions: number;
  } {
    const uniqueMasked = new Set(
      Array.from(this.mappings.values()).map((v) => v.masked)
    );

    return {
      totalEntries: this.mappings.size,
      uniqueMasked: uniqueMasked.size,
      collisions: this.mappings.size - uniqueMasked.size,
    };
  }
}

/**
 * Validate salt strength
 * @param salt - The salt to validate
 * @returns Validation result
 */
export function validateSalt(salt: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!salt) {
    errors.push('Salt is required');
  } else {
    if (salt.length < 32) {
      errors.push('Salt must be at least 32 characters (256 bits)');
    }

    if (!/^[a-f0-9]+$/.test(salt)) {
      errors.push('Salt must be hexadecimal string');
    }

    // Check entropy (simple check)
    const uniqueChars = new Set(salt.split('')).size;
    if (uniqueChars < 10) {
      errors.push('Salt has insufficient entropy');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a new cryptographically secure salt
 * @param length - Length in bytes (default 32)
 * @returns Hexadecimal salt string
 */
export function generateSalt(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Rotate salt while maintaining ability to decrypt old data
 */
export interface SaltRotation {
  currentSalt: string;
  previousSalt?: string;
  rotationDate: Date;
}

export class SaltManager {
  private currentSalt: string;
  private previousSalt?: string;
  private rotationDate?: Date;

  constructor(saltRotation: SaltRotation) {
    this.currentSalt = saltRotation.currentSalt;
    this.previousSalt = saltRotation.previousSalt;
    this.rotationDate = saltRotation.rotationDate;
  }

  /**
   * Get current salt for new operations
   */
  getCurrent(): string {
    return this.currentSalt;
  }

  /**
   * Get previous salt for legacy data
   */
  getPrevious(): string | undefined {
    return this.previousSalt;
  }

  /**
   * Rotate to a new salt
   */
  rotate(newSalt: string): void {
    this.previousSalt = this.currentSalt;
    this.currentSalt = newSalt;
    this.rotationDate = new Date();
  }

  /**
   * Try to unmask using current and previous salts
   */
  tryUnmask(
    value: string,
    unmaskFn: (val: string, salt: string) => string
  ): string | null {
    try {
      return unmaskFn(value, this.currentSalt);
    } catch {
      if (this.previousSalt) {
        try {
          return unmaskFn(value, this.previousSalt);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Check if salt rotation is needed (90 days)
   */
  needsRotation(): boolean {
    if (!this.rotationDate) return false;

    const daysSinceRotation =
      (Date.now() - this.rotationDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceRotation > 90;
  }
}
