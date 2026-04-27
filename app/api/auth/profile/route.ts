import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await query('SELECT id,first_name,last_name,email,role,status,created_at,email_verified FROM users WHERE id=$1', [user.id])
  if (!r.rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: r.rows[0] })
}

export async function PUT(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { first_name, last_name, email } = body

    // Validate inputs
    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    }

    // Check if email already taken by another user
    if (email !== user.email) {
      const check = await query('SELECT id FROM users WHERE email=$1 AND id!=$2', [email, user.id])
      if (check.rows.length) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
    }

    // Update user
    const r = await query(
      'UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE id=$4 RETURNING id,first_name,last_name,email,role,status,created_at,email_verified',
      [first_name || null, last_name || null, email, user.id]
    )

    return NextResponse.json({ success: true, data: r.rows[0] })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
