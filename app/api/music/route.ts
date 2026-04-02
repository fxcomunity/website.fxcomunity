import { NextRequest, NextResponse } from 'next/server'
import { query, initDB } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

import * as mm from 'music-metadata'
import { promises as fs } from 'fs'
import path from 'path'

let isDbInitialized = false

// ─── GET — semua lagu aktif beserta genre ────────────────────
export async function GET() {
  try {
    if (!isDbInitialized) {
      await initDB()
      isDbInitialized = true
    }
    const res = await query(`
      SELECT
        s.id, s.title, s.artist, s.album,
        s.file_url, s.cover_url, s.duration_sec, s.play_count,
        s.file_size, s.mime_type, s.status, s.uploaded_at,
        COALESCE(
          (SELECT json_agg(json_build_object('id', g.id, 'name', g.name, 'slug', g.slug)
                           ORDER BY g.name)
           FROM song_genres sg
           JOIN genres g ON g.id = sg.genre_id
           WHERE sg.song_id = s.id),
          '[]'::json
        ) AS genres
      FROM songs s
      WHERE s.status = 'active'
      ORDER BY s.uploaded_at DESC
    `)
    return NextResponse.json({ success: true, data: res.rows })
  } catch (e) {
    console.error('GET /api/music error:', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// ─── OPTIONS — list genres (untuk form admin) ─────────────────
export async function OPTIONS() {
  try {
    await initDB()
    const res = await query('SELECT id, name, slug FROM genres ORDER BY name')
    return NextResponse.json({ success: true, data: res.rows })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}

// ─── POST — upload lagu baru (admin/owner only) ───────────────
export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await verifyToken(token)
  if (!user || !['Owner', 'Admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await initDB() // Ensure schema is up to date before INSERT
    const formData = await req.formData()
    const file = formData.get('audioFile') as File | null
    const manualGenreIds = formData
      .getAll('genre_ids[]')
      .map(id => Number(id))
      .filter(n => !isNaN(n) && n > 0)

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No audio file uploaded.' }, { status: 400 })
    }

    // 1. Simpan file ke public/uploads/audio
    const buffer     = Buffer.from(await file.arrayBuffer())
    const suffix     = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const safeName   = `${suffix}-${file.name.replace(/\s+/g, '_')}`
    const uploadDir  = path.join(process.cwd(), 'public', 'uploads', 'audio')
    const filepath   = path.join(uploadDir, safeName)

    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(filepath, buffer)

    const fileUrl = `/uploads/audio/${safeName}`

    // 2. Parse metadata dari file audio
    let title        = path.basename(file.name, path.extname(file.name))
    let artist: string | null = null
    let album:  string | null = null
    let duration     = 0
    let coverDataUrl: string | null = null
    let detectedGenreIds: number[] = []

    try {
      const meta = await mm.parseBuffer(buffer, { mimeType: file.type })
      const { common, format } = meta

      if (common.title)  title  = common.title
      if (common.artist) artist = common.artist
      if (common.album)  album  = common.album
      duration = Math.round(format.duration || 0)

      // Embed cover art dari metadata
      if (common.picture?.length) {
        const pic = common.picture[0]
        coverDataUrl = `data:${pic.format};base64,${Buffer.from(pic.data).toString('base64')}`
      }

      // Auto-detect genre dari tag ID3
      if (common.genre?.length) {
        const genresRes   = await query('SELECT id, name FROM genres')
        const dbGenres    = genresRes.rows
        const detectedName = common.genre[0].split(';')[0].trim().toLowerCase()
        const found = dbGenres.find(g => g.name.toLowerCase() === detectedName)
        if (found) detectedGenreIds.push(found.id)
      }
    } catch (metaErr) {
      console.warn('[music] metadata parse warning (non-fatal):', metaErr)
    }

    // Merge genre IDs (detected + manual)
    const finalGenreIds = [...new Set([...detectedGenreIds, ...manualGenreIds])]

    // 3. INSERT ke tabel songs
    // Catatan: search_vector adalah GENERATED ALWAYS → jangan disertakan di INSERT
    const songRes = await query(`
      INSERT INTO songs
        (user_id, title, artist, album, file_url, cover_url, duration_sec, file_size, mime_type, status, media_data, media_mimetype, media_filename, media_size)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11, $12, $13)
      RETURNING id, title, artist, album, file_url, cover_url, duration_sec, file_size, mime_type, play_count, status, uploaded_at
    `, [
      user.id,
      title.trim(),
      artist?.trim() || null,
      album?.trim()  || null,
      fileUrl,
      coverDataUrl,
      duration,
      file.size,
      file.type || null,
      buffer, // media_data
      file.type || 'audio/mpeg', // media_mimetype
      file.name, // media_filename
      file.size, // media_size
    ])

    const song = songRes.rows[0]

    // 4. Assign genres
    if (finalGenreIds.length > 0) {
      const vals = finalGenreIds.map(id => `(${song.id}, ${id})`).join(', ')
      await query(`INSERT INTO song_genres (song_id, genre_id) VALUES ${vals} ON CONFLICT DO NOTHING`)
    }

    // 5. Fetch result lengkap dengan genres
    const full = await query(`
      SELECT
        s.id, s.title, s.artist, s.album,
        s.file_url, s.cover_url, s.duration_sec, s.play_count,
        s.file_size, s.mime_type, s.status, s.uploaded_at,
        COALESCE(
          (SELECT json_agg(json_build_object('id', g.id, 'name', g.name, 'slug', g.slug))
           FROM song_genres sg JOIN genres g ON g.id = sg.genre_id
           WHERE sg.song_id = s.id),
          '[]'::json
        ) AS genres
      FROM songs s
      WHERE s.id = $1
    `, [song.id])

    return NextResponse.json({ success: true, data: full.rows[0] })

  } catch (e: any) {
    console.error('POST /api/music error:', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
