import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

// Helper function to mask sensitive data based on user role
function maskField(value: string | null, fieldType: 'email' | 'phone' | 'iban' | 'name' | 'wallet', userRole: string): string | null {
  if (!value) return null;

  // Admin and Super Admin see everything unmasked
  if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    return value;
  }

  // Gold tier sees partial masking
  if (userRole === 'GOLD') {
    switch (fieldType) {
      case 'email':
        const [local, domain] = value.split('@');
        if (!domain) return '***@***.***';
        return `${local.slice(0, 2)}***@${domain}`;
      case 'phone':
        return value.slice(0, 4) + '****' + value.slice(-2);
      case 'iban':
        return value.slice(0, 4) + '****' + value.slice(-4);
      case 'name':
        const parts = value.split(' ');
        return parts.map(p => p[0] + '***').join(' ');
      case 'wallet':
        return value.slice(0, 6) + '...' + value.slice(-4);
      default:
        return value;
    }
  }

  // Standard tier sees more masking
  if (userRole === 'STANDARD') {
    switch (fieldType) {
      case 'email':
        const [local2, domain2] = value.split('@');
        if (!domain2) return '***@***.***';
        return `${local2[0]}***@${domain2.split('.')[0]}***.***`;
      case 'phone':
        return value.slice(0, 3) + '*****' + value.slice(-2);
      case 'iban':
        return value.slice(0, 2) + '******' + value.slice(-2);
      case 'name':
        const parts2 = value.split(' ');
        return parts2.map(p => p[0] + '***').join(' ');
      case 'wallet':
        return value.slice(0, 4) + '...' + value.slice(-2);
      default:
        return value;
    }
  }

  // Basic tier and anonymous see heavy masking
  switch (fieldType) {
    case 'email':
      return '***@***.***';
    case 'phone':
      return '***-***-' + value.slice(-2);
    case 'iban':
      return '****-****-****-' + value.slice(-4);
    case 'name':
      const parts3 = value.split(' ');
      return parts3.map(p => p[0] + '.').join(' ');
    case 'wallet':
      return '***...' + value.slice(-2);
    default:
      return '***';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Get authentication context (optional - public endpoint)
    const auth = await getAuthContext(request);
    const isAdmin = auth.scopes.some(s => s.startsWith('admin:'));

    // Determine user role for masking
    const userRole = isAdmin ? 'ADMIN' : (auth.user ? 'STANDARD' : 'BASIC');

    // Find the report
    const report = await prisma.report.findFirst({
      where: {
        OR: [
          { id },
          { publicId: id },
        ],
        // Only show approved reports to public
        ...(!isAdmin ? {
          status: 'APPROVED',
        } : {}),
      },
      include: {
        perpetrators: true,
        digitalFootprint: true,
        financialInfo: true,
        cryptoInfo: true,
        evidence: {
          where: {
            // Only show evidence for approved reports
          },
          select: {
            id: true,
            type: true,
            url: true,
            thumbnailUrl: true,
            description: true,
          },
        },
        comments: {
          where: {
            status: 'APPROVED',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                displayName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Get first perpetrator for main perpetrator data
    const perpetrator = report.perpetrators[0];

    // Build response with masked data based on user role
    const response = {
      id: report.id,
      public_id: report.publicId,
      status: report.status.toLowerCase(),
      fraud_type: report.fraudType?.toLowerCase(),
      severity: report.severity?.toLowerCase(),
      summary: report.summary,
      description: report.description,
      incident_date: report.incidentDate?.toISOString(),
      location: report.location || {
        country: report.locationCountry,
        city: report.locationCity,
      },
      financial_loss: report.financialLossAmount ? {
        amount: Number(report.financialLossAmount),
        currency: report.financialLossCurrency,
      } : null,

      // Perpetrator data with masking
      perpetrator: perpetrator ? {
        full_name: maskField(perpetrator.fullName, 'name', userRole),
        nickname: perpetrator.nickname,
        username: perpetrator.username,
        nationality: perpetrator.nationality,
        approx_age: perpetrator.approxAge,
        physical_description: perpetrator.physicalDescription,
        email: maskField(perpetrator.email, 'email', userRole),
        phone: maskField(perpetrator.phone, 'phone', userRole),
        address: {
          city: perpetrator.addressCity,
          country: perpetrator.addressCountry,
        },
      } : null,

      // Digital footprint with masking
      digital_footprint: report.digitalFootprint ? {
        telegram: report.digitalFootprint.telegram,
        whatsapp: report.digitalFootprint.whatsapp,
        signal: report.digitalFootprint.signal,
        instagram: report.digitalFootprint.instagram,
        facebook: report.digitalFootprint.facebook,
        tiktok: report.digitalFootprint.tiktok,
        twitter: report.digitalFootprint.twitter,
        website_url: report.digitalFootprint.websiteUrl,
        domain_name: report.digitalFootprint.domainName,
        ip_country: report.digitalFootprint.ipCountry,
      } : null,

      // Financial info with masking
      financial: report.financialInfo ? {
        iban: maskField(report.financialInfo.iban, 'iban', userRole),
        account_holder: maskField(report.financialInfo.accountHolder, 'name', userRole),
        bank_name: report.financialInfo.bankName,
        bank_country: report.financialInfo.bankCountry,
      } : null,

      // Crypto info with masking
      crypto: report.cryptoInfo ? {
        wallet_address: maskField(report.cryptoInfo.walletAddress, 'wallet', userRole),
        blockchain: report.cryptoInfo.blockchain?.toLowerCase(),
        exchange: report.cryptoInfo.exchangeWalletName,
      } : null,

      // Evidence (images, documents)
      evidence: report.evidence.map(e => ({
        id: e.id,
        type: e.type.toLowerCase(),
        thumbnail_url: e.thumbnailUrl,
        description: e.description,
      })),

      // Approved comments
      comments: report.comments.map(c => ({
        id: c.id,
        content: c.content,
        author: c.user?.displayName || 'Anonymous',
        created_at: c.createdAt.toISOString(),
      })),

      // Metadata
      published_at: report.publishedAt?.toISOString(),
      created_at: report.createdAt.toISOString(),

      // Stats
      view_count: 0, // TODO: Implement view tracking
      comment_count: report.comments.length,
      related_reports_count: report.mergeCount,
    };

    // Track view (async, don't wait)
    // TODO: Implement view tracking with rate limiting
    // trackReportView(report.id, request.headers.get('x-forwarded-for'));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// POST /reports/:id/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Check if it's a comment submission
  const url = new URL(request.url);
  if (!url.pathname.endsWith('/comments')) {
    return NextResponse.json(
      { error: 'method_not_allowed', message: 'POST not allowed on this endpoint' },
      { status: 405 }
    );
  }

  // Get authentication context
  const auth = await getAuthContext(request);
  const userId = auth.user?.sub || auth.apiKey?.userId;
  if (!userId) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Authentication required to comment' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const CommentSchema = z.object({
      content: z.string().min(10).max(2000),
    });

    const validated = CommentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    // Verify report exists and is approved
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id }, { publicId: id }],
        status: 'APPROVED',
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        reportId: report.id,
        userId: userId,
        content: validated.data.content,
        status: 'PENDING_MODERATION',
      },
    });

    return NextResponse.json({
      id: comment.id,
      status: 'pending_moderation',
      message: 'Comment submitted for moderation',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
