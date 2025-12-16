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
    // In production, consider using nonces for stricter security
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for development
      "style-src 'self' 'unsafe-inline'", // Next.js uses inline styles
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.resend.com", // API endpoints
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

module.exports = nextConfig;
