/**
 * Report Export API Route
 *
 * GET /api/v1/reports/:id/export - Export report as PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, requireRateLimit } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Report type inferred from Prisma query result
type ReportForExport = NonNullable<Awaited<ReturnType<typeof getReportForExport>>>;

// Helper to get report type from DB query
async function getReportForExport(id: string) {
  const { prisma } = await import('@/lib/db');
  return prisma.report.findFirst({
    where: {
      OR: [{ id }, { publicId: id }],
    },
    include: {
      perpetrators: true,
      financialInfo: true,
      cryptoInfo: true,
      digitalFootprint: true,
    },
  });
}

/**
 * Generate HTML template for PDF export
 */
function generateReportHTML(report: ReportForExport): string {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number | null, currency: string | null | undefined) => {
    if (!amount) return 'N/A';
    return `${amount.toLocaleString('sk-SK')} ${currency || 'EUR'}`;
  };

  const fraudTypeLabels: Record<string, string> = {
    INVESTMENT_FRAUD: 'Investicny podvod',
    ROMANCE_SCAM: 'Romance scam',
    PHISHING: 'Phishing',
    IDENTITY_THEFT: 'Kradez identity',
    ECOMMERCE_FRAUD: 'E-commerce podvod',
    CRYPTO_SCAM: 'Crypto podvod',
    JOB_SCAM: 'Pracovny podvod',
    RENTAL_FRAUD: 'Podvod s prenajmom',
    LOAN_SCAM: 'Podvod s pozickou',
    FAKE_CHARITY: 'Falosna charita',
    TECH_SUPPORT_SCAM: 'Tech support scam',
    LOTTERY_SCAM: 'Loterny podvod',
    OTHER: 'Iny typ',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Caka na schvalenie',
    APPROVED: 'Schvalene',
    REJECTED: 'Zamietnute',
    UNDER_REVIEW: 'V procese kontroly',
    MERGED: 'Zlucene',
  };

  const severityLabels: Record<string, string> = {
    LOW: 'Nizka',
    MEDIUM: 'Stredna',
    HIGH: 'Vysoka',
    CRITICAL: 'Kriticka',
  };

  return `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hlasenie podvodu - ${report.publicId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .logo span {
      color: #dc2626;
    }
    .report-id {
      text-align: right;
    }
    .report-id .id {
      font-family: monospace;
      font-size: 14px;
      color: #666;
    }
    .report-id .date {
      font-size: 11px;
      color: #888;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 10px;
      color: #111;
    }
    h2 {
      font-size: 14px;
      color: #2563eb;
      margin-top: 25px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      margin-right: 8px;
    }
    .badge-status {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .badge-type {
      background: #fef3c7;
      color: #b45309;
    }
    .badge-severity-low { background: #d1fae5; color: #065f46; }
    .badge-severity-medium { background: #fef3c7; color: #b45309; }
    .badge-severity-high { background: #fee2e2; color: #b91c1c; }
    .badge-severity-critical { background: #7f1d1d; color: #fff; }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .info-item {
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
    }
    .info-item label {
      display: block;
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-item .value {
      font-size: 13px;
      font-weight: 500;
      color: #111;
    }
    .description {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
      white-space: pre-wrap;
    }
    .perpetrator-card {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .perpetrator-card .warning {
      color: #b91c1c;
      font-size: 10px;
      margin-bottom: 10px;
    }
    .perpetrator-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .perpetrator-item label {
      font-size: 10px;
      color: #6b7280;
    }
    .perpetrator-item .value {
      font-family: monospace;
      font-size: 12px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #888;
    }
    .watermark {
      position: fixed;
      bottom: 20px;
      right: 20px;
      font-size: 10px;
      color: #ccc;
    }
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Scam<span>nemesis</span></div>
    <div class="report-id">
      <div class="id">${report.publicId}</div>
      <div class="date">Vygenerovane: ${formatDate(new Date())}</div>
    </div>
  </div>

  <h1>${report.summary || 'Bez nazvu'}</h1>

  <div style="margin-top: 10px;">
    <span class="badge badge-status">${statusLabels[report.status] || report.status}</span>
    <span class="badge badge-type">${fraudTypeLabels[report.fraudType] || report.fraudType}</span>
    ${report.severity ? `<span class="badge badge-severity-${report.severity.toLowerCase()}">${severityLabels[report.severity]}</span>` : ''}
  </div>

  <h2>Zakladne informacie</h2>
  <div class="info-grid">
    <div class="info-item">
      <label>Datum incidentu</label>
      <div class="value">${formatDate(report.incidentDate)}</div>
    </div>
    <div class="info-item">
      <label>Datum nahlasenia</label>
      <div class="value">${formatDate(report.createdAt)}</div>
    </div>
    <div class="info-item">
      <label>Lokalita</label>
      <div class="value">${[report.locationCity, report.locationCountry].filter(Boolean).join(', ') || 'N/A'}</div>
    </div>
    <div class="info-item">
      <label>Vyska skody</label>
      <div class="value">${formatAmount(Number(report.financialLossAmount), report.financialLossCurrency)}</div>
    </div>
  </div>

  <h2>Popis incidentu</h2>
  <div class="description">${report.description || 'Bez popisu'}</div>

  ${report.perpetrators[0] ? `
  <h2>Informacie o pachatelovi</h2>
  <div class="perpetrator-card">
    <div class="warning">VAROVANIE: Tieto udaje mozu byt zneuzite. Overujte informacie z viacerych zdrojov.</div>
    <div class="perpetrator-grid">
      ${report.perpetrators[0].fullName ? `
      <div class="perpetrator-item">
        <label>Meno</label>
        <div class="value">${report.perpetrators[0].fullName}</div>
      </div>
      ` : ''}
      ${report.perpetrators[0].phone ? `
      <div class="perpetrator-item">
        <label>Telefon</label>
        <div class="value">${report.perpetrators[0].phone}</div>
      </div>
      ` : ''}
      ${report.perpetrators[0].email ? `
      <div class="perpetrator-item">
        <label>Email</label>
        <div class="value">${report.perpetrators[0].email}</div>
      </div>
      ` : ''}
      ${report.digitalFootprint?.websiteUrl ? `
      <div class="perpetrator-item">
        <label>Webova stranka</label>
        <div class="value">${report.digitalFootprint.websiteUrl}</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${report.financialInfo ? `
  <h2>Financne udaje</h2>
  <div class="info-grid">
    ${report.financialInfo.iban ? `
    <div class="info-item">
      <label>IBAN</label>
      <div class="value" style="font-family: monospace;">${report.financialInfo.iban}</div>
    </div>
    ` : ''}
    ${report.financialInfo.bankName ? `
    <div class="info-item">
      <label>Banka</label>
      <div class="value">${report.financialInfo.bankName}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${report.cryptoInfo ? `
  <h2>Kryptomenove udaje</h2>
  <div class="info-grid">
    ${report.cryptoInfo.walletAddress ? `
    <div class="info-item">
      <label>Adresa penazenky</label>
      <div class="value" style="font-family: monospace; font-size: 10px; word-break: break-all;">${report.cryptoInfo.walletAddress}</div>
    </div>
    ` : ''}
    ${report.cryptoInfo.blockchain ? `
    <div class="info-item">
      <label>Blockchain</label>
      <div class="value">${report.cryptoInfo.blockchain}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div class="footer">
    <p>Tento dokument bol vygenerovany systemom Scamnemesis.</p>
    <p>Informacie v tomto dokumente su urcene len na informacne ucely a nemali by byt povazovane za pravne rady.</p>
    <p>Pre overenie aktualnosti udajov navstivte: scamnemesis.com/reports/${report.publicId}</p>
  </div>

  <div class="watermark">
    Scamnemesis &copy; ${new Date().getFullYear()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * GET /api/v1/reports/:id/export - Export report as PDF/HTML
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting
    const rateLimitError = await requireRateLimit(request, 20);
    if (rateLimitError) return rateLimitError;

    // Auth check (optional - logged in users get more data)
    const auth = await requireAuth(request).catch(() => null);

    const { id } = await params;

    // Get format from query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'html';

    // Find report
    const report = await prisma.report.findFirst({
      where: {
        OR: [
          { id },
          { publicId: id },
        ],
        // Only allow export of approved reports for non-admins
        ...(!(auth && 'auth' in auth && auth.auth.scopes.some(s => s.startsWith('admin:'))) ? { status: 'APPROVED' } : {}),
      },
      include: {
        perpetrators: true,
        financialInfo: true,
        cryptoInfo: true,
        digitalFootprint: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Generate HTML
    const html = generateReportHTML(report);

    // Return based on format
    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="report-${report.publicId}.html"`,
        },
      });
    }

    // For PDF format, return HTML with print-friendly styling
    // Client can use window.print() or a PDF generation library
    if (format === 'pdf') {
      const pdfHtml = html.replace('</head>', `
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </head>`);

      return new NextResponse(pdfHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="report-${report.publicId}.pdf"`,
        },
      });
    }

    // JSON format for programmatic access
    if (format === 'json') {
      const perpetrator = report.perpetrators[0];
      return NextResponse.json({
        id: report.publicId,
        summary: report.summary,
        description: report.description,
        fraudType: report.fraudType,
        status: report.status,
        severity: report.severity,
        incidentDate: report.incidentDate,
        createdAt: report.createdAt,
        location: {
          city: report.locationCity,
          country: report.locationCountry,
        },
        financialLoss: report.financialLossAmount ? Number(report.financialLossAmount) : null,
        currency: report.financialLossCurrency,
        perpetrator: perpetrator ? {
          name: perpetrator.fullName,
          phone: perpetrator.phone,
          email: perpetrator.email,
          website: report.digitalFootprint?.websiteUrl,
        } : null,
      });
    }

    return NextResponse.json(
      { error: 'invalid_format', message: 'Invalid export format. Use: html, pdf, json' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
