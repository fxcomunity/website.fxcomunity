import { NextResponse } from 'next/server'
import { query, initDB } from '@/lib/db'
import { seedPDFs } from '@/lib/seed'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Initialize database schema
    await initDB()

    // Seed PDFs
    await seedPDFs()

    // Check if owner user exists
    const existingOwner = await query('SELECT id FROM users WHERE email = $1', ['aqsholhalqi2@gmail.com'])

    if (existingOwner.rows.length === 0) {
      // Create default owner user
      const hashedPassword = await bcrypt.hash('owner123', 12)
      await query(
        'INSERT INTO users (username, email, password, role, status, email_verified) VALUES ($1, $2, $3, $4, $5, $6)',
        ['owner', 'aqsholhalqi2@gmail.com', hashedPassword, 'Owner', 'Aktif', true]
      )
      console.log('Default owner user created: aqsholhalqi2@gmail.com / owner123')
    } else {
      console.log('Owner user already exists')
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized, PDFs seeded, and owner user created if not exists'
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 })
  }
}