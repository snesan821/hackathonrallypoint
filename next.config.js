/** @type {import('next').NextConfig} */
const path = require('path')

const hasValidClerkKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_')

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack(config, { isServer }) {
    if (!hasValidClerkKey) {
      const clerkStub = path.resolve(__dirname, 'src/lib/clerk-stub.tsx')
      const clerkServerStub = path.resolve(__dirname, 'src/lib/clerk-stub-server.ts')
      // Apply to both client and server compilations
      config.resolve.alias['@clerk/nextjs'] = clerkStub
      config.resolve.alias['@clerk/nextjs/server'] = clerkServerStub
    }
    return config
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // Prevent XSS attacks
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          // CSP removed for now — was blocking Clerk's clerk.accounts.dev domain
          // HSTS (HTTP Strict Transport Security)
          // Only enable in production with HTTPS
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ]
  },
}

module.exports = nextConfig
