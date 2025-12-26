const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for better CI/CD and Docker deployments
  output: 'standalone',

  // Enable SWC minification for better performance
  swcMinify: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Reduce build memory usage
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // Optimize memory usage during builds
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Enable instrumentation for Sentry
    instrumentationHook: true,
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    return config;
  },

  // ESLint configuration - strict mode for production quality
  eslint: {
    // Run ESLint during builds to catch errors
    ignoreDuringBuilds: false,
  },

  // TypeScript configuration - strict mode for type safety
  typescript: {
    // Do not ignore TypeScript errors for production quality
    ignoreBuildErrors: false,
  },

  // Redirects for non-localized routes
  async redirects() {
    return [
      {
        source: '/report/new',
        destination: '/sk/report/new',
        permanent: false,
      },
      {
        source: '/report/:path*',
        destination: '/sk/report/:path*',
        permanent: false,
      },
      {
        source: '/scam-prevention',
        destination: '/sk/scam-prevention',
        permanent: false,
      },
    ];
  },

  // Security headers
  async headers() {
    // Content Security Policy
    // Note: 'unsafe-inline' is needed for Next.js inline styles
    // Production removes 'unsafe-eval' for security (only needed for dev hot reload)
    const isProduction = process.env.NODE_ENV === 'production';

    const scriptSrc = isProduction
      ? "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com" // Production: no unsafe-eval
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"; // Development: needs eval for hot reload

    const cspHeader = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'", // Next.js uses inline styles
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.resend.com https://*.ingest.de.sentry.io https://challenges.cloudflare.com", // API endpoints + Sentry + Turnstile
      "frame-src 'self' https://challenges.cloudflare.com", // Turnstile CAPTCHA iframe
      "worker-src 'self' blob:", // Allow Web Workers from blob URLs (needed for Sentry and other libraries)
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          // Additional security headers
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: "m0ne-sro",
  project: "scamnemesis",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hide source maps from client bundles
  hideSourceMaps: true,

  // Automatically instrument React components
  reactComponentAnnotation: {
    enabled: true,
  },

  // NOTE: tunnelRoute removed - sending directly to Sentry
  // CSP already allows https://*.ingest.de.sentry.io
});
