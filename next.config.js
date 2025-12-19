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

  // Security headers
  async headers() {
    // Content Security Policy
    // Note: 'unsafe-inline' is needed for Next.js inline styles
    // Production removes 'unsafe-eval' for security (only needed for dev hot reload)
    const isProduction = process.env.NODE_ENV === 'production';

    const scriptSrc = isProduction
      ? "script-src 'self' 'unsafe-inline'" // Production: no unsafe-eval
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"; // Development: needs eval for hot reload

    const cspHeader = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'", // Next.js uses inline styles
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.resend.com https://*.ingest.de.sentry.io", // API endpoints + Sentry
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

  // Route handler and middleware instrumentation
  tunnelRoute: "/monitoring",
});
