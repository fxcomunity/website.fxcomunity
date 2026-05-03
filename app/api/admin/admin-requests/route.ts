import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

async function ensureAdminRequestsTable() {
  await query(`CREATE TABLE IF NOT EXISTS admin_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    requested_role VARCHAR(20) NOT NULL DEFAULT 'Admin' CHECK (requested_role IN ('Admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
    owner_note TEXT,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`)
}

export async function GET(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await ensureAdminRequestsTable()

  const r = user.role === 'Owner'
    ? await query(
      `SELECT ar.id, ar.requester_id, ar.username, ar.email, ar.requested_role, ar.status, ar.owner_note, ar.created_at, ar.updated_at,
              req.first_name AS requester_name, own.first_name AS owner_name
       FROM admin_requests ar
       LEFT JOIN users req ON req.id=ar.requester_id
       LEFT JOIN users own ON own.id=ar.approved_by
       ORDER BY ar.created_at DESC`
    )
    : await query(
      `SELECT ar.id, ar.requester_id, ar.username, ar.email, ar.requested_role, ar.status, ar.owner_note, ar.created_at, ar.updated_at,
              req.first_name AS requester_name, own.first_name AS owner_name
       FROM admin_requests ar
       LEFT JOIN users req ON req.id=ar.requester_id
       LEFT JOIN users own ON own.id=ar.approved_by
       WHERE ar.requester_id=$1
       ORDER BY ar.created_at DESC`,
      [user.id]
    )

  return NextResponse.json({ success: true, data: r.rows })
}

export async function PUT(req: NextRequest) {
  const token = getToken(req)
  const user = token ? await verifyToken(token) : null
  if (!user || user.role !== 'Owner') return NextResponse.json({ error: 'Hanya Owner yang bisa verifikasi permintaan admin' }, { status: 403 })
  await ensureAdminRequestsTable()

  const { id, action, owner_note } = await req.json()
  if (!id || !['approve', 'reject'].includes(action)) return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })

  const r = await query("SELECT * FROM admin_requests WHERE id=$1 AND status='Pending' LIMIT 1", [id])
  if (!r.rows.length) return NextResponse.json({ error: 'Permintaan tidak ditemukan atau sudah diproses' }, { status: 404 })
  const reqRow = r.rows[0]

  if (action === 'approve') {
    const exist = await query('SELECT id FROM users WHERE email=$1 LIMIT 1', [reqRow.email])
    if (exist.rows.length) return NextResponse.json({ error: 'Email sudah terpakai saat approval' }, { status: 400 })
    await query(
      "INSERT INTO users (username, first_name, email, password, role, status, email_verified) VALUES ($1, $1, $2, $3, 'Admin', 'Aktif', true)",
      [reqRow.username, reqRow.email, reqRow.password_hash]
    )
    await query(
      "UPDATE admin_requests SET status='Approved', approved_by=$1, owner_note=$2, updated_at=NOW() WHERE id=$3",
      [user.id, owner_note || null, id]
    )
    return NextResponse.json({ success: true, message: 'Permintaan admin disetujui dan user Admin telah dibuat' })
  }

  await query(
    "UPDATE admin_requests SET status='Rejected', approved_by=$1, owner_note=$2, updated_at=NOW() WHERE id=$3",
    [user.id, owner_note || null, id]
  )
  return NextResponse.json({ success: true, message: 'Permintaan admin ditolak' })
}
