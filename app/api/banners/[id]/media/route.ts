import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string }> }
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d4ed8"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Inter,Arial,sans-serif" font-size="58" font-weight="800">Banner FX Community</text><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#e9d5ff" font-family="Inter,Arial,sans-serif" font-size="28">Upload media banner dari Admin Panel</text></svg>`

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const id = params?.id
    const thumb = new URL(req.url).searchParams.get('thumb') === '1'
    const r = await query(`
      SELECT media_data, media_mimetype, media_filename, media_url, thumbnail_data, thumb_mimetype, thumbnail_url
      FROM event_banners
      WHERE id=$1
    `, [id])
    if (!r.rows.length) return NextResponse.json({ error: 'Banner tidak ditemukan.' }, { status: 404 })
    const row = r.rows[0]
    const useThumb = thumb && row.thumbnail_data
    const fileData = useThumb ? row.thumbnail_data : row.media_data
    const mimeType = useThumb ? row.thumb_mimetype : row.media_mimetype
    const hasBinary = !!fileData && (typeof fileData.length === 'number' ? fileData.length > 0 : true)
    if (hasBinary) {
      return new NextResponse(fileData, {
        status: 200,
        headers: {
          'Content-Type': mimeType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${row.media_filename || `banner-${id}`}"`,
          'Cache-Control': 'public, max-age=86400'
        }
      })
    }
    const fallbackUrl = useThumb ? row.thumbnail_url : row.media_url
    const isBrokenExternal = typeof fallbackUrl === 'string' && fallbackUrl.includes('cdn.example.com')
    if (fallbackUrl && !isBrokenExternal) return NextResponse.redirect(fallbackUrl, 307)
    return new NextResponse(PLACEHOLDER_SVG, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
