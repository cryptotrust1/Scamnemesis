import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a5ecdc13bf984af70c0f05c4d664cbfa@o4510352206266368.ingest.de.sentry.io/4510560439238736",

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Set environment
  environment: process.env.NODE_ENV,
});
