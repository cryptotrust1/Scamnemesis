/**
 * Email Service for ScamNemesis
 * Handles all email notifications and transactional emails
 */

import { Resend } from 'resend';

/**
 * Escape HTML special characters to prevent XSS attacks
 * IMPORTANT: Always use this for any user-supplied values in HTML templates
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return text.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char]);
}

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@scamnemesis.com';
const SITE_NAME = process.env.SITE_NAME || 'ScamNemesis';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamnemesis.com';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  if (!resend) {
    console.warn('Email service not configured. Set RESEND_API_KEY to enable.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email templates
 */
export const emailTemplates = {
  /**
   * Welcome email after registration
   */
  welcome: (userName: string, verificationUrl?: string) => {
    const safeUserName = escapeHtml(userName);
    const safeVerificationUrl = verificationUrl ? encodeURI(verificationUrl) : undefined;
    return {
      subject: `Vitajte v ${SITE_NAME}!`,
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
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ ${SITE_NAME}</h1>
            </div>
            <div class="content">
              <h2>Vitajte, ${safeUserName}!</h2>
              <p>Ďakujeme za registráciu v ${SITE_NAME}. Teraz môžete:</p>
              <ul>
                <li>Vyhľadávať v databáze nahlásených podvodníkov</li>
                <li>Nahlasovať podozrivé aktivity</li>
                <li>Pomáhať chrániť komunitu</li>
              </ul>
              ${safeVerificationUrl ? `
                <p>Pre aktiváciu účtu kliknite na tlačidlo nižšie:</p>
                <p><a href="${safeVerificationUrl}" class="button">Overiť email</a></p>
              ` : ''}
              <p>S pozdravom,<br>Tím ${SITE_NAME}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${SITE_NAME}. Všetky práva vyhradené.</p>
              <p><a href="${SITE_URL}">scamnemesis.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Vitajte v ${SITE_NAME}, ${userName}!

Ďakujeme za registráciu. Teraz môžete vyhľadávať v databáze nahlásených podvodníkov a nahlasovať podozrivé aktivity.

${verificationUrl ? `Pre aktiváciu účtu navštívte: ${verificationUrl}` : ''}

S pozdravom,
Tím ${SITE_NAME}
      `.trim(),
    };
  },

  /**
   * Email verification
   */
  verifyEmail: (userName: string, verificationUrl: string) => {
    const safeUserName = escapeHtml(userName);
    const safeVerificationUrl = encodeURI(verificationUrl);
    return {
      subject: `Overte svoj email - ${SITE_NAME}`,
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
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ ${SITE_NAME}</h1>
            </div>
            <div class="content">
              <h2>Overte svoj email</h2>
              <p>Dobrý deň ${safeUserName},</p>
              <p>Pre dokončenie registrácie a overenie vášho emailu kliknite na tlačidlo nižšie:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${safeVerificationUrl}" class="button">Overiť email</a>
              </p>
              <p>Alebo skopírujte tento odkaz do prehliadača:</p>
              <p style="word-break: break-all; color: #666;">${escapeHtml(verificationUrl)}</p>
              <p><strong>Odkaz je platný 24 hodín.</strong></p>
              <p>Ak ste sa neregistrovali na ${SITE_NAME}, tento email môžete ignorovať.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${SITE_NAME}. Všetky práva vyhradené.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Overte svoj email

Dobrý deň ${userName},

Pre dokončenie registrácie a overenie vášho emailu navštívte:
${verificationUrl}

Odkaz je platný 24 hodín.

Ak ste sa neregistrovali na ${SITE_NAME}, tento email môžete ignorovať.

${SITE_NAME}
      `.trim(),
    };
  },

  /**
   * Password reset email
   */
  passwordReset: (userName: string, resetUrl: string) => {
    const safeUserName = escapeHtml(userName);
    const safeResetUrl = encodeURI(resetUrl);
    return {
      subject: `Obnovenie hesla - ${SITE_NAME}`,
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
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ ${SITE_NAME}</h1>
            </div>
            <div class="content">
              <h2>Obnovenie hesla</h2>
              <p>Dobrý deň ${safeUserName},</p>
              <p>Prijali sme požiadavku na obnovenie hesla pre váš účet.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${safeResetUrl}" class="button">Obnoviť heslo</a>
              </p>
              <div class="warning">
                <strong>⚠️ Bezpečnostné upozornenie:</strong>
                <p>Odkaz je platný iba 1 hodinu. Ak ste o obnovenie hesla nežiadali, odporúčame skontrolovať bezpečnosť vášho účtu.</p>
              </div>
              <p>Ak ste o obnovenie hesla nežiadali, tento email môžete ignorovať.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${SITE_NAME}. Všetky práva vyhradené.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Obnovenie hesla

Dobrý deň ${userName},

Prijali sme požiadavku na obnovenie hesla pre váš účet.

Pre obnovenie hesla navštívte:
${resetUrl}

Odkaz je platný iba 1 hodinu.

Ak ste o obnovenie hesla nežiadali, tento email môžete ignorovať.

${SITE_NAME}
      `.trim(),
    };
  },

  /**
   * New report notification (for admin)
   */
  newReportNotification: (reportId: string, reportTitle: string, fraudType: string) => {
    const safeReportId = escapeHtml(reportId);
    const safeReportTitle = escapeHtml(reportTitle);
    const safeFraudType = escapeHtml(fraudType);
    const safeAdminUrl = `${SITE_URL}/admin/reports/${encodeURIComponent(reportId)}`;
    return {
      subject: `Nové hlásenie: ${reportTitle.substring(0, 50)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .report-box { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Nové hlásenie</h1>
            </div>
            <div class="content">
              <p>Bolo prijaté nové hlásenie podvodu na schválenie:</p>
              <div class="report-box">
                <h3>${safeReportTitle}</h3>
                <p><strong>Typ podvodu:</strong> ${safeFraudType}</p>
                <p><strong>ID:</strong> ${safeReportId}</p>
              </div>
              <p style="text-align: center;">
                <a href="${safeAdminUrl}" class="button">Zobraziť hlásenie</a>
              </p>
            </div>
            <div class="footer">
              <p>Táto správa bola automaticky vygenerovaná systémom ${SITE_NAME}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nové hlásenie podvodu

Bolo prijaté nové hlásenie na schválenie:

Názov: ${reportTitle}
Typ: ${fraudType}
ID: ${reportId}

Zobraziť: ${SITE_URL}/admin/reports/${reportId}

${SITE_NAME}
      `.trim(),
    };
  },

  /**
   * Report status update (for reporter)
   */
  reportStatusUpdate: (userName: string, reportTitle: string, status: 'approved' | 'rejected', reason?: string) => {
    const safeUserName = escapeHtml(userName);
    const safeReportTitle = escapeHtml(reportTitle);
    const safeReason = reason ? escapeHtml(reason) : undefined;
    return {
      subject: `Stav hlásenia aktualizovaný - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${status === 'approved' ? '#16a34a' : '#dc2626'}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .status-box { background: ${status === 'approved' ? '#dcfce7' : '#fee2e2'}; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${status === 'approved' ? '✅ Hlásenie schválené' : '❌ Hlásenie zamietnuté'}</h1>
            </div>
            <div class="content">
              <p>Dobrý deň ${safeUserName},</p>
              <div class="status-box">
                <p><strong>Vaše hlásenie:</strong> ${safeReportTitle}</p>
                <p><strong>Stav:</strong> ${status === 'approved' ? 'Schválené a zverejnené' : 'Zamietnuté'}</p>
                ${safeReason ? `<p><strong>Dôvod:</strong> ${safeReason}</p>` : ''}
              </div>
              ${status === 'approved'
                ? '<p>Ďakujeme za vaše hlásenie. Pomáhate chrániť komunitu pred podvodníkmi.</p>'
                : '<p>Ak máte otázky ohľadom zamietnutia, kontaktujte nás prosím.</p>'
              }
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${SITE_NAME}. Všetky práva vyhradené.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Stav hlásenia aktualizovaný

Dobrý deň ${userName},

Vaše hlásenie "${reportTitle}" bolo ${status === 'approved' ? 'schválené a zverejnené' : 'zamietnuté'}.
${reason ? `Dôvod: ${reason}` : ''}

${status === 'approved'
  ? 'Ďakujeme za vaše hlásenie. Pomáhate chrániť komunitu pred podvodníkmi.'
  : 'Ak máte otázky ohľadom zamietnutia, kontaktujte nás prosím.'
}

${SITE_NAME}
      `.trim(),
    };
  },
};

/**
 * Helper functions to send specific email types
 */
export const emailService = {
  async sendWelcome(email: string, userName: string, verificationUrl?: string): Promise<SendResult> {
    const template = emailTemplates.welcome(userName, verificationUrl);
    return sendEmail({ to: email, ...template });
  },

  async sendVerification(email: string, userName: string, verificationUrl: string): Promise<SendResult> {
    const template = emailTemplates.verifyEmail(userName, verificationUrl);
    return sendEmail({ to: email, ...template });
  },

  async sendPasswordReset(email: string, userName: string, resetUrl: string): Promise<SendResult> {
    const template = emailTemplates.passwordReset(userName, resetUrl);
    return sendEmail({ to: email, ...template });
  },

  async sendNewReportNotification(adminEmail: string, reportId: string, reportTitle: string, fraudType: string): Promise<SendResult> {
    const template = emailTemplates.newReportNotification(reportId, reportTitle, fraudType);
    return sendEmail({ to: adminEmail, ...template });
  },

  async sendReportStatusUpdate(email: string, userName: string, reportTitle: string, status: 'approved' | 'rejected', reason?: string): Promise<SendResult> {
    const template = emailTemplates.reportStatusUpdate(userName, reportTitle, status, reason);
    return sendEmail({ to: email, ...template });
  },
};

export default emailService;
