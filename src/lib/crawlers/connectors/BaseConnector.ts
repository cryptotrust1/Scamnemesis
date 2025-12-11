/**
 * Base Connector Class
 * Abstract base class for all crawler connectors
 */

import crypto from 'crypto';
import { ConnectorConfig, CrawlResult, ExtractedEntity, SanctionEntry } from '../queue';

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

export abstract class BaseConnector {
  protected config: ConnectorConfig;

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  /**
   * Fetch data from the source
   * Must be implemented by subclasses
   */
  abstract fetch(): Promise<CrawlResult[] | SanctionEntry[]>;

  /**
   * Get connector ID
   */
  get id(): string {
    return this.config.id;
  }

  /**
   * Get connector name
   */
  get name(): string {
    return this.config.name;
  }

  /**
   * Check if rate limit allows request
   */
  protected async checkRateLimit(): Promise<boolean> {
    if (!this.config.rateLimit) return true;

    const [limitStr, windowStr] = this.config.rateLimit.split('/');
    const limit = parseInt(limitStr);
    const window = this.parseWindow(windowStr);

    const key = `ratelimit:${this.config.id}`;
    const now = Date.now();
    const cached = rateLimitCache.get(key);

    if (!cached || cached.resetAt < now) {
      rateLimitCache.set(key, { count: 1, resetAt: now + window });
      return true;
    }

    if (cached.count >= limit) {
      return false;
    }

    cached.count++;
    return true;
  }

  /**
   * Parse window string to milliseconds
   */
  private parseWindow(window: string): number {
    switch (window) {
      case 'minute':
      case 'min':
        return 60 * 1000;
      case 'hour':
        return 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
      case 'month':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000; // default: 1 hour
    }
  }

  /**
   * Compute SHA-256 hash of content
   */
  protected computeContentHash(content: string): string {
    const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Make HTTP request with retry logic
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'User-Agent': 'ScamnemesisBot/1.0 (+https://scamnemesis.com/bot)',
      Accept: 'application/json, application/xml, text/xml, */*',
      ...this.config.headers,
      ...(options.headers as Record<string, string>),
    };

    // Add API key if configured
    if (this.config.apiKeyEnv) {
      const apiKey = process.env[this.config.apiKeyEnv];
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (response.ok) {
          return response;
        }

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Retry on server errors (5xx)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
        }
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000;
        await this.sleep(delay);
      }
    }

    throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
  }

  /**
   * Extract entities from text using regex patterns
   */
  protected extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // Phone patterns
    const phonePattern = /(?:\+|00)?[1-9]\d{0,2}[-\s.]?\(?\d{1,4}\)?[-\s.]?\d{1,4}[-\s.]?\d{1,9}/g;
    for (const match of text.matchAll(phonePattern)) {
      entities.push({
        type: 'PHONE',
        value: match[0],
        normalizedValue: match[0].replace(/[-\s.()]/g, ''),
        confidence: 0.8,
        position: { start: match.index!, end: match.index! + match[0].length },
      });
    }

    // Email patterns
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    for (const match of text.matchAll(emailPattern)) {
      entities.push({
        type: 'EMAIL',
        value: match[0],
        normalizedValue: match[0].toLowerCase(),
        confidence: 0.95,
        position: { start: match.index!, end: match.index! + match[0].length },
      });
    }

    // IBAN patterns
    const ibanPattern = /\b[A-Z]{2}\d{2}[-\s]?(?:[A-Z0-9]{4}[-\s]?){2,7}[A-Z0-9]{1,4}\b/gi;
    for (const match of text.matchAll(ibanPattern)) {
      const normalized = match[0].replace(/[-\s]/g, '').toUpperCase();
      if (this.validateIBAN(normalized)) {
        entities.push({
          type: 'IBAN',
          value: match[0],
          normalizedValue: normalized,
          confidence: 0.95,
          position: { start: match.index!, end: match.index! + match[0].length },
        });
      }
    }

    // Crypto wallet patterns
    const btcPattern = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g;
    for (const match of text.matchAll(btcPattern)) {
      entities.push({
        type: 'CRYPTO',
        value: match[0],
        normalizedValue: match[0],
        confidence: 0.9,
        position: { start: match.index!, end: match.index! + match[0].length },
      });
    }

    const ethPattern = /\b0x[a-fA-F0-9]{40}\b/g;
    for (const match of text.matchAll(ethPattern)) {
      entities.push({
        type: 'CRYPTO',
        value: match[0],
        normalizedValue: match[0].toLowerCase(),
        confidence: 0.9,
        position: { start: match.index!, end: match.index! + match[0].length },
      });
    }

    return entities;
  }

  /**
   * Validate IBAN checksum
   */
  private validateIBAN(iban: string): boolean {
    if (iban.length < 15 || iban.length > 34) return false;

    // Move first 4 chars to end
    const rearranged = iban.slice(4) + iban.slice(0, 4);

    // Convert letters to numbers (A=10, B=11, etc.)
    let numeric = '';
    for (const char of rearranged) {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        numeric += (code - 55).toString();
      } else {
        numeric += char;
      }
    }

    // Mod 97 check
    let remainder = 0;
    for (const digit of numeric) {
      remainder = (remainder * 10 + parseInt(digit)) % 97;
    }

    return remainder === 1;
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Normalize name for comparison
   */
  protected normalizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Create log entry
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      connector: this.config.id,
      message,
      ...data,
    };

    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(sourceId: string) {
    super(`Rate limit exceeded for source: ${sourceId}`);
    this.name = 'RateLimitError';
  }
}

/**
 * Connector factory
 */
export class ConnectorFactory {
  private static connectors = new Map<string, new (config: ConnectorConfig) => BaseConnector>();

  static register(type: string, connectorClass: new (config: ConnectorConfig) => BaseConnector): void {
    this.connectors.set(type, connectorClass);
  }

  static create(config: ConnectorConfig): BaseConnector {
    const ConnectorClass = this.connectors.get(config.type);
    if (!ConnectorClass) {
      throw new Error(`Unknown connector type: ${config.type}`);
    }
    return new ConnectorClass(config);
  }
}
