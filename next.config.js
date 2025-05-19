/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  distDir: '.next',
  // Ensure routes manifest is generated correctly
  experimental: {
    // These settings help with proper route manifest generation
    serverComponentsExternalPackages: [],
    appDir: true,
  },
  // Add any environment variables you need here
  env: {
    // Add your environment variables here if needed
  },
}

module.exports = nextConfig
