import * as Sentry from "@sentry/nextjs";

// Use environment variable for DSN with fallback for development
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://a5ecdc13bf984af70c0f05c4d664cbfa@o4510352206266368.ingest.de.sentry.io/4510560439238736";

Sentry.init({
  dsn: SENTRY_DSN,

  // Performance Monitoring - lower in production to manage costs
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Only enable in production (or when DSN is explicitly set)
  enabled: process.env.NODE_ENV === "production" || !!process.env.SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV,
});
