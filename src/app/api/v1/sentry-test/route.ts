import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * GET /api/v1/sentry-test
 * Test endpoint to verify Sentry is working correctly.
 * Returns Sentry configuration status without triggering an error.
 */
export async function GET() {
  const isEnabled = process.env.NODE_ENV === "production";

  return NextResponse.json({
    sentry: {
      enabled: isEnabled,
      environment: process.env.NODE_ENV,
      dsn: isEnabled ? "configured" : "disabled (not production)",
    },
    message: "Use POST to trigger a test error",
    endpoints: {
      captureMessage: "POST /api/v1/sentry-test?type=message",
      captureException: "POST /api/v1/sentry-test?type=exception",
    }
  });
}

/**
 * POST /api/v1/sentry-test
 * Triggers a test error to verify Sentry is capturing events.
 *
 * Query params:
 * - type=message: Send a test message to Sentry
 * - type=exception: Throw and capture a test exception
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "exception";

  const timestamp = new Date().toISOString();
  const isEnabled = process.env.NODE_ENV === "production";

  if (type === "message") {
    // Capture a test message
    const eventId = Sentry.captureMessage(`Test message from Sentry API at ${timestamp}`, {
      level: "info",
      tags: {
        test: "true",
        endpoint: "sentry-test",
      },
    });

    return NextResponse.json({
      success: true,
      type: "message",
      eventId: eventId || null,
      sentryEnabled: isEnabled,
      timestamp,
      message: isEnabled
        ? `Message sent to Sentry with ID: ${eventId}`
        : "Sentry disabled (not in production mode)",
    });
  }

  // Capture a test exception
  const testError = new Error(`Test exception from Sentry API at ${timestamp}`);
  const eventId = Sentry.captureException(testError, {
    tags: {
      test: "true",
      endpoint: "sentry-test",
    },
  });

  return NextResponse.json({
    success: true,
    type: "exception",
    eventId: eventId || null,
    sentryEnabled: isEnabled,
    timestamp,
    message: isEnabled
      ? `Exception sent to Sentry with ID: ${eventId}`
      : "Sentry disabled (not in production mode)",
  });
}
