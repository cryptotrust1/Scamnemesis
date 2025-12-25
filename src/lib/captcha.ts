/**
 * Cloudflare Turnstile CAPTCHA Server-side Verification
 */

// Test key that always passes - ONLY for development
const TURNSTILE_TEST_KEY = '1x0000000000000000000000000000000AA';

// Get secret key - NO fallback to test key in production for security
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export interface CaptchaVerificationResult {
  success: boolean;
  timestamp?: string;
  errors?: string[];
}

/**
 * Verify Cloudflare Turnstile CAPTCHA token
 * @param token - The CAPTCHA token from the client
 * @param ip - Optional client IP address
 * @returns Verification result
 */
export async function verifyCaptcha(
  token: string | undefined | null,
  ip?: string
): Promise<CaptchaVerificationResult> {
  // Skip verification in test environment
  if (process.env.NODE_ENV === 'test') {
    return { success: true };
  }

  // In development: allow skipping CAPTCHA if not configured
  // In production: CAPTCHA is REQUIRED - fail if not configured
  if (!isCaptchaEnabled()) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CAPTCHA] SECURITY ERROR: CAPTCHA not configured in production!');
      console.error('[CAPTCHA] Set TURNSTILE_SECRET_KEY environment variable.');
      return {
        success: false,
        errors: ['captcha-not-configured']
      };
    }
    // Development only: allow skipping
    console.warn('[CAPTCHA] Not enabled in development - skipping verification');
    return { success: true };
  }

  if (!token) {
    return { success: false, errors: ['missing-token'] };
  }

  // Determine which secret key to use
  const secretKey = TURNSTILE_SECRET_KEY || (process.env.NODE_ENV !== 'production' ? TURNSTILE_TEST_KEY : null);

  if (!secretKey) {
    console.error('[CAPTCHA] No secret key available');
    return { success: false, errors: ['captcha-not-configured'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result: TurnstileVerifyResponse = await response.json();

    if (result.success) {
      return {
        success: true,
        timestamp: result.challenge_ts,
      };
    }

    return {
      success: false,
      errors: result['error-codes'] || ['verification-failed'],
    };
  } catch (error) {
    console.error('[CAPTCHA] Verification error:', error);
    return {
      success: false,
      errors: ['network-error'],
    };
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  );
}

/**
 * Check if CAPTCHA is properly configured with a real (non-test) key
 */
export function isCaptchaEnabled(): boolean {
  const key = process.env.TURNSTILE_SECRET_KEY;

  // Not enabled if no key or using test key
  if (!key || key === TURNSTILE_TEST_KEY) {
    return false;
  }

  return true;
}

/**
 * Check if CAPTCHA should be required (for production environments)
 */
export function isCaptchaRequired(): boolean {
  return process.env.NODE_ENV === 'production';
}
