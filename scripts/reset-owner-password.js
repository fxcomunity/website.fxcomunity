#!/usr/bin/env node
const fs = require('fs')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Try to load .env.local if present (simple parser)
if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8')
  env.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/)
    if (m) {
      const key = m[1]
      let val = m[2]
      if (val.startsWith("\"") && val.endsWith("\"")) val = val.slice(1, -1)
      process.env[key] = val
    }
  })
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL not set. Set it in .env.local or environment.')
  process.exit(1)
}

const useSSL = process.env.DATABASE_SSL === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon'))
const pool = new Pool({ connectionString, ssl: useSSL ? { rejectUnauthorized: false } : false })

async function main() {
  const newPassword = process.argv[2]
  if (!newPassword) {
    console.error('Usage: node scripts/reset-owner-password.js <newPassword>')
    process.exit(1)
  }
  const hashed = await bcrypt.hash(newPassword, 12)
  const email = 'owner@fxcomunity.com'
  const r = await pool.query('UPDATE users SET password=$1 WHERE email=$2 RETURNING id,username,email', [hashed, email])
  if (r.rowCount) {
    console.log('Password owner berhasil diubah untuk:', r.rows[0])
  } else {
    console.log('Tidak menemukan user owner dengan email', email)
  }
  await pool.end()
}

main().catch(e => { console.error('Error:', e); process.exit(1) })
