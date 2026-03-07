import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

const FALLBACK_MEDIA_URL = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d4ed8"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Inter,Arial,sans-serif" font-size="58" font-weight="800">Koleksi PDF Trading</text><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#e9d5ff" font-family="Inter,Arial,sans-serif" font-size="28">Terlengkap & Gratis</text></svg>')}`

export async function GET() {
  try {
    const r = await query(`SELECT * FROM vw_active_banners ORDER BY priority DESC`)
    const data = r.rows.map((b: any) => ({
      ...b,
      media_url: `/api/banners/${b.id}/media`,
      thumbnail_url: b.thumb_mimetype ? `/api/banners/${b.id}/media?thumb=1` : null
    }))
    if (!data.length) {
      return NextResponse.json([{
        id: 0,
        title: 'Koleksi PDF Trading Terlengkap',
        description: 'Materi basic sampai advanced, gratis untuk member.',
        media_type: 'image',
        media_url: FALLBACK_MEDIA_URL,
        thumbnail_url: null,
        alt_text: 'Koleksi PDF Trading',
        target_url: '/library',
        target_blank: false,
        priority: 0
      }])
    }
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
