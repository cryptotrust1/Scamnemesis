/**
 * Core masking functions for different data types
 * @module masking/functions
 */

import { MaskingOptions, Address } from './types';
import { deterministicMask } from './utils/hash';

/**
 * Mask a name - preserve first 2 chars and last char per token, mask middle with 'x'
 *
 * Algorithm:
 * - Split on whitespace
 * - For each token:
 *   - If length <= 3: show first char + 'x' * (length-1)
 *   - If length > 3: show first 2 chars + 'x' * (length-3) + last char
 * - Join with spaces
 *
 * @param name - Full name to mask
 * @param options - Masking options
 * @returns Masked name
 *
 * @example
 * maskName("Vladimir Gala") → "Vlxxxxr Gxa"
 * maskName("John") → "Joxn"
 * maskName("Al") → "Ax"
 */
export function maskName(name: string, options: MaskingOptions): string {
  if (!name || typeof name !== 'string') return '';

  const maskToken = (token: string): string => {
    const trimmed = token.trim();
    if (trimmed.length === 0) return '';
    if (trimmed.length === 1) return trimmed;
    if (trimmed.length === 2) return trimmed[0] + 'x';
    if (trimmed.length === 3) return trimmed[0] + 'x' + trimmed[2];

    // For longer names
    const first = trimmed.substring(0, 2);
    const last = trimmed[trimmed.length - 1];
    const middleLength = trimmed.length - 3;
    const middle = 'x'.repeat(middleLength);

    return first + middle + last;
  };

  const maskingFn = (val: string, _seed?: number): string => {
    // Split by whitespace and hyphens, preserving separators
    const parts = val.split(/(\s+|-)/);
    return parts
      .map((part) => {
        if (part.match(/^\s+$/) || part === '-') {
          return part; // Preserve whitespace and hyphens
        }
        return maskToken(part);
      })
      .join('');
  };

  if (options.deterministicHash && options.salt) {
    return deterministicMask(name, maskingFn, options.salt);
  }

  return maskingFn(name);
}

/**
 * Partial name masking - show full first name, mask last name
 *
 * @param name - Full name to mask
 * @param options - Masking options
 * @returns Partially masked name
 *
 * @example
 * maskNamePartial("Vladimir Gala") → "Vladimir G."
 */
export function maskNamePartial(name: string, options: MaskingOptions): string {
  if (!name || typeof name !== 'string') return '';

  const tokens = name.trim().split(/\s+/);
  if (tokens.length === 1) return maskName(name, options);

  const firstName = tokens[0];
  const lastInitial = tokens[tokens.length - 1][0];

  return `${firstName} ${lastInitial}.`;
}

/**
 * Mask phone number - mask middle 60% of digits
 *
 * Algorithm:
 * - Extract all digits
 * - Preserve country code (first 1-4 digits)
 * - Calculate middle 60% of remaining digits
 * - Replace middle digits with 'x'
 * - Reconstruct with original formatting
 *
 * @param phone - Phone number to mask
 * @param options - Masking options
 * @returns Masked phone number
 *
 * @example
 * maskPhone("+421 912 345 678") → "+421 9xx xxx 678"
 * maskPhone("+1 (555) 123-4567") → "+1 (5xx) xxx-567"
 */
export function maskPhone(phone: string, options: MaskingOptions): string {
  if (!phone || typeof phone !== 'string') return '';

  const maskingFn = (val: string, _seed?: number): string => {
    // Extract digits and formatting
    const digits = val.replace(/\D/g, '');
    if (digits.length < 6) {
      // Too short, mask all except last 2
      const visible = digits.slice(-2);
      const masked = 'x'.repeat(Math.max(0, digits.length - 2));
      return masked + visible;
    }

    // Detect country code
    let countryCodeLength = 0;
    if (val.startsWith('+') || val.startsWith('00')) {
      countryCodeLength = val.startsWith('+') ? 1 : 2;
      // Add 1-3 more digits for actual country code
      if (digits.length > 10) countryCodeLength += 2;
      else countryCodeLength += 1;
    }

    const countryCode = digits.substring(0, countryCodeLength);
    const remaining = digits.substring(countryCodeLength);

    // Mask middle 60%
    const visibleStart = Math.ceil(remaining.length * 0.2);
    const visibleEnd = Math.floor(remaining.length * 0.8);

    const start = remaining.substring(0, visibleStart);
    const middle = 'x'.repeat(visibleEnd - visibleStart);
    const end = remaining.substring(visibleEnd);

    const maskedDigits = countryCode + start + middle + end;

    // Reconstruct with original formatting
    let result = '';
    let digitIndex = 0;

    for (let i = 0; i < val.length; i++) {
      if (/\d/.test(val[i])) {
        result += maskedDigits[digitIndex] || 'x';
        digitIndex++;
      } else {
        result += val[i];
      }
    }

    return result;
  };

  if (options.deterministicHash && options.salt) {
    return deterministicMask(phone, maskingFn, options.salt);
  }

  return maskingFn(phone);
}

/**
 * Partial phone masking - show country code and last 3 digits
 *
 * @param phone - Phone number to mask
 * @param options - Masking options
 * @returns Partially masked phone
 *
 * @example
 * maskPhonePartial("+421 912 345 678") → "+421 xxx xxx 678"
 */
export function maskPhonePartial(phone: string, options: MaskingOptions): string {
  if (!phone || typeof phone !== 'string') return '';

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return maskPhone(phone, options);

  // Show first 1-3 and last 3
  const countryCodeLength = phone.startsWith('+') || phone.startsWith('00') ?
    (phone.startsWith('+') ? 3 : 4) : 0;

  const prefix = digits.substring(0, countryCodeLength);
  const suffix = digits.slice(-3);
  const middleLength = digits.length - countryCodeLength - 3;

  return phone.startsWith('+') ?
    `+${prefix} ${'x'.repeat(middleLength)} ${suffix}` :
    `${prefix}${'x'.repeat(middleLength)}${suffix}`;
}

/**
 * Mask email address - show first char + ***** + @domain
 *
 * Algorithm:
 * - Split on '@'
 * - Local part: first char + '*****'
 * - Domain: fully visible
 *
 * @param email - Email to mask
 * @param options - Masking options
 * @returns Masked email
 *
 * @example
 * maskEmail("john.doe@example.com") → "j*****@example.com"
 */
export function maskEmail(email: string, options: MaskingOptions): string {
  if (!email || typeof email !== 'string') return '';

  const maskingFn = (val: string, _seed?: number): string => {
    const atIndex = val.lastIndexOf('@');
    if (atIndex === -1) {
      // Invalid email, mask everything
      return '*'.repeat(Math.min(val.length, 8));
    }

    const localPart = val.substring(0, atIndex);
    const domain = val.substring(atIndex);

    if (localPart.length === 0) return '*****' + domain;
    if (localPart.length === 1) return localPart[0] + '*****' + domain;

    return localPart[0] + '*****' + domain;
  };

  if (options.deterministicHash && options.salt) {
    return deterministicMask(email, maskingFn, options.salt);
  }

  return maskingFn(email);
}

/**
 * Partial email masking - show first 3 chars of local part
 *
 * @param email - Email to mask
 * @param options - Masking options
 * @returns Partially masked email
 *
 * @example
 * maskEmailPartial("john.doe@example.com") → "joh*****@example.com"
 */
export function maskEmailPartial(email: string, options: MaskingOptions): string {
  if (!email || typeof email !== 'string') return '';

  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) return maskEmail(email, options);

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  const visible = localPart.substring(0, Math.min(3, localPart.length));
  return visible + '*****' + domain;
}

/**
 * Mask IBAN - show first 4 (country + check) + masked middle + last 2
 *
 * Algorithm:
 * - Remove all spaces/formatting
 * - Preserve first 4 chars
 * - Mask middle with '*'
 * - Preserve last 2 chars
 * - Reformat in groups of 4
 *
 * @param iban - IBAN to mask
 * @param options - Masking options
 * @returns Masked IBAN
 *
 * @example
 * maskIBAN("SK89 1100 0000 0029 4912 9426") → "SK89 **** **** **** **** **26"
 */
export function maskIBAN(iban: string, options: MaskingOptions): string {
  if (!iban || typeof iban !== 'string') return '';

  const maskingFn = (val: string, _seed?: number): string => {
    // Remove all spaces and formatting
    const clean = val.replace(/\s/g, '').toUpperCase();

    if (clean.length < 8) {
      // Too short for proper IBAN masking
      const first = clean.substring(0, 2);
      const last = clean[clean.length - 1];
      const middle = '*'.repeat(Math.max(0, clean.length - 3));
      return first + middle + last;
    }

    const first4 = clean.substring(0, 4);
    const last2 = clean.slice(-2);
    const middleLength = clean.length - 6;
    const middle = '*'.repeat(middleLength);

    const masked = first4 + middle + last2;

    // Reformat in groups of 4 with spaces
    return masked.match(/.{1,4}/g)?.join(' ') || masked;
  };

  if (options.deterministicHash && options.salt) {
    return deterministicMask(iban, maskingFn, options.salt);
  }

  return maskingFn(iban);
}

/**
 * Mask IPv4 address - mask last octet
 *
 * @param ip - IPv4 address to mask
 * @param options - Masking options
 * @returns Masked IP
 *
 * @example
 * maskIPv4("192.168.1.100") → "192.168.1.xxx"
 */
export function maskIPv4(ip: string, _options: MaskingOptions): string {
  if (!ip || typeof ip !== 'string') return '';

  const parts = ip.split('.');
  if (parts.length !== 4) return ip; // Invalid IPv4

  parts[3] = 'xxx';
  return parts.join('.');
}

/**
 * Mask IPv6 address - mask last 80%
 *
 * @param ip - IPv6 address to mask
 * @param options - Masking options
 * @returns Masked IP
 *
 * @example
 * maskIPv6("2001:0db8:85a3::8a2e:0370:7334") → "2001:0db8:****:****:****:****:****:****"
 */
export function maskIPv6(ip: string, _options: MaskingOptions): string {
  if (!ip || typeof ip !== 'string') return '';

  // Simple approach: show first 2 hextets, mask the rest
  const parts = ip.split(':');
  if (parts.length < 3) return ip; // Invalid IPv6

  const visible = parts.slice(0, 2);
  const masked = Array(Math.max(0, 8 - visible.length)).fill('****');

  return [...visible, ...masked].join(':');
}

/**
 * Mask IP address (auto-detect IPv4 or IPv6)
 *
 * @param ip - IP address to mask
 * @param options - Masking options
 * @returns Masked IP
 */
export function maskIP(ip: string, options: MaskingOptions): string {
  if (!ip || typeof ip !== 'string') return '';

  if (ip.includes(':')) {
    return maskIPv6(ip, options);
  }

  return maskIPv4(ip, options);
}

/**
 * Mask cryptocurrency wallet - show first 6 + '...' + last 4
 *
 * @param wallet - Wallet address to mask
 * @param options - Masking options
 * @returns Masked wallet
 *
 * @example
 * maskWallet("0x742d35Cc6634C0532925a3b844Bc9e7595f5a3") → "0x742d...f5a3"
 */
export function maskWallet(wallet: string, options: MaskingOptions): string {
  if (!wallet || typeof wallet !== 'string') return '';

  const maskingFn = (val: string, _seed?: number): string => {
    if (val.length < 12) {
      // Too short
      const first = val.substring(0, 4);
      const last = val.slice(-2);
      return `${first}...${last}`;
    }

    const first6 = val.substring(0, 6);
    const last4 = val.slice(-4);

    return `${first6}...${last4}`;
  };

  if (options.deterministicHash && options.salt) {
    return deterministicMask(wallet, maskingFn, options.salt);
  }

  return maskingFn(wallet);
}

/**
 * Mask vehicle registration plate (SPZ) - first 2 + *** + last 1
 *
 * @param spz - Registration plate to mask
 * @param options - Masking options
 * @returns Masked SPZ
 *
 * @example
 * maskSPZ("BA123CD") → "BA***D"
 */
export function maskSPZ(spz: string, options: MaskingOptions): string {
  if (!spz || typeof spz !== 'string') return '';

  const maskingFn = (val: string, _seed?: number): string => {
    const clean = val.replace(/[\s-]/g, '').toUpperCase();

    if (clean.length < 4) {
      return clean[0] + '*'.repeat(Math.max(0, clean.length - 1));
    }

    const first2 = clean.substring(0, 2);
    const last1 = clean[clean.length - 1];
    const middle = '***';

    return first2 + middle + last1;
  };

  if (options.deterministicHash && options.salt) {
    return deterministicMask(spz, maskingFn, options.salt);
  }

  return maskingFn(spz);
}

/**
 * Mask VIN - first 3 + *** + last 2
 *
 * @param vin - VIN to mask
 * @param options - Masking options
 * @returns Masked VIN
 *
 * @example
 * maskVIN("1HGBH41JXMN109186") → "1HG***86"
 */
export function maskVIN(vin: string, options: MaskingOptions): string {
  if (!vin || typeof vin !== 'string') return '';

  const maskingFn = (val: string, _seed?: number): string => {
    const clean = val.replace(/\s/g, '').toUpperCase();

    if (clean.length !== 17) {
      // Invalid VIN, apply generic rule
      if (clean.length < 6) {
        return clean.substring(0, 2) + '***';
      }
      return clean.substring(0, 3) + '***' + clean.slice(-2);
    }

    const first3 = clean.substring(0, 3);
    const last2 = clean.slice(-2);

    return `${first3}***${last2}`;
  };

  if (options.deterministicHash && options.salt) {
    return deterministicMask(vin, maskingFn, options.salt);
  }

  return maskingFn(vin);
}

/**
 * Mask address based on role level
 *
 * @param address - Address object to mask
 * @param options - Masking options
 * @returns Masked address
 */
export function maskAddress(
  address: Address,
  options: MaskingOptions
): Address {
  if (!address) return {};

  const { role } = options;

  // BASIC (0): Country only
  if (role === 0) {
    return {
      country: address.country,
    };
  }

  // STANDARD (1): Country, City, partial postal code
  if (role === 1) {
    return {
      city: address.city,
      postalCode: address.postalCode
        ? address.postalCode.substring(0, 3) + '**'
        : undefined,
      country: address.country,
    };
  }

  // GOLD (2+): Everything
  return address;
}

/**
 * Mask date based on role level
 *
 * @param date - Date to mask
 * @param options - Masking options
 * @returns Masked date string
 */
export function maskDate(date: Date | string, options: MaskingOptions): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const { role } = options;

  // BASIC (0): Year and month only
  if (role === 0) {
    return dateObj.toISOString().substring(0, 7) + '-XX';
  }

  // STANDARD (1): Full date, no time
  if (role === 1) {
    return dateObj.toISOString().substring(0, 10);
  }

  // GOLD (2+): Full timestamp
  return dateObj.toISOString();
}

/**
 * Mask monetary amount based on role level
 *
 * @param amount - Amount to mask
 * @param currency - Currency code
 * @param options - Masking options
 * @returns Masked amount string
 */
export function maskAmount(
  amount: number,
  currency: string = 'USD',
  options: MaskingOptions
): string {
  if (typeof amount !== 'number') return '';

  const { role } = options;

  // BASIC (0): Order of magnitude
  if (role === 0) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(amount)));
    const lower = magnitude;
    const upper = magnitude * 10;
    return `${currency} ${lower.toLocaleString()} - ${upper.toLocaleString()}`;
  }

  // STANDARD (1): Rounded to nearest hundred
  if (role === 1) {
    const rounded = Math.round(amount / 100) * 100;
    return `${currency} ${rounded.toLocaleString()}`;
  }

  // GOLD (2+): Exact amount
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
