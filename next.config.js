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
}

module.exports = nextConfig