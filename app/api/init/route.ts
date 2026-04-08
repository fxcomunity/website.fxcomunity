import { NextRequest, NextResponse } from 'next/server'
import { initDB } from '@/lib/db'
import { seedPDFs } from '@/lib/seed'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    await initDB()
    await seedPDFs()

    // ── Upsert akun Owner utama (aqsholhalqi2@gmail.com) ──
    const ownerEmail = 'aqsholhalqi2@gmail.com'
    const ownerPass  = process.env.OWNER_PASSWORD || 'FXCowner@2025!'
    const ownerHash  = await bcrypt.hash(ownerPass, 12)

    const existOwner = await query('SELECT id FROM users WHERE email=$1', [ownerEmail])
    if (!existOwner.rows.length) {
      await query(
        `INSERT INTO users (username, email, password, role, status, email_verified)
         VALUES ('aqsholhalqi', $1, $2, 'Owner', 'Aktif', true)`,
        [ownerEmail, ownerHash]
      )
    } else {
      // Pastikan role & status benar, dan update password kalau perlu
      await query(
        `UPDATE users SET role='Owner', status='Aktif', email_verified=true, password=$2
         WHERE email=$1`,
        [ownerEmail, ownerHash]
      )
    }

    // ── Fallback owner lama (opsional) ──
    const existFallback = await query("SELECT id FROM users WHERE email='owner@fxcomunity.com'")
    if (!existFallback.rows.length) {
      const h = await bcrypt.hash('owner123', 12)
      await query(
        `INSERT INTO users (username,email,password,role,status,email_verified)
         VALUES ('owner','owner@fxcomunity.com',$1,'Owner','Aktif',true)`,
        [h]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized & seeded!',
      ownerAccount: {
        email: ownerEmail,
        password: ownerPass,
        note: 'Ganti OWNER_PASSWORD di env Vercel untuk keamanan'
      }
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

