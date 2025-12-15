import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createHmac, timingSafeEqual } from 'crypto';

export const dynamic = 'force-dynamic';

// SECURITY: Webhook secret must be set in production
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.warn('[Webhook] WARNING: WEBHOOK_SECRET not set. Webhook endpoint will reject all requests.');
}

const EnrichmentWebhookSchema = z.object({
  event_type: z.enum(['enrichment_complete', 'enrichment_failed', 'enrichment_partial']),
  report_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  data: z.object({
    perpetrator_id: z.string().uuid().optional(),
    enrichment_type: z.enum(['social_media', 'domain_whois', 'phone_lookup', 'email_validation', 'address_verification']),
    status: z.enum(['success', 'failed', 'partial']),
    results: z.record(z.any()).optional(),
    error: z.string().optional(),
    source: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  }),
});

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // SECURITY: Reject if webhook secret is not configured
    if (!WEBHOOK_SECRET) {
      console.error('[Webhook] WEBHOOK_SECRET not configured - rejecting request');
      return NextResponse.json(
        { error: 'server_error', message: 'Webhook endpoint not configured' },
        { status: 503 }
      );
    }

    // Verify webhook signature using HMAC-SHA256
    // The signature should be passed in x-webhook-signature header
    const signature = request.headers.get('x-webhook-signature');

    // SECURITY: Only use HMAC verification - no plaintext comparison
    const isValidSignature = verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);

    if (!isValidSignature) {
      console.warn('[Webhook] Invalid signature received');
      return NextResponse.json(
        { error: 'unauthorized', message: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse and validate the webhook payload
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'invalid_json', message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validated = EnrichmentWebhookSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    const { event_type, report_id, data } = validated.data;

    // Verify the report exists
    const report = await prisma.report.findUnique({
      where: { id: report_id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Process the enrichment webhook
    await prisma.$transaction(async (tx) => {
      // Update perpetrator if specified
      if (data.perpetrator_id && data.results) {
        const perpetrator = await tx.perpetrator.findUnique({
          where: { id: data.perpetrator_id },
        });

        if (perpetrator) {
          // Merge enrichment results into perpetrator's enriched data
          const existingEnrichedData = (perpetrator.enrichedData as Record<string, unknown>) || {};
          const updatedEnrichedData = {
            ...existingEnrichedData,
            [data.enrichment_type]: {
              ...data.results,
              source: data.source,
              confidence: data.confidence,
              retrieved_at: new Date().toISOString(),
              status: data.status,
            },
          };

          await tx.perpetrator.update({
            where: { id: data.perpetrator_id },
            data: {
              enrichedData: updatedEnrichedData as object,
            },
          });
        }
      }

      // Store webhook event in audit log
      await tx.auditLog.create({
        data: {
          action: `WEBHOOK_${event_type.toUpperCase()}`,
          entityType: 'Report',
          entityId: report_id,
          changes: {
            event_type,
            enrichment_type: data.enrichment_type,
            status: data.status,
            perpetrator_id: data.perpetrator_id,
            has_results: !!data.results,
            error: data.error,
          },
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        },
      });

      // Update report enrichment status if needed
      if (event_type === 'enrichment_complete' || event_type === 'enrichment_partial') {
        const existingMetadata = (report.metadata as Record<string, unknown>) || {};
        await tx.report.update({
          where: { id: report_id },
          data: {
            metadata: {
              ...existingMetadata,
              last_enrichment: {
                type: data.enrichment_type,
                status: data.status,
                timestamp: new Date().toISOString(),
              },
            },
          },
        });
      }
    });

    return NextResponse.json({
      received: true,
      event_type,
      report_id,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing enrichment webhook:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
