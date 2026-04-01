import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET — list semua genre (untuk form admin & filter player)
export async function GET() {
  try {
    const res = await query('SELECT id, name, slug FROM genres ORDER BY name')
    return NextResponse.json({ success: true, data: res.rows })
  } catch (e) {
    console.error('GET /api/music/genres error:', e)
    return NextResponse.json({ success: false, data: [] })
  }
}
