import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

const ALLOWED_STARTS = [
  /^select\s+/i,
  /^insert\s+into\s+event_banners\s+/i,
  /^update\s+event_banners\s+/i,
  /^delete\s+from\s+event_banners\s+/i,
]
const FORBIDDEN = /\b(drop|alter|truncate|create\s+(table|view|function|trigger|index)|grant|revoke)\b/i
const ALLOWED_TABLES = /\b(event_banners|vw_active_banners)\b/i

function isAllowed(sql: string) {
  const s = sql.trim()
  if (FORBIDDEN.test(s)) return false
  if (!ALLOWED_TABLES.test(s)) return false
  return ALLOWED_STARTS.some(r => r.test(s))
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const sql = String(body.sql || '')
    if (!sql.trim()) return NextResponse.json({ error: 'SQL kosong' }, { status: 400 })
    if (!isAllowed(sql)) return NextResponse.json({ error: 'SQL tidak diizinkan' }, { status: 400 })
    const res = await query(sql)
    const rows = (res as any).rows || []
    const rowCount = (res as any).rowCount ?? rows.length ?? 0
    return NextResponse.json({ success: true, rows, rowCount })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
