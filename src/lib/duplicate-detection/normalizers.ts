/**
 * Normalization functions for unique identifiers
 * Ensures consistent format for exact duplicate matching
 */

/**
 * Normalize phone number to E.164-like format
 * Examples:
 *   "+421 911 123 456" -> "421911123456"
 *   "00421-911-123-456" -> "421911123456"
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // Remove leading zeros or + prefix
  normalized = normalized.replace(/^00/, '');

  // Return null if less than 9 digits (invalid phone)
  if (normalized.length < 9) return null;

  return normalized;
}

/**
 * Normalize email address
 * Examples:
 *   "  John.Doe@Example.COM  " -> "john.doe@example.com"
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  const trimmed = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return null;

  return trimmed;
}

/**
 * Normalize IBAN
 * Examples:
 *   "SK31 1200 0000 1987 4263 7541" -> "SK3112000000198742637541"
 */
export function normalizeIBAN(iban: string | null | undefined): string | null {
  if (!iban) return null;

  // Remove spaces and convert to uppercase
  const normalized = iban.replace(/\s/g, '').toUpperCase();

  // Basic IBAN validation (2 letters + 2 digits + up to 30 alphanumeric)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
  if (!ibanRegex.test(normalized)) return null;

  return normalized;
}

/**
 * Normalize crypto wallet address
 */
export function normalizeCryptoWallet(
  address: string | null | undefined,
  type: 'BTC' | 'ETH' | 'OTHER' = 'OTHER'
): string | null {
  if (!address) return null;

  const trimmed = address.trim();

  switch (type) {
    case 'ETH':
      // Ethereum addresses are case-sensitive (EIP-55 checksum)
      if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
      return trimmed; // Keep original case for checksum validation

    case 'BTC':
      // Bitcoin addresses - case insensitive for matching
      if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(trimmed)) {
        return null;
      }
      return trimmed.toLowerCase();

    default:
      return trimmed.toLowerCase();
  }
}

/**
 * Normalize license plate/SPZ
 * Examples:
 *   "BA 123 XY" -> "BA123XY"
 *   "ba-123-xy" -> "BA123XY"
 */
export function normalizeLicensePlate(plate: string | null | undefined): string | null {
  if (!plate) return null;

  // Remove spaces, dashes, and convert to uppercase
  const normalized = plate.replace(/[\s\-]/g, '').toUpperCase();

  // Must be 3-10 alphanumeric characters
  if (!/^[A-Z0-9]{3,10}$/.test(normalized)) return null;

  return normalized;
}

/**
 * Normalize VIN (Vehicle Identification Number)
 * Examples:
 *   "1hgbh41jxmn109186" -> "1HGBH41JXMN109186"
 */
export function normalizeVIN(vin: string | null | undefined): string | null {
  if (!vin) return null;

  // Remove spaces and convert to uppercase
  const normalized = vin.replace(/\s/g, '').toUpperCase();

  // VIN must be exactly 17 characters, no I, O, Q
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) return null;

  return normalized;
}

/**
 * Normalize company registration number (IČO for Slovakia/Czech)
 */
export function normalizeCompanyID(companyId: string | null | undefined): string | null {
  if (!companyId) return null;

  // Remove spaces and leading zeros
  const normalized = companyId.replace(/\s/g, '').replace(/^0+/, '');

  // Must be digits only
  if (!/^\d+$/.test(normalized)) return null;

  return normalized;
}

/**
 * Normalize all fields in a report
 */
export interface NormalizedFields {
  normalizedPhone: string | null;
  normalizedEmail: string | null;
  normalizedIBAN: string | null;
  normalizedCryptoWallet: string | null;
  normalizedLicensePlate: string | null;
  normalizedVIN: string | null;
  normalizedCompanyID: string | null;
}

export function normalizeAllFields(report: {
  phone?: string | null;
  email?: string | null;
  iban?: string | null;
  cryptoWallet?: string | null;
  cryptoType?: 'BTC' | 'ETH' | 'OTHER';
  licensePlate?: string | null;
  vin?: string | null;
  companyId?: string | null;
}): NormalizedFields {
  return {
    normalizedPhone: normalizePhone(report.phone),
    normalizedEmail: normalizeEmail(report.email),
    normalizedIBAN: normalizeIBAN(report.iban),
    normalizedCryptoWallet: normalizeCryptoWallet(
      report.cryptoWallet,
      report.cryptoType || 'OTHER'
    ),
    normalizedLicensePlate: normalizeLicensePlate(report.licensePlate),
    normalizedVIN: normalizeVIN(report.vin),
    normalizedCompanyID: normalizeCompanyID(report.companyId),
  };
}
