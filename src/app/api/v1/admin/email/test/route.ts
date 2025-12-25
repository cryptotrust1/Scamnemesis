/**
 * Admin Email Test API Route
 *
 * POST /api/v1/admin/email/test - Send a test email to verify configuration
 * GET /api/v1/admin/email/test - Check email service configuration status
 *
 * Requires ADMIN or SUPER_ADMIN role
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { sendEmail } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

const TestEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  include_diagnostics: z.boolean().optional().default(true),
});

/**
 * GET /api/v1/admin/email/test
 * Check email service configuration status
 */
export async function GET(request: NextRequest) {
  // Require admin authentication
  const authResult = await requireAuth(request, ['admin:read']);
  if (authResult instanceof NextResponse) return authResult;

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@scamnemesis.com';
  const siteName = process.env.SITE_NAME || 'ScamNemesis';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

  // Check configuration
  const config = {
    resend_api_key_set: !!resendApiKey && resendApiKey.trim() !== '',
    resend_api_key_format: resendApiKey ? (resendApiKey.startsWith('re_') ? 'valid' : 'invalid_format') : 'missing',
    resend_api_key_length: resendApiKey ? resendApiKey.length : 0,
    from_email: fromEmail,
    site_name: siteName,
    site_url: siteUrl,
    from_address: `${siteName} <${fromEmail}>`,
  };

  // Determine overall status
  let status: 'ok' | 'misconfigured' | 'not_configured' = 'ok';
  const issues: string[] = [];

  if (!config.resend_api_key_set) {
    status = 'not_configured';
    issues.push('RESEND_API_KEY is not set');
  } else if (config.resend_api_key_format === 'invalid_format') {
    status = 'misconfigured';
    issues.push('RESEND_API_KEY should start with "re_" (Resend API key format)');
  }

  // Extract domain from FROM_EMAIL
  const fromDomain = fromEmail.split('@')[1];
  if (!fromDomain) {
    status = 'misconfigured';
    issues.push('FROM_EMAIL has invalid format');
  }

  return NextResponse.json({
    status,
    issues: issues.length > 0 ? issues : undefined,
    config: {
      ...config,
      // Mask API key for security
      resend_api_key_preview: resendApiKey
        ? `${resendApiKey.substring(0, 6)}...${resendApiKey.substring(resendApiKey.length - 4)}`
        : null,
    },
    recommendations: status !== 'ok' ? [
      'Ensure RESEND_API_KEY is set in GitHub Secrets',
      'Verify your domain in Resend dashboard (https://resend.com/domains)',
      'Check that DNS records (DKIM, SPF) are properly configured',
      `Make sure FROM_EMAIL domain (${fromDomain}) is verified in Resend`,
    ] : undefined,
  });
}

/**
 * POST /api/v1/admin/email/test
 * Send a test email to verify the configuration works end-to-end
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const authResult = await requireAuth(request, ['admin:write']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validated = TestEmailSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request',
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { to, include_diagnostics } = validated.data;

    // Gather diagnostic info
    const diagnostics = include_diagnostics ? {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      resend_api_key_set: !!process.env.RESEND_API_KEY,
      from_email: process.env.FROM_EMAIL || 'noreply@scamnemesis.com',
      site_name: process.env.SITE_NAME || 'ScamNemesis',
      site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com',
    } : null;

    console.log('[EmailTest] Sending test email', {
      to,
      from: process.env.FROM_EMAIL || 'noreply@scamnemesis.com',
      apiKeySet: !!process.env.RESEND_API_KEY,
    });

    // Send test email
    const result = await sendEmail({
      to,
      subject: `[TEST] ScamNemesis Email Configuration Test`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background: #dcfce7; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .diagnostics { background: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ScamNemesis Email Test</h1>
          </div>

          <div class="success">
            <h2>Email Configuration Working!</h2>
            <p>This is a test email from ScamNemesis. If you receive this, your email configuration is working correctly.</p>
          </div>

          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p><strong>To:</strong> ${to}</p>

          ${diagnostics ? `
            <h3>Diagnostics:</h3>
            <div class="diagnostics">
              <pre>${JSON.stringify(diagnostics, null, 2)}</pre>
            </div>
          ` : ''}

          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email. No action is required.
          </p>
        </body>
        </html>
      `,
      text: `
ScamNemesis Email Test

Email Configuration Working!

This is a test email from ScamNemesis. If you receive this, your email configuration is working correctly.

Sent at: ${new Date().toISOString()}
To: ${to}

${diagnostics ? `Diagnostics:\n${JSON.stringify(diagnostics, null, 2)}` : ''}

This is an automated test email. No action is required.
      `.trim(),
    });

    console.log('[EmailTest] Result:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        message_id: result.messageId,
        sent_to: to,
        diagnostics,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'email_send_failed',
          message: result.error || 'Failed to send test email',
          details: {
            sent_to: to,
            diagnostics,
          },
          troubleshooting: [
            'Check that RESEND_API_KEY is set correctly',
            'Verify your domain is properly configured in Resend',
            'Check DNS records (DKIM, SPF) are set up correctly',
            'Review Resend dashboard for any error logs',
          ],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[EmailTest] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
