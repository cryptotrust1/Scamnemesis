/**
 * Contact Form API
 * POST /api/v1/contact - Submit contact form
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { sendEmail } from '@/lib/services/email';
import { requireRateLimit } from '@/lib/middleware/auth';
import { createRequestLogger, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@scamnemesis.com';
const SITE_NAME = process.env.SITE_NAME || 'ScamNemesis';

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

const ContactSchema = z.object({
  name: z.string().min(2, 'Meno musí mať aspoň 2 znaky').max(100),
  email: z.string().email('Neplatná emailová adresa'),
  reason: z.enum(['general', 'report_issue', 'data_request', 'business', 'other']),
  subject: z.string().min(3, 'Predmet musí mať aspoň 3 znaky').max(200),
  message: z.string().min(10, 'Správa musí mať aspoň 10 znakov').max(5000),
});

const reasonLabels: Record<string, string> = {
  general: 'Všeobecná otázka',
  report_issue: 'Problém s hlásením',
  data_request: 'Žiadosť o osobné údaje (GDPR)',
  business: 'Obchodná spolupráca',
  other: 'Iné',
};

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const log = createRequestLogger(requestId, 'ContactAPI');

  try {
    // Rate limiting - 5 contact submissions per minute
    const rateLimitError = await requireRateLimit(request, 5);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const validation = ContactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validation.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, reason, subject, message } = validation.data;

    // Send email to admin
    const adminEmailResult = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[${SITE_NAME}] Kontakt: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .info-box { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .message-box { background: white; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 Nová správa z kontaktného formulára</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <p><strong>Od:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
                <p><strong>Dôvod:</strong> ${escapeHtml(reasonLabels[reason])}</p>
                <p><strong>Predmet:</strong> ${escapeHtml(subject)}</p>
              </div>
              <h3>Správa:</h3>
              <div class="message-box">
                <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color: #666; font-size: 14px;">
                Pre odpoveď použite: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
              </p>
            </div>
            <div class="footer">
              <p>Táto správa bola odoslaná z kontaktného formulára ${SITE_NAME}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nová správa z kontaktného formulára

Od: ${name} <${email}>
Dôvod: ${reasonLabels[reason]}
Predmet: ${subject}

Správa:
${message}

---
Pre odpoveď použite: ${email}
      `.trim(),
    });

    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: email,
      subject: `Potvrdenie prijatia správy - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .message-box { background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Správa prijatá</h1>
            </div>
            <div class="content">
              <p>Dobrý deň ${escapeHtml(name)},</p>
              <p>Ďakujeme za vašu správu. Prijali sme ju a budeme sa vám snažiť odpovedať čo najskôr.</p>
              <div class="message-box">
                <p><strong>Predmet:</strong> ${escapeHtml(subject)}</p>
                <p><strong>Dôvod:</strong> ${escapeHtml(reasonLabels[reason])}</p>
              </div>
              <p>Na väčšinu správ odpovedáme do 2-3 pracovných dní.</p>
              <p>S pozdravom,<br>Tím ${SITE_NAME}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${SITE_NAME}. Všetky práva vyhradené.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dobrý deň ${name},

Ďakujeme za vašu správu. Prijali sme ju a budeme sa vám snažiť odpovedať čo najskôr.

Predmet: ${subject}
Dôvod: ${reasonLabels[reason]}

Na väčšinu správ odpovedáme do 2-3 pracovných dní.

S pozdravom,
Tím ${SITE_NAME}
      `.trim(),
    });

    // Log results
    if (!adminEmailResult.success) {
      log.warn('Failed to send admin email', { error: adminEmailResult.error });
    }
    if (!userEmailResult.success) {
      log.warn('Failed to send confirmation email', { error: userEmailResult.error });
    }

    // Return success even if email fails (we still received the message)
    log.info('Contact form submitted successfully');
    return NextResponse.json({
      success: true,
      message: 'Správa bola úspešne odoslaná',
    });
  } catch (error) {
    log.error('Contact form error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    Sentry.captureException(error, {
      tags: { api: 'contact', method: 'POST' },
      extra: { requestId },
    });

    return NextResponse.json(
      { error: 'internal_error', message: 'Nastala chyba pri odosielaní správy', request_id: requestId },
      { status: 500 }
    );
  }
}
