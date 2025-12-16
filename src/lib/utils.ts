/**
 * Utility Functions
 *
 * Common utility functions used throughout the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('sk-SK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'práve teraz';
  if (diffInSeconds < 3600) return `pred ${Math.floor(diffInSeconds / 60)} minútami`;
  if (diffInSeconds < 86400) return `pred ${Math.floor(diffInSeconds / 3600)} hodinami`;
  if (diffInSeconds < 604800) return `pred ${Math.floor(diffInSeconds / 86400)} dňami`;
  if (diffInSeconds < 2592000) return `pred ${Math.floor(diffInSeconds / 604800)} týždňami`;
  if (diffInSeconds < 31536000) return `pred ${Math.floor(diffInSeconds / 2592000)} mesiacmi`;
  return `pred ${Math.floor(diffInSeconds / 31536000)} rokmi`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ============================================
// Secure localStorage encryption utilities
// Uses Web Crypto API (AES-GCM) for browser-side encryption
// ============================================

const ENCRYPTION_KEY_NAME = 'secure_storage_key';

/**
 * Get or create encryption key for secure localStorage
 * Key is stored in sessionStorage (not localStorage) so it's cleared when browser closes
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Check if we have a key in session storage
  const storedKeyData = sessionStorage.getItem(ENCRYPTION_KEY_NAME);

  if (storedKeyData) {
    try {
      const keyData = JSON.parse(storedKeyData);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch {
      // Key is invalid, generate new one
    }
  }

  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Export and store in session storage
  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  sessionStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));

  return key;
}

/**
 * Encrypt data and store in localStorage
 * Data is encrypted with AES-GCM using a session-specific key
 */
export async function secureStorageSet(key: string, data: unknown): Promise<void> {
  try {
    const cryptoKey = await getEncryptionKey();
    const dataString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Store as base64
    const base64 = btoa(String.fromCharCode(...combined));
    localStorage.setItem(key, base64);
  } catch (error) {
    console.error('Failed to encrypt data for localStorage:', error);
    // Fall back to unencrypted storage if crypto fails
    localStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * Retrieve and decrypt data from localStorage
 */
export async function secureStorageGet<T>(key: string): Promise<T | null> {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    // Try to decrypt
    const cryptoKey = await getEncryptionKey();

    // Decode base64
    const combined = new Uint8Array(
      atob(stored)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString) as T;
  } catch {
    // If decryption fails, try to read as plain JSON (legacy data)
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }
}

/**
 * Remove item from secure localStorage
 */
export function secureStorageRemove(key: string): void {
  localStorage.removeItem(key);
}
