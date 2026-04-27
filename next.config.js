/** @type {import('next').NextConfig} */
const path = require('path')
const nextConfig = {
  serverExternalPackages: ['pg', 'nodemailer', 'bcryptjs'],
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
module.exports = nextConfig
