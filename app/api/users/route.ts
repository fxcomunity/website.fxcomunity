import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const r = await query('SELECT id,username,first_name,last_name,email,role,status,created_at FROM users ORDER BY created_at DESC')
  return NextResponse.json({ success: true, data: r.rows })
}

export async function PUT(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, status, role } = await req.json()
  if (role && user.role !== 'Owner') return NextResponse.json({ error: 'Hanya Owner yang bisa ubah role' }, { status: 403 })
  
  if (role) {
    const oldUser = await query('SELECT role FROM users WHERE id=$1', [id])
    if (oldUser.rows.length > 0 && oldUser.rows[0].role !== role) {
      if (role === 'Admin') {
        await query('INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)', [id, 'Promosi Jabatan', 'Selamat! Jabatan Anda telah dinaikkan menjadi Admin oleh Owner.', 'success'])
      } else if (role === 'User') {
        await query('INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)', [id, 'Perubahan Jabatan', 'Jabatan Anda telah diubah menjadi User biasa.', 'info'])
      }
    }
  }

  const r = await query(
    'UPDATE users SET status=COALESCE($1,status), role=COALESCE($2,role) WHERE id=$3 RETURNING id,username,email,role,status',
    [status, role, id]
  )
  return NextResponse.json({ success: true, data: r.rows[0] })
}

export async function POST(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { username, email, password, role } = await req.json()
  if (role !== 'Admin') return NextResponse.json({ error: 'Role yang diizinkan hanya Admin' }, { status: 400 })
  if (!username || !email || !password) return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 })
  if (String(password).length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })

  const existUser = await query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email])
  if (existUser.rows.length) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })

  if (user.role === 'Owner') {
    const hashed = await bcrypt.hash(String(password), 12)
    const created = await query(
      "INSERT INTO users (username,email,password,role,status,email_verified) VALUES ($1,$2,$3,'Admin','Aktif',true) RETURNING id,username,email,role,status,created_at",
      [username, email, hashed]
    )
    return NextResponse.json({ success: true, mode: 'direct', data: created.rows[0] }, { status: 201 })
  }

  // Non-owner admin: create request for approval
  const pending = await query(
    "SELECT id FROM admin_requests WHERE status='Pending' AND email=$1 LIMIT 1",
    [email]
  )
  if (pending.rows.length) return NextResponse.json({ error: 'Permintaan dengan email ini masih menunggu approval Owner' }, { status: 400 })

  const hashed = await bcrypt.hash(String(password), 12)
  const createdReq = await query(
    "INSERT INTO admin_requests (requester_id,username,email,password_hash,requested_role,status) VALUES ($1,$2,$3,$4,'Admin','Pending') RETURNING id,username,email,requested_role,status,created_at",
    [user.id, username, email, hashed]
  )
  return NextResponse.json({ success: true, mode: 'request', message: 'Permintaan tambah Admin dikirim ke Owner untuk verifikasi', data: createdReq.rows[0] }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  if (user.role !== 'Owner') return NextResponse.json({ error: 'Hanya Owner yang bisa hapus user' }, { status: 403 })
  if (id === user.id) return NextResponse.json({ error: 'Tidak bisa hapus user sendiri' }, { status: 400 })
  await query('DELETE FROM users WHERE id=$1', [id])
  return NextResponse.json({ success: true })
}
