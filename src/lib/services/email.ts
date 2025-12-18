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
   * Report confirmation email (sent to reporter after submission)
   */
  reportConfirmation: (options: {
    reporterName: string;
    reporterEmail: string;
    caseNumber: string;
    trackingToken: string;
    fraudType: string;
    summary: string;
    financialLoss?: { amount: number; currency: string };
    reportDate: Date;
    locale?: string;
  }) => {
    const safeReporterName = escapeHtml(options.reporterName || 'Reporter');
    const safeCaseNumber = escapeHtml(options.caseNumber);
    const safeFraudType = escapeHtml(options.fraudType.replace(/_/g, ' ').toLowerCase());
    // Note: Summary currently not used in template but prepared for future use
    const _safeSummary = escapeHtml(options.summary.substring(0, 100) + (options.summary.length > 100 ? '...' : ''));
    const trackingUrl = `${SITE_URL}/${options.locale || 'en'}/case-update/${encodeURIComponent(options.trackingToken)}`;
    const formattedDate = options.reportDate.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedLoss = options.financialLoss
      ? `${options.financialLoss.amount.toLocaleString('sk-SK')} ${options.financialLoss.currency}`
      : 'Neuvedené';

    return {
      subject: `Potvrdenie hlásenia - ${safeCaseNumber} | ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html lang="sk">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Potvrdenie hlásenia</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; line-height: 1.6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🛡️ ${SITE_NAME}
                      </h1>
                      <p style="margin: 10px 0 0; color: #bfdbfe; font-size: 14px;">
                        Spoločne proti podvodom
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                        Vážený/á <strong>${safeReporterName}</strong>,
                      </p>
                      <p style="margin: 0 0 30px; color: #374151; font-size: 16px;">
                        Ďakujeme za odoslanie hlásenia o podvode do ${SITE_NAME}. Vaše hlásenie sme úspešne prijali a bolo mu pridelené jedinečné číslo prípadu pre sledovanie a vyšetrovanie.
                      </p>

                      <!-- Case ID Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; text-align: center;">
                            <p style="margin: 0 0 5px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                              Číslo prípadu
                            </p>
                            <p style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 700; font-family: monospace;">
                              ${safeCaseNumber}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Report Summary -->
                      <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                        📋 Zhrnutie hlásenia
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px;">Dátum hlásenia:</span>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                            <strong style="color: #374151; font-size: 14px;">${formattedDate}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px;">Typ podvodu:</span>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                            <strong style="color: #374151; font-size: 14px; text-transform: capitalize;">${safeFraudType}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                            <span style="color: #6b7280; font-size: 14px;">Nahlásená strata:</span>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                            <strong style="color: #374151; font-size: 14px;">${formattedLoss}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <span style="color: #6b7280; font-size: 14px;">Stav:</span>
                          </td>
                          <td style="padding: 10px 0; text-align: right;">
                            <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                              Prijaté - Čaká na kontrolu
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- Track Button -->
                      <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px;">
                        🔍 Sledovať a aktualizovať prípad
                      </h3>
                      <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
                        Stav vášho hlásenia môžete kedykoľvek skontrolovať a pridať ďalšie informácie pomocou odkazu nižšie:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px;">
                            <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                              Zobraziť stav prípadu
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Save Link Warning -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 15px 20px;">
                            <p style="margin: 0 0 5px; color: #92400e; font-size: 14px; font-weight: 600;">
                              ⚠️ Dôležité: Uložte si tento email
                            </p>
                            <p style="margin: 0; color: #92400e; font-size: 13px;">
                              Odkaz na sledovanie prípadu je váš jedinečný prístupový kľúč. Z bezpečnostných dôvodov nie je prístupný nikomu inému.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- What's Next -->
                      <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px;">
                        📌 Čo sa stane ďalej?
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 10px 0; vertical-align: top; width: 30px;">
                            <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</span>
                          </td>
                          <td style="padding: 10px 0 10px 10px;">
                            <strong style="color: #374151; font-size: 14px;">Proces kontroly:</strong>
                            <span style="color: #6b7280; font-size: 14px;"> Náš tím skontroluje vaše hlásenie do 24-48 hodín</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; vertical-align: top;">
                            <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</span>
                          </td>
                          <td style="padding: 10px 0 10px 10px;">
                            <strong style="color: #374151; font-size: 14px;">Vyšetrovanie:</strong>
                            <span style="color: #6b7280; font-size: 14px;"> Platné hlásenia budú vyšetrené a pridané do verejnej databázy</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; vertical-align: top;">
                            <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</span>
                          </td>
                          <td style="padding: 10px 0 10px 10px;">
                            <strong style="color: #374151; font-size: 14px;">Aktualizácie:</strong>
                            <span style="color: #6b7280; font-size: 14px;"> Stav prípadu môžete kedykoľvek skontrolovať pomocou odkazu vyššie</span>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 20px; color: #374151; font-size: 14px; background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                        💚 Vaše hlásenie pomáha chrániť ostatných pred podobnými podvodmi. Zdieľaním svojej skúsenosti prispievate k bezpečnejšej online komunite pre všetkých.
                      </p>

                      <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        Ak máte ďalšie dôkazy alebo informácie, použite odkaz na sledovanie prípadu vyššie. Pre všeobecné otázky nás kontaktujte na <a href="mailto:support@scamnemesis.com" style="color: #2563eb;">support@scamnemesis.com</a>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #ffffff; font-size: 18px; font-weight: 600;">
                        🛡️ ${SITE_NAME}
                      </p>
                      <p style="margin: 0 0 20px; color: #9ca3af; font-size: 12px;">
                        Bojujeme proti podvodom, chránime komunity
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 11px;">
                        Toto je automatická správa. Prosím neodpovedajte priamo na tento email.<br>
                        Pre podporu nás kontaktujte na <a href="mailto:support@scamnemesis.com" style="color: #60a5fa;">support@scamnemesis.com</a>
                      </p>
                      <p style="margin: 20px 0 0; color: #6b7280; font-size: 11px;">
                        © ${new Date().getFullYear()} ${SITE_NAME}. Všetky práva vyhradené.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
${SITE_NAME} - Potvrdenie hlásenia
================================

Vážený/á ${options.reporterName || 'Reporter'},

Ďakujeme za odoslanie hlásenia o podvode do ${SITE_NAME}. Vaše hlásenie sme úspešne prijali.

ČÍSLO PRÍPADU: ${options.caseNumber}

ZHRNUTIE HLÁSENIA:
- Dátum hlásenia: ${formattedDate}
- Typ podvodu: ${safeFraudType}
- Nahlásená strata: ${formattedLoss}
- Stav: Prijaté - Čaká na kontrolu

SLEDOVAŤ PRÍPAD:
${trackingUrl}

⚠️ DÔLEŽITÉ: Uložte si tento email. Odkaz na sledovanie je váš jedinečný prístupový kľúč.

ČO SA STANE ĎALEJ:
1. Náš tím skontroluje vaše hlásenie do 24-48 hodín
2. Platné hlásenia budú vyšetrené a pridané do verejnej databázy
3. Stav prípadu môžete kedykoľvek skontrolovať pomocou odkazu vyššie

Vaše hlásenie pomáha chrániť ostatných pred podobnými podvodmi.

Pre podporu: support@scamnemesis.com

© ${new Date().getFullYear()} ${SITE_NAME}
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

  async sendReportConfirmation(options: {
    reporterName: string;
    reporterEmail: string;
    caseNumber: string;
    trackingToken: string;
    fraudType: string;
    summary: string;
    financialLoss?: { amount: number; currency: string };
    reportDate: Date;
    locale?: string;
  }): Promise<SendResult> {
    const template = emailTemplates.reportConfirmation(options);
    return sendEmail({ to: options.reporterEmail, ...template });
  },
};

export default emailService;
