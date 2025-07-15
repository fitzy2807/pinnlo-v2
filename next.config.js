/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build for development environment
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig