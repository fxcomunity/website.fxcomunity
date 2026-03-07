/** @type {import('next').NextConfig} */
const path = require('path')
const nextConfig = {
  serverExternalPackages: ['pg', 'nodemailer', 'bcryptjs'],
  outputFileTracingRoot: path.join(__dirname),
  distDir: '.next-runtime'
}
module.exports = nextConfig
