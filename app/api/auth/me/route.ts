import { NextRequest, NextResponse } from 'next/server'
import { getToken, verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'
export async function GET(req: NextRequest) {
  const token = getToken(req)
  let payload = null
  if (token) {
    payload = await verifyToken(token)
  }

  // Check Maintenance Mode
  const sRes = await query("SELECT value FROM settings WHERE key='maintenance_mode'")
  const isMaint = sRes.rows.length ? sRes.rows[0].value === 'true' : false
  if (isMaint) {
    if (!payload || !['Owner', 'Admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'Situs sedang maintenance', maintenance: true }, { status: 503 })
    }
  }

  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await query('SELECT id,username,email,role,status,created_at FROM users WHERE id=$1', [payload.id])
  if (!r.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: r.rows[0], maintenance: isMaint })
}
