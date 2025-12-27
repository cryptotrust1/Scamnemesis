/**
 * Email Service for ScamNemesis
 * Handles all email notifications and transactional emails
 */

import { Resend } from 'resend';

/**
 * Escape HTML special characters to prevent XSS attacks
 * IMPORTANT: Always use this for any user-supplied values in HTML templates
 */
function escapeHtml(text: string | null | undefined): string {
  // Handle null/undefined to prevent crashes
  if (text == null) {
    return '';
  }
  // Convert to string if not already
  const str = String(text);
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
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char]);
}

// Initialize Resend client with error handling to prevent module load failures
const RESEND_API_KEY = process.env.RESEND_API_KEY;
let resend: Resend | null = null;
let resendInitError: string | null = null;

try {
  if (RESEND_API_KEY && RESEND_API_KEY.trim() !== '') {
    resend = new Resend(RESEND_API_KEY);
  }
} catch (error) {
  resendInitError = error instanceof Error ? error.message : String(error);
  console.error('[Email] CRITICAL: Failed to initialize Resend client:', error);
  // resend remains null, emails will be disabled but app won't crash
}

// Validate API key format
const isValidApiKeyFormat = RESEND_API_KEY?.startsWith('re_') ?? false;

// Log email service status at startup
if (!resend) {
  console.error('');
  console.error('⚠️  EMAIL SERVICE NOT CONFIGURED ⚠️');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('RESEND_API_KEY is not set in environment variables.');
  console.error('Confirmation emails will NOT be sent to users after report submission.');
  console.error('');
  console.error('To fix this:');
  console.error('1. Sign up for Resend at https://resend.com');
  console.error('2. Get your API key from https://resend.com/api-keys');
  console.error('3. Add RESEND_API_KEY=your_key_here to your .env file');
  console.error('4. Verify your domain at https://resend.com/domains');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');
} else if (RESEND_API_KEY) {
  const fromEmail = process.env.FROM_EMAIL || 'noreply@scamnemesis.com';
  const fromDomain = fromEmail.split('@')[1];
  const keyPreview = `${RESEND_API_KEY.substring(0, 6)}...${RESEND_API_KEY.substring(RESEND_API_KEY.length - 4)}`;
  console.log('[Email] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[Email] Resend client initialized successfully');
  console.log(`[Email] API Key: ${keyPreview}`);
  console.log(`[Email] API Key Format: ${isValidApiKeyFormat ? 'OK (starts with re_)' : 'WARNING: Should start with re_'}`);
  console.log(`[Email] FROM_EMAIL: ${fromEmail}`);
  console.log(`[Email] FROM_DOMAIN: ${fromDomain}`);
  console.log(`[Email] SITE_NAME: ${process.env.SITE_NAME || 'ScamNemesis'}`);
  console.log('[Email] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (!isValidApiKeyFormat) {
    console.warn('[Email] WARNING: API key format looks incorrect. Resend API keys should start with "re_"');
  }
}

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
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const timestamp = new Date().toISOString();

  if (!resend) {
    if (resendInitError) {
      console.error(`[Email] [${timestamp}] Service initialization failed: ${resendInitError}`);
    } else {
      console.warn(`[Email] [${timestamp}] Service not configured. Set RESEND_API_KEY to enable.`);
    }
    console.warn(`[Email] Would have sent to: ${recipients.join(', ')}`);
    console.warn(`[Email] Subject: ${options.subject}`);
    return { success: false, error: resendInitError || 'Email service not configured. RESEND_API_KEY is missing or empty.' };
  }

  // Validate API key format
  if (!isValidApiKeyFormat) {
    console.warn(`[Email] [${timestamp}] API key format warning: Key should start with "re_"`);
  }

  const fromAddress = `${SITE_NAME} <${FROM_EMAIL}>`;

  console.log(`[Email] [${timestamp}] ━━━━━━━━━━ Sending Email ━━━━━━━━━━`);
  console.log(`[Email] From: ${fromAddress}`);
  console.log(`[Email] To: ${recipients.join(', ')}`);
  console.log(`[Email] Subject: ${options.subject}`);

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      console.error(`[Email] [${timestamp}] Resend API Error:`, JSON.stringify(result.error, null, 2));
      console.error(`[Email] Error Name: ${result.error.name}`);
      console.error(`[Email] Error Message: ${result.error.message}`);

      // Provide more specific error messages
      let errorMessage = result.error.message || 'Resend API error';
      if (result.error.message?.includes('domain')) {
        errorMessage = `Domain verification issue: ${result.error.message}. Please verify your domain at https://resend.com/domains`;
      } else if (result.error.message?.includes('API key')) {
        errorMessage = `API key issue: ${result.error.message}. Check your RESEND_API_KEY`;
      } else if (result.error.message?.includes('rate')) {
        errorMessage = `Rate limit exceeded: ${result.error.message}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log(`[Email] [${timestamp}] ✓ Successfully sent!`);
    console.log(`[Email] Message ID: ${result.data?.id}`);
    console.log(`[Email] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error(`[Email] [${timestamp}] ━━━━━━ SEND FAILED ━━━━━━`);
    console.error(`[Email] To: ${recipients.join(', ')}`);
    console.error(`[Email] Subject: ${options.subject}`);

    if (error instanceof Error) {
      console.error(`[Email] Error Type: ${error.name}`);
      console.error(`[Email] Error Message: ${error.message}`);
      console.error(`[Email] Stack Trace:`, error.stack);

      // Check for common error patterns
      let friendlyError = error.message;
      if (error.message.includes('fetch')) {
        friendlyError = 'Network error connecting to Resend API. Check internet connectivity.';
      } else if (error.message.includes('timeout')) {
        friendlyError = 'Timeout connecting to Resend API. The service might be temporarily unavailable.';
      } else if (error.message.includes('ENOTFOUND')) {
        friendlyError = 'DNS resolution failed for Resend API. Check network configuration.';
      }

      return {
        success: false,
        error: friendlyError,
      };
    }

    console.error(`[Email] Unknown Error:`, error);
    return {
      success: false,
      error: 'Failed to send email: Unknown error',
    };
  }
}

/**
 * Professional email base styles with high contrast
 */
const emailStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f8fafc;
    line-height: 1.6;
    color: #1e293b;
  }
  .wrapper {
    width: 100%;
    background-color: #f8fafc;
    padding: 40px 20px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    padding: 40px 30px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
  }
  .header p {
    margin: 10px 0 0;
    color: #bfdbfe;
    font-size: 14px;
  }
  .content {
    padding: 40px 30px;
    background-color: #ffffff;
  }
  .content h2 {
    margin: 0 0 20px;
    color: #0f172a;
    font-size: 24px;
    font-weight: 600;
  }
  .content p {
    margin: 0 0 16px;
    color: #334155;
    font-size: 16px;
  }
  .content ul {
    margin: 0 0 20px;
    padding-left: 20px;
    color: #334155;
  }
  .content li {
    margin-bottom: 8px;
  }
  .button {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
    transition: all 0.2s;
  }
  .button:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  }
  .button-container {
    text-align: center;
    margin: 30px 0;
  }
  .warning {
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 16px 20px;
    border-radius: 8px;
    margin: 24px 0;
  }
  .warning strong {
    color: #92400e;
    display: block;
    margin-bottom: 8px;
  }
  .warning p {
    margin: 0;
    color: #92400e;
    font-size: 14px;
  }
  .info-box {
    background-color: #f0f9ff;
    border-left: 4px solid #0ea5e9;
    padding: 16px 20px;
    border-radius: 8px;
    margin: 24px 0;
  }
  .info-box p {
    margin: 0;
    color: #0c4a6e;
    font-size: 14px;
  }
  .link-text {
    word-break: break-all;
    color: #64748b;
    font-size: 14px;
    background-color: #f1f5f9;
    padding: 12px;
    border-radius: 6px;
    margin: 16px 0;
  }
  .footer {
    background-color: #1e293b;
    padding: 30px;
    text-align: center;
  }
  .footer p {
    margin: 0 0 8px;
    color: #94a3b8;
    font-size: 12px;
  }
  .footer a {
    color: #60a5fa;
    text-decoration: none;
  }
  .footer .brand {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
  }
`;

/**
 * Email templates
 */
export const emailTemplates = {
  /**
   * Welcome email after registration
   */
  welcome: (userName: string, verificationUrl?: string) => {
    const safeUserName = escapeHtml(userName);
    const safeVerificationUrl = verificationUrl ? encodeURIComponent(verificationUrl) : undefined;
    return {
      subject: `Welcome to ${SITE_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${SITE_NAME}</title>
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>🛡️ ${SITE_NAME}</h1>
                <p>Fighting Fraud, Protecting Communities</p>
              </div>
              <div class="content">
                <h2>Welcome, ${safeUserName}!</h2>
                <p>Thank you for joining ${SITE_NAME}. You're now part of our community dedicated to fighting fraud and protecting others.</p>
                <p>With your account, you can:</p>
                <ul>
                  <li>Search our database of reported scammers</li>
                  <li>Report suspicious activities and fraud attempts</li>
                  <li>Help protect others from becoming victims</li>
                  <li>Stay informed about the latest scam tactics</li>
                </ul>
                ${safeVerificationUrl ? `
                  <div class="info-box">
                    <p><strong>One more step:</strong> Please verify your email address to activate all features.</p>
                  </div>
                  <div class="button-container">
                    <a href="${decodeURIComponent(safeVerificationUrl)}" class="button">Verify Email Address</a>
                  </div>
                ` : ''}
                <p>Best regards,<br><strong>The ${SITE_NAME} Team</strong></p>
              </div>
              <div class="footer">
                <p class="brand">🛡️ ${SITE_NAME}</p>
                <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
                <p><a href="${SITE_URL}">${SITE_URL.replace('https://', '')}</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to ${SITE_NAME}, ${userName}!

Thank you for joining us. You're now part of our community dedicated to fighting fraud and protecting others.

With your account, you can:
- Search our database of reported scammers
- Report suspicious activities and fraud attempts
- Help protect others from becoming victims
- Stay informed about the latest scam tactics

${verificationUrl ? `Please verify your email address: ${verificationUrl}` : ''}

Best regards,
The ${SITE_NAME} Team
      `.trim(),
    };
  },

  /**
   * Email verification
   */
  verifyEmail: (userName: string, verificationUrl: string) => {
    const safeUserName = escapeHtml(userName);
    const safeVerificationUrl = encodeURIComponent(verificationUrl);
    return {
      subject: `Verify Your Email - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>🛡️ ${SITE_NAME}</h1>
                <p>Email Verification Required</p>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hello ${safeUserName},</p>
                <p>To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
                <div class="button-container">
                  <a href="${decodeURIComponent(safeVerificationUrl)}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <div class="link-text">${escapeHtml(verificationUrl)}</div>
                <div class="warning">
                  <strong>⏰ This link expires in 24 hours</strong>
                  <p>For security reasons, this verification link will expire in 24 hours. If it expires, you can request a new one from the login page.</p>
                </div>
                <p>If you didn't create an account on ${SITE_NAME}, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p class="brand">🛡️ ${SITE_NAME}</p>
                <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Verify Your Email Address

Hello ${userName},

To complete your registration and secure your account, please verify your email address by visiting:

${verificationUrl}

This link expires in 24 hours.

If you didn't create an account on ${SITE_NAME}, you can safely ignore this email.

${SITE_NAME}
      `.trim(),
    };
  },

  /**
   * Password reset email
   */
  passwordReset: (userName: string, resetUrl: string) => {
    const safeUserName = escapeHtml(userName);
    const safeResetUrl = encodeURIComponent(resetUrl);
    return {
      subject: `Reset Your Password - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>🛡️ ${SITE_NAME}</h1>
                <p>Password Reset Request</p>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello ${safeUserName},</p>
                <p>We received a request to reset the password for your account. Click the button below to create a new password:</p>
                <div class="button-container">
                  <a href="${decodeURIComponent(safeResetUrl)}" class="button">Reset Password</a>
                </div>
                <div class="warning">
                  <strong>⚠️ Security Notice</strong>
                  <p>This link is valid for 1 hour only. If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="link-text">${escapeHtml(resetUrl)}</div>
              </div>
              <div class="footer">
                <p class="brand">🛡️ ${SITE_NAME}</p>
                <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Reset Your Password

Hello ${userName},

We received a request to reset the password for your account.

To reset your password, visit:
${resetUrl}

This link is valid for 1 hour only.

If you didn't request a password reset, please ignore this email.

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
      subject: `New Report: ${reportTitle.substring(0, 50)}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Report Submitted</title>
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);">
                <h1>⚠️ New Report</h1>
                <p>Requires Review</p>
              </div>
              <div class="content">
                <h2>New Fraud Report Submitted</h2>
                <p>A new fraud report has been submitted and is awaiting your review:</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 24px 0;">
                  <h3 style="margin: 0 0 16px; color: #0f172a;">${safeReportTitle}</h3>
                  <p style="margin: 8px 0;"><strong>Fraud Type:</strong> ${safeFraudType}</p>
                  <p style="margin: 8px 0;"><strong>Report ID:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${safeReportId}</code></p>
                </div>
                <div class="button-container">
                  <a href="${safeAdminUrl}" class="button">Review Report</a>
                </div>
              </div>
              <div class="footer">
                <p class="brand">🛡️ ${SITE_NAME}</p>
                <p>This is an automated message from ${SITE_NAME} admin system.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Fraud Report Submitted

A new fraud report has been submitted and is awaiting your review:

Title: ${reportTitle}
Fraud Type: ${fraudType}
Report ID: ${reportId}

Review at: ${SITE_URL}/admin/reports/${reportId}

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
    const trackingUrl = `${SITE_URL}/${options.locale || 'en'}/case-update/${encodeURIComponent(options.trackingToken)}`;
    const formattedDate = options.reportDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedLoss = options.financialLoss
      ? `${options.financialLoss.amount.toLocaleString('en-US')} ${options.financialLoss.currency}`
      : 'Not specified';

    return {
      subject: `Report Confirmation - ${safeCaseNumber} | ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Report Confirmation</title>
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>🛡️ ${SITE_NAME}</h1>
                <p>Fighting Fraud, Protecting Communities</p>
              </div>
              <div class="content">
                <h2>Report Received</h2>
                <p>Dear <strong>${safeReporterName}</strong>,</p>
                <p>Thank you for submitting your fraud report to ${SITE_NAME}. We have successfully received your report and assigned it a unique case number for tracking and investigation.</p>

                <!-- Case ID Box -->
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Case Number</p>
                  <p style="margin: 0; color: #1e40af; font-size: 28px; font-weight: 700; font-family: monospace;">${safeCaseNumber}</p>
                </div>

                <!-- Report Summary -->
                <h3 style="margin: 24px 0 16px; color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">📋 Report Summary</h3>
                <table width="100%" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Report Date:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #334155; font-weight: 600;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Fraud Type:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #334155; font-weight: 600; text-transform: capitalize;">${safeFraudType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Reported Loss:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #334155; font-weight: 600;">${formattedLoss}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #64748b;">Status:</td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">Received - Pending Review</span>
                    </td>
                  </tr>
                </table>

                <!-- Track Button -->
                <h3 style="margin: 24px 0 12px; color: #0f172a; font-size: 18px;">🔍 Track & Update Your Case</h3>
                <p style="color: #64748b; font-size: 14px;">You can check the status of your report and add additional information at any time using the link below:</p>
                <div class="button-container">
                  <a href="${trackingUrl}" class="button">View Case Status</a>
                </div>

                <div class="warning">
                  <strong>⚠️ Important: Save This Email</strong>
                  <p>The tracking link is your unique access key. For security reasons, it cannot be accessed by anyone else.</p>
                </div>

                <!-- What's Next -->
                <h3 style="margin: 24px 0 16px; color: #0f172a; font-size: 18px;">📌 What Happens Next?</h3>
                <table width="100%" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                      <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</span>
                    </td>
                    <td style="padding: 10px 0;">
                      <strong style="color: #334155;">Review Process:</strong>
                      <span style="color: #64748b;"> Our team will review your report within 24-48 hours</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top;">
                      <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</span>
                    </td>
                    <td style="padding: 10px 0;">
                      <strong style="color: #334155;">Investigation:</strong>
                      <span style="color: #64748b;"> Valid reports will be investigated and added to our public database</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top;">
                      <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</span>
                    </td>
                    <td style="padding: 10px 0;">
                      <strong style="color: #334155;">Updates:</strong>
                      <span style="color: #64748b;"> You can check your case status anytime using the link above</span>
                    </td>
                  </tr>
                </table>

                <div class="info-box" style="background-color: #f0fdf4; border-left-color: #22c55e;">
                  <p style="color: #166534;"><strong>💚 Thank you for your report!</strong> By sharing your experience, you're helping protect others from similar scams and contributing to a safer online community for everyone.</p>
                </div>

                <p style="color: #64748b; font-size: 14px;">
                  If you have additional evidence or information, please use the tracking link above. For general questions, contact us at <a href="mailto:support@scamnemesis.com" style="color: #2563eb;">support@scamnemesis.com</a>.
                </p>
              </div>
              <div class="footer">
                <p class="brand">🛡️ ${SITE_NAME}</p>
                <p>Fighting Fraud, Protecting Communities</p>
                <p>This is an automated message. Please do not reply directly to this email.<br>For support, contact us at <a href="mailto:support@scamnemesis.com">support@scamnemesis.com</a></p>
                <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
${SITE_NAME} - Report Confirmation
================================

Dear ${options.reporterName || 'Reporter'},

Thank you for submitting your fraud report to ${SITE_NAME}. We have successfully received your report.

CASE NUMBER: ${options.caseNumber}

REPORT SUMMARY:
- Report Date: ${formattedDate}
- Fraud Type: ${safeFraudType}
- Reported Loss: ${formattedLoss}
- Status: Received - Pending Review

TRACK YOUR CASE:
${trackingUrl}

⚠️ IMPORTANT: Save this email. The tracking link is your unique access key.

WHAT HAPPENS NEXT:
1. Our team will review your report within 24-48 hours
2. Valid reports will be investigated and added to our public database
3. You can check your case status anytime using the link above

Your report helps protect others from similar scams.

For support: support@scamnemesis.com

© ${new Date().getFullYear()} ${SITE_NAME}
      `.trim(),
    };
  },

  /**
   * Password reset confirmation email
   */
  passwordResetConfirmation: (userName: string) => {
    const safeUserName = escapeHtml(userName);
    return {
      subject: `Password Changed Successfully - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);">
                <h1>✅ Password Changed</h1>
                <p>Your account is secure</p>
              </div>
              <div class="content">
                <h2>Password Successfully Changed</h2>
                <p>Hello ${safeUserName},</p>
                <div class="info-box" style="background-color: #f0fdf4; border-left-color: #22c55e;">
                  <p style="color: #166534;"><strong>Your password has been successfully changed.</strong> You can now sign in to your account with your new password.</p>
                </div>
                <div class="warning">
                  <strong>⚠️ Security Notice</strong>
                  <p>If you didn't make this change, please contact us immediately at <a href="mailto:support@scamnemesis.com" style="color: #92400e;">support@scamnemesis.com</a>.</p>
                  <p>All your previous sessions have been logged out for security.</p>
                </div>
                <div class="button-container">
                  <a href="${SITE_URL}/auth/login" class="button">Sign In Now</a>
                </div>
              </div>
              <div class="footer">
                <p class="brand">🛡️ ${SITE_NAME}</p>
                <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Changed Successfully

Hello ${userName},

Your password has been successfully changed. You can now sign in to your account with your new password.

SECURITY NOTICE:
If you didn't make this change, please contact us immediately at support@scamnemesis.com.
All your previous sessions have been logged out for security.

Sign in at: ${SITE_URL}/auth/login

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
    const headerColor = status === 'approved'
      ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
      : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
    const statusBoxStyle = status === 'approved'
      ? 'background-color: #f0fdf4; border-left: 4px solid #22c55e;'
      : 'background-color: #fef2f2; border-left: 4px solid #ef4444;';
    const statusTextColor = status === 'approved' ? '#166534' : '#991b1b';

    return {
      subject: `Report Status Updated - ${SITE_NAME}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Report Status Update</title>
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header" style="background: ${headerColor};">
                <h1>${status === 'approved' ? '✅ Report Approved' : '❌ Report Rejected'}</h1>
                <p>Status Update</p>
              </div>
              <div class="content">
                <h2>Your Report Has Been Reviewed</h2>
                <p>Hello ${safeUserName},</p>
                <div style="${statusBoxStyle} padding: 20px; border-radius: 8px; margin: 24px 0;">
                  <p style="margin: 0 0 12px; color: ${statusTextColor};"><strong>Report:</strong> ${safeReportTitle}</p>
                  <p style="margin: 0 0 12px; color: ${statusTextColor};"><strong>Status:</strong> ${status === 'approved' ? 'Approved & Published' : 'Rejected'}</p>
                  ${safeReason ? `<p style="margin: 0; color: ${statusTextColor};"><strong>Reason:</strong> ${safeReason}</p>` : ''}
                </div>
                ${status === 'approved'
                  ? `<p>Thank you for your report. By sharing your experience, you're helping protect others from scammers and making our community safer.</p>
                     <div class="button-container">
                       <a href="${SITE_URL}/search" class="button">View Published Reports</a>
                     </div>`
                  : `<p>If you have questions about why your report was rejected or would like to provide additional information, please contact us.</p>
                     <div class="button-container">
                       <a href="mailto:support@scamnemesis.com" class="button">Contact Support</a>
                     </div>`
                }
              </div>
              <div class="footer">
                <p class="brand">🛡️ ${SITE_NAME}</p>
                <p>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Report Status Updated

Hello ${userName},

Your report "${reportTitle}" has been ${status === 'approved' ? 'approved and published' : 'rejected'}.
${reason ? `Reason: ${reason}` : ''}

${status === 'approved'
  ? 'Thank you for your report. You\'re helping protect others from scammers.'
  : 'If you have questions about why your report was rejected, please contact us.'
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

  async sendPasswordResetConfirmation(email: string, userName: string): Promise<SendResult> {
    const template = emailTemplates.passwordResetConfirmation(userName);
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
