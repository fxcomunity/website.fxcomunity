import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
const MAX_SIZE = 10 * 1024 * 1024

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const r = await query(`
      SELECT id, title, description, media_type, media_mimetype, media_filename, media_size,
             thumb_mimetype, alt_text, target_url, target_blank, start_date, end_date, priority, is_active
      FROM event_banners
      ORDER BY priority DESC, created_at DESC
    `)
    const data = r.rows.map((b: any) => ({
      ...b,
      media_url: `/api/banners/${b.id}/media`,
      thumbnail_url: b.thumb_mimetype ? `/api/banners/${b.id}/media?thumb=1` : null
    }))
    return NextResponse.json({ success: true, data })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const form = await req.formData()
    const media = form.get('media')
    const thumb = form.get('thumbnail')
    if (!(media instanceof File)) return NextResponse.json({ error: 'File media wajib diupload.' }, { status: 400 })
    if (!ALLOWED_MIME.includes(media.type)) return NextResponse.json({ error: `Tipe file tidak didukung: ${media.type}` }, { status: 400 })
    if (media.size > MAX_SIZE) return NextResponse.json({ error: 'Ukuran media melebihi 10MB' }, { status: 400 })
    const title = String(form.get('title') || '').trim()
    const start_date = String(form.get('start_date') || '').trim()
    const end_date = String(form.get('end_date') || '').trim()
    if (!title || !start_date || !end_date) return NextResponse.json({ error: 'title, start_date, end_date wajib diisi.' }, { status: 400 })
    const media_type = media.type.startsWith('video/') ? 'video' : 'image'
    let thumbBuffer: Buffer | null = null
    let thumbType: string | null = null
    if (thumb instanceof File && thumb.size > 0) {
      if (!ALLOWED_MIME.includes(thumb.type)) return NextResponse.json({ error: `Tipe file thumbnail tidak didukung: ${thumb.type}` }, { status: 400 })
      if (thumb.size > MAX_SIZE) return NextResponse.json({ error: 'Ukuran thumbnail melebihi 10MB' }, { status: 400 })
      thumbBuffer = Buffer.from(await thumb.arrayBuffer())
      thumbType = thumb.type
    }
    const mediaBuffer = Buffer.from(await media.arrayBuffer())
    const r = await query(`
      INSERT INTO event_banners
      (title, description, media_type, media_data, media_mimetype, media_filename, media_size,
       thumbnail_data, thumb_mimetype, alt_text, target_url, target_blank,
       start_date, end_date, priority, is_active, created_by)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id, title, media_type, media_filename, media_size, created_at
    `, [
      title,
      String(form.get('description') || '').trim() || null,
      media_type,
      mediaBuffer,
      media.type,
      media.name || `banner-${Date.now()}`,
      media.size,
      thumbBuffer,
      thumbType,
      String(form.get('alt_text') || '').trim() || null,
      String(form.get('target_url') || '').trim() || null,
      String(form.get('target_blank') || 'true') !== 'false',
      start_date,
      end_date,
      Number(form.get('priority') || 0),
      String(form.get('is_active') || 'true') !== 'false',
      user.username
    ])
    return NextResponse.json({ success: true, data: r.rows[0] }, { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
