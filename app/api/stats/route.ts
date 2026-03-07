import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const r = await query("SELECT COUNT(*)::int AS total FROM users WHERE status='Aktif'")
    const total = r.rows.length ? r.rows[0].total : 0
    return NextResponse.json({ success: true, data: { activeUsers: total } })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
