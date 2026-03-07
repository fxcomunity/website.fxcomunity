import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await query('SELECT id,username,email,phone_number,role,status,created_at,email_verified FROM users WHERE id=$1', [user.id])
  if (!r.rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: r.rows[0] })
}

export async function PUT(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { username, email, phone_number } = body

    // Validate inputs
    if (!username || !email) {
      return NextResponse.json({ error: 'Username dan email wajib diisi' }, { status: 400 })
    }

    // Check if username already taken by another user
    if (username !== user.username) {
      const check = await query('SELECT id FROM users WHERE username=$1 AND id!=$2', [username, user.id])
      if (check.rows.length) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    // Check if email already taken by another user
    if (email !== user.email) {
      const check = await query('SELECT id FROM users WHERE email=$1 AND id!=$2', [email, user.id])
      if (check.rows.length) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
    }

    // Update user
    const r = await query(
      'UPDATE users SET username=$1, email=$2, phone_number=$3 WHERE id=$4 RETURNING id,username,email,phone_number,role,status,created_at,email_verified',
      [username, email, phone_number, user.id]
    )

    return NextResponse.json({ success: true, data: r.rows[0] })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
