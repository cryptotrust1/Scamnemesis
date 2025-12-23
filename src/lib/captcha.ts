/**
 * Cloudflare Turnstile CAPTCHA Server-side Verification
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

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

  // In development with test key, always succeed
  if (process.env.NODE_ENV === 'development' &&
      TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA') {
    console.log('[CAPTCHA] Development mode - skipping verification');
    return { success: true };
  }

  if (!token) {
    return { success: false, errors: ['missing-token'] };
  }

  // Accept test tokens in development
  if (process.env.NODE_ENV === 'development' && token.startsWith('test_')) {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
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
 * Check if CAPTCHA is enabled
 */
export function isCaptchaEnabled(): boolean {
  // Disabled if no real key is set
  if (!process.env.TURNSTILE_SECRET_KEY ||
      process.env.TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA') {
    return false;
  }
  return true;
}
