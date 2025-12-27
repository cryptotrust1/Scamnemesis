import { NextRequest, NextResponse } from 'next/server';

// SECURITY: In production, TURNSTILE_SECRET_KEY must be set via environment variable
// Test key should ONLY be used in development
const TURNSTILE_TEST_KEY = '1x0000000000000000000000000000000AA';
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ||
  (process.env.NODE_ENV !== 'production' ? TURNSTILE_TEST_KEY : null);

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Verify Cloudflare Turnstile CAPTCHA token
 * POST /api/v1/captcha/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'CAPTCHA token is required' },
        { status: 400 }
      );
    }

    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    // SECURITY: Reject in production if secret key is not configured
    if (!TURNSTILE_SECRET_KEY) {
      console.error('[CAPTCHA] SECURITY ERROR: TURNSTILE_SECRET_KEY not configured in production!');
      return NextResponse.json(
        { success: false, error: 'CAPTCHA service not configured' },
        { status: 503 }
      );
    }

    // Verify with Cloudflare
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result: TurnstileResponse = await verifyResponse.json();

    if (result.success) {
      return NextResponse.json({
        success: true,
        verified: true,
        timestamp: result.challenge_ts,
      });
    }

    // Log failed verification for debugging
    console.warn('[CAPTCHA] Verification failed:', result['error-codes']);

    return NextResponse.json(
      {
        success: false,
        verified: false,
        errors: result['error-codes'] || ['verification-failed'],
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[CAPTCHA] Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'CAPTCHA verification failed' },
      { status: 500 }
    );
  }
}

// Note: For server-side CAPTCHA verification in other API routes,
// import { verifyCaptcha } from '@/lib/captcha' instead
