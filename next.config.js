/** @type {import('next').NextConfig} */
const path = require('path')
const nextConfig = {
  serverExternalPackages: ['pg', 'nodemailer', 'bcryptjs'],
  outputFileTracingRoot: path.join(__dirname)
}
module.exports = nextConfig
