import { NextRequest, NextResponse } from 'next/server'
import { query, initDB } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Kolom yang aman di-SELECT (search_vector adalah GENERATED ALWAYS — skip di SELECT *)
const SONG_COLS = `
  s.id, s.title, s.artist, s.album,
  s.file_url, s.cover_url, s.duration_sec, s.play_count,
  s.file_size, s.mime_type, s.status, s.uploaded_at
`

const GENRES_AGG = `
  COALESCE(
    (SELECT json_agg(json_build_object('id', g.id, 'name', g.name, 'slug', g.slug))
     FROM song_genres sg JOIN genres g ON g.id = sg.genre_id
     WHERE sg.song_id = s.id),
    '[]'::json
  ) AS genres
`

// ─── GET — detail lagu tunggal ────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB()
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const res = await query(`
      SELECT ${SONG_COLS}, ${GENRES_AGG}
      FROM songs s WHERE s.id = $1
    `, [id])

    if (!res.rows[0]) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: res.rows[0] })
  } catch (e) {
    const { id: idStr } = await params
    console.error(`GET /api/music/${idStr} error:`, e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// ─── PATCH — increment play_count ────────────────────────────
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDB()
    const { id: idStr } = await params
    const id = parseInt(idStr)
    await query(`
      UPDATE songs SET play_count = play_count + 1 WHERE id = $1
    `, [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    const { id: idStr } = await params
    console.error(`PATCH /api/music/${idStr} error:`, e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// ─── PUT — edit metadata lagu (admin/owner only) ──────────────
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await verifyToken(token)
  if (!user || !['Owner', 'Admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await initDB()
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const { title, artist, album, file_url, cover_url, genre_ids } = await req.json()

    if (!title?.trim() || !file_url?.trim()) {
      return NextResponse.json({ error: 'Title and File URL are required' }, { status: 400 })
    }

    // Update song — jangan sentuh search_vector (GENERATED ALWAYS)
    const songRes = await query(`
      UPDATE songs
      SET title     = $1,
          artist    = $2,
          album     = $3,
          file_url  = $4,
          cover_url = $5
      WHERE id = $6
      RETURNING id
    `, [
      title.trim(),
      artist?.trim() || null,
      album?.trim()  || null,
      file_url.trim(),
      cover_url?.trim() || null,
      id,
    ])

    if ((songRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }

    // Update genres — hapus lama lalu insert baru
    await query('DELETE FROM song_genres WHERE song_id = $1', [id])
    if (Array.isArray(genre_ids) && genre_ids.length > 0) {
      const vals = genre_ids
        .map((gid: unknown) => parseInt(String(gid)))
        .filter(n => !isNaN(n) && n > 0)
        .map(gid => `(${id}, ${gid})`)
        .join(', ')
      if (vals) {
        await query(`INSERT INTO song_genres (song_id, genre_id) VALUES ${vals} ON CONFLICT DO NOTHING`)
      }
    }

    // Kembalikan data lengkap
    const full = await query(`
      SELECT ${SONG_COLS}, ${GENRES_AGG}
      FROM songs s WHERE s.id = $1
    `, [id])

    return NextResponse.json({ success: true, data: full.rows[0] })
  } catch (e) {
    const { id: idStr } = await params
    console.error(`PUT /api/music/${idStr} error:`, e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// ─── DELETE — hapus lagu (admin/owner only) ───────────────────
// song_genres akan terhapus otomatis oleh ON DELETE CASCADE
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await verifyToken(token)
  if (!user || !['Owner', 'Admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await initDB()
    const { id: idStr } = await params
    const id = parseInt(idStr)
    // CASCADE di schema: song_genres + playlist_songs terhapus otomatis
    const res = await query('DELETE FROM songs WHERE id = $1', [id])

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ success: false, error: 'Song not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Song deleted' })
  } catch (e) {
    const { id: idStr } = await params
    console.error(`DELETE /api/music/${idStr} error:`, e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
