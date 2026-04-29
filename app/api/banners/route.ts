import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const r = await query(`SELECT * FROM vw_active_banners ORDER BY priority DESC`)
    const data = r.rows.map((b: any) => ({
      ...b,
      media_url: `/api/banners/${b.id}/media`,
      thumbnail_url: b.thumb_mimetype ? `/api/banners/${b.id}/media?thumb=1` : null
    }))
    if (!data.length) {
      return NextResponse.json([], { headers: NO_CACHE_HEADERS })
    }
    return NextResponse.json(data, { headers: NO_CACHE_HEADERS })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
