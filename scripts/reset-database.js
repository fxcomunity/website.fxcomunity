#!/usr/bin/env node
const fs = require('fs')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Load environment variables
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

async function resetDatabase() {
  try {
    console.log('Starting database reset...')

    // List of tables to truncate
    const tables = [
      'download_histories',
      'login_logs',
      'playlists',
      'reports',
      'songs',
      'user_download',
      'user_favorites',
      'users'
    ]

    // Truncate all tables
    for (const table of tables) {
      console.log(`Truncating table: ${table}`)
      await pool.query(`TRUNCATE TABLE ${table} CASCADE`)
    }

    console.log('All tables truncated successfully')

    // Create new owner user
    const hashedPassword = await bcrypt.hash('sayanguci1', 12)
    const ownerData = {
      username: 'owner',
      email: '19250779@bsi.ac.id',
      password: hashedPassword,
      role: 'Owner',
      status: 'Aktif',
      email_verified: true
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, role, status, created_at`,
      [ownerData.username, ownerData.email, ownerData.password, ownerData.role, ownerData.status, ownerData.email_verified]
    )

    console.log('New owner user created:')
    console.log(result.rows[0])
    console.log('\nLogin credentials:')
    console.log('Email: 19250779@bsi.ac.id')
    console.log('Password: sayanguci1')

  } catch (error) {
    console.error('Error resetting database:', error)
  } finally {
    await pool.end()
  }
}

resetDatabase()