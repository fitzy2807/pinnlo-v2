/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build for development environment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build for development environment
    ignoreBuildErrors: true,
  },
  // Skip trailing slash redirects
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return {
      beforeFiles: [
        // Skip catalyst-demo pages during build
        {
          source: '/catalyst-demo/:path*',
          destination: '/404',
        },
      ],
    }
  },
}

module.exports = nextConfig