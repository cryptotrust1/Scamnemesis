import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a5ecdc13bf984af70c0f05c4d664cbfa@o4510352206266368.ingest.de.sentry.io/4510560439238736",

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Set environment
  environment: process.env.NODE_ENV,

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Network errors
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // Browser extensions
    "ResizeObserver loop",
    // User aborts
    "AbortError",
  ],

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
