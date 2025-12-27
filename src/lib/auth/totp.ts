import crypto from 'crypto';

/**
 * TOTP (Time-based One-Time Password) Implementation
 * RFC 6238 compliant using native Node.js crypto
 */

// Base32 alphabet (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a random base32 secret for TOTP
 */
export function generateSecret(length = 32): string {
  const buffer = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < buffer.length; i++) {
    secret += BASE32_ALPHABET[buffer[i] % 32];
  }
  return secret;
}

/**
 * Decode base32 string to buffer
 */
function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const output = [];
  let bits = 0;
  let value = 0;

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Generate TOTP code for a given secret and time
 * @param secret Base32 encoded secret
 * @param time Unix timestamp (defaults to current time)
 * @param window Time window in seconds (default 30s as per RFC)
 * @param digits Number of digits in code (default 6)
 */
export function generateTOTP(
  secret: string,
  time = Math.floor(Date.now() / 1000),
  window = 30,
  digits = 6
): string {
  // Calculate time step
  const counter = Math.floor(time / window);

  // Convert counter to 8-byte buffer (big-endian)
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  // Decode secret
  const key = base32Decode(secret);

  // Calculate HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  // Generate code
  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Verify a TOTP code
 * @param token The code to verify
 * @param secret Base32 encoded secret
 * @param tolerance Number of windows to check before/after current time (default 1)
 */
export function verifyTOTP(
  token: string,
  secret: string,
  tolerance = 1
): boolean {
  const currentTime = Math.floor(Date.now() / 1000);

  // Clean the token
  const cleanToken = token.replace(/\s/g, '');

  // Check current and adjacent time windows
  for (let i = -tolerance; i <= tolerance; i++) {
    const checkTime = currentTime + (i * 30);
    const expectedToken = generateTOTP(secret, checkTime);

    // Constant-time comparison to prevent timing attacks
    if (crypto.timingSafeEqual(
      Buffer.from(cleanToken),
      Buffer.from(expectedToken)
    )) {
      return true;
    }
  }

  return false;
}

/**
 * Generate backup codes for account recovery
 * @param count Number of codes to generate (default 10)
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8 random bytes and convert to hex
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
}

/**
 * Hash backup codes for storage
 * We store hashed versions so even if DB is compromised, codes are safe
 */
export function hashBackupCode(code: string): string {
  return crypto
    .createHash('sha256')
    .update(code.toUpperCase().replace(/-/g, ''))
    .digest('hex');
}

/**
 * Verify a backup code against stored hashes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const inputHash = hashBackupCode(code);

  for (let i = 0; i < hashedCodes.length; i++) {
    try {
      if (crypto.timingSafeEqual(
        Buffer.from(inputHash, 'hex'),
        Buffer.from(hashedCodes[i], 'hex')
      )) {
        return i; // Return index of matched code
      }
    } catch {
      // Length mismatch or invalid hex, continue
      continue;
    }
  }

  return -1; // No match found
}

/**
 * Generate TOTP auth URL for QR code
 * This URL can be converted to QR code and scanned by authenticator apps
 */
export function generateTOTPAuthURL(
  secret: string,
  email: string,
  issuer = 'ScamNemesis'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate QR code as data URL for the TOTP auth URL
 * Uses a simple QR code generation approach without external libraries
 * Note: For production, consider using a proper QR library on the frontend
 */
export function generateQRCodeDataURL(authURL: string): string {
  // We'll return the auth URL and let the frontend generate the QR code
  // Using a URL-safe encoding
  return `data:text/plain;base64,${Buffer.from(authURL).toString('base64')}`;
}

export interface TOTPSetupData {
  secret: string;
  authURL: string;
  qrCodeData: string;
  backupCodes: string[];
  hashedBackupCodes: string[];
}

/**
 * Generate complete TOTP setup data for a user
 */
export function generateTOTPSetup(email: string, issuer = 'ScamNemesis'): TOTPSetupData {
  const secret = generateSecret();
  const authURL = generateTOTPAuthURL(secret, email, issuer);
  const backupCodes = generateBackupCodes(10);
  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  return {
    secret,
    authURL,
    qrCodeData: authURL, // Frontend will generate QR
    backupCodes, // Show once to user, then discard
    hashedBackupCodes, // Store these in database
  };
}
