import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
const MAX_SIZE = 10 * 1024 * 1024

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const params = await context.params
    const id = params?.id
    await query('DELETE FROM event_banners WHERE id=$1', [id])
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (!user || !['Owner', 'Admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    
    const params = await context.params
    const id = params?.id
    
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const title = String(form.get('title') || '').trim()
      const start_date = String(form.get('start_date') || '').trim()
      const end_date = String(form.get('end_date') || '').trim()
      const description = String(form.get('description') || '').trim() || null
      const alt_text = String(form.get('alt_text') || '').trim() || null
      const target_url = String(form.get('target_url') || '').trim() || null
      const target_blank = String(form.get('target_blank') || 'true') !== 'false'
      const priority = Number(form.get('priority') || 0)
      const is_active = String(form.get('is_active') || 'true') !== 'false'

      const media = form.get('media')
      
      if (media instanceof File && media.size > 0) {
        if (!ALLOWED_MIME.includes(media.type)) return NextResponse.json({ error: `Tipe file tidak didukung: ${media.type}` }, { status: 400 })
        if (media.size > MAX_SIZE) return NextResponse.json({ error: 'Ukuran media melebihi 10MB' }, { status: 400 })
        
        const media_type = media.type.startsWith('video/') ? 'video' : 'image'
        const mediaBuffer = Buffer.from(await media.arrayBuffer())
        
        await query(`
          UPDATE event_banners 
          SET title=$1, description=$2, alt_text=$3, target_url=$4, target_blank=$5, 
              start_date=$6, end_date=$7, priority=$8, is_active=$9, updated_at=NOW(),
              media_type=$10, media_data=$11, media_mimetype=$12, media_filename=$13, media_size=$14
          WHERE id=$15
        `, [
          title, description, alt_text, target_url, target_blank, 
          start_date, end_date, priority, is_active,
          media_type, mediaBuffer, media.type, media.name, media.size, id
        ])
      } else {
        await query(`
          UPDATE event_banners 
          SET title=$1, description=$2, alt_text=$3, target_url=$4, target_blank=$5, 
              start_date=$6, end_date=$7, priority=$8, is_active=$9, updated_at=NOW()
          WHERE id=$10
        `, [
          title, description, alt_text, target_url, target_blank, 
          start_date, end_date, priority, is_active, id
        ])
      }
      return NextResponse.json({ success: true })
    } else {
      const body = await req.json()
      const { title, description, alt_text, target_url, target_blank, start_date, end_date, priority, is_active } = body
      await query(`
        UPDATE event_banners 
        SET title=$1, description=$2, alt_text=$3, target_url=$4, target_blank=$5, 
            start_date=$6, end_date=$7, priority=$8, is_active=$9, updated_at=NOW()
        WHERE id=$10
      `, [
        title, description, alt_text, target_url, target_blank, 
        start_date, end_date, priority, is_active, id
      ])
      return NextResponse.json({ success: true })
    }
  } catch (e) { 
    console.error('Banner update error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) 
  }
}
