import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Ensure table exists on first request
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS reports (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
      username   VARCHAR(100),
      email      VARCHAR(255),
      type       VARCHAR(50)  DEFAULT 'bug',
      title      VARCHAR(255) NOT NULL,
      description TEXT        NOT NULL,
      status     VARCHAR(30)  DEFAULT 'open',
      created_at TIMESTAMP    DEFAULT NOW()
    )
  `)
}

export async function POST(req: Request) {
  try {
    await ensureTable()
    const { type, title, description } = await req.json()

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ success: false, message: 'Title dan deskripsi wajib diisi' }, { status: 400 })
    }

    const session = await getCurrentUser()

    await query(
      `INSERT INTO reports (user_id, username, email, type, title, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        session?.id ?? null,
        session?.username ?? session?.first_name ?? 'Tamu',
        session?.email ?? null,
        type || 'bug',
        title.trim(),
        description.trim(),
      ]
    )

    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim! Terima kasih.' })
  } catch (error: any) {
    console.error('Report error:', error)
    return NextResponse.json({ success: false, message: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const mine = searchParams.get('mine') === '1'

    if (mine) {
      // Regular user fetching their own reports
      const res = await query(
        `SELECT id, type, title, description, status, created_at FROM reports WHERE user_id = $1 ORDER BY created_at DESC`,
        [session.id]
      )
      return NextResponse.json({ success: true, data: res.rows })
    }

    // Admin/Owner only — all reports
    if (!['Owner', 'Admin'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const res = await query(`SELECT * FROM reports ORDER BY created_at DESC LIMIT 100`)
    return NextResponse.json({ success: true, data: res.rows })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentUser()
    if (!session || !['Owner', 'Admin'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const { id, status } = await req.json()
    await query(`UPDATE reports SET status = $1 WHERE id = $2`, [status, id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getCurrentUser()
    if (!session || !['Owner', 'Admin'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await req.json()
    if (!id) return NextResponse.json({ success: false, message: 'ID wajib diisi' }, { status: 400 })
    await query(`DELETE FROM reports WHERE id = $1`, [id])
    return NextResponse.json({ success: true, message: 'Laporan berhasil dihapus' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 })
  }
}
