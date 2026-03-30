import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

async function ensureTables() {
  // genres
  await query(`
    CREATE TABLE IF NOT EXISTS genres (
      id   SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      slug VARCHAR(60) NOT NULL UNIQUE
    )`, [])

  // songs — pakai user_id referencing existing users table
  await query(`
    CREATE TABLE IF NOT EXISTS songs (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER      NOT NULL,
      title        VARCHAR(200) NOT NULL,
      artist       VARCHAR(150),
      album        VARCHAR(150),
      file_url     VARCHAR(500) NOT NULL,
      cover_url    VARCHAR(500),
      duration_sec INTEGER      DEFAULT 0 CHECK (duration_sec >= 0),
      status       TEXT         NOT NULL DEFAULT 'active'
                     CHECK (status IN ('processing','active','private','deleted')),
      play_count   INTEGER      NOT NULL DEFAULT 0 CHECK (play_count >= 0),
      uploaded_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`, [])

  // song_genres junction
  await query(`
    CREATE TABLE IF NOT EXISTS song_genres (
      song_id  INTEGER NOT NULL REFERENCES songs(id)  ON DELETE CASCADE,
      genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
      PRIMARY KEY (song_id, genre_id)
    )`, [])

  // Seed default genres
  await query(`
    INSERT INTO genres (name, slug) VALUES
      ('Lo-Fi','lo-fi'),('Ambient','ambient'),('Chill','chill'),
      ('Focus','focus'),('Jazz','jazz'),('Electronic','electronic'),
      ('Acoustic','acoustic'),('Pop','pop'),('Indie','indie'),
      ('Rock','rock'),('Hip-Hop','hip-hop'),('Classical','classical')
    ON CONFLICT (slug) DO NOTHING`, [])
}

// GET — semua lagu aktif, dengan genre
export async function GET() {
  try {
    await ensureTables()
    const res = await query(`
      SELECT
        s.id, s.title, s.artist, s.album,
        s.file_url, s.cover_url, s.duration_sec, s.play_count, s.uploaded_at,
        COALESCE(
          (SELECT json_agg(json_build_object('id', g.id, 'name', g.name, 'slug', g.slug))
           FROM song_genres sg JOIN genres g ON g.id = sg.genre_id
           WHERE sg.song_id = s.id),
          '[]'::json
        ) AS genres
      FROM songs s
      WHERE s.status = 'active'
      ORDER BY s.uploaded_at DESC
    `, [])
    return NextResponse.json({ success: true, data: res.rows })
  } catch (e) {
    console.error('GET /api/music error:', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// GET genres list (for admin form)
export async function OPTIONS() {
  try {
    await ensureTables()
    const res = await query('SELECT * FROM genres ORDER BY name', [])
    return NextResponse.json({ success: true, data: res.rows })
  } catch {
    return NextResponse.json({ success: false })
  }
}

// POST — tambah lagu (admin/owner only)
export async function POST(req: NextRequest) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await verifyToken(token)
  if (!user || !['Owner', 'Admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    await ensureTables()
    const { title, artist, album, file_url, cover_url, genre_id } = await req.json()
    if (!title?.trim() || !file_url?.trim()) {
      return NextResponse.json({ error: 'Judul dan URL audio wajib diisi' }, { status: 400 })
    }

    // Insert song
    const songRes = await query(`
      INSERT INTO songs (user_id, title, artist, album, file_url, cover_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING *
    `, [user.id, title.trim(), artist?.trim() || null, album?.trim() || null, file_url.trim(), cover_url?.trim() || null])

    const song = songRes.rows[0]

    // Assign genre if provided
    if (genre_id) {
      await query(`
        INSERT INTO song_genres (song_id, genre_id) VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [song.id, genre_id]).catch(() => { })
    }

    // Fetch with genres
    const full = await query(`
      SELECT s.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', g.id, 'name', g.name))
           FROM song_genres sg JOIN genres g ON g.id = sg.genre_id
           WHERE sg.song_id = s.id),
          '[]'::json
        ) AS genres
      FROM songs s WHERE s.id = $1
    `, [song.id])

    return NextResponse.json({ success: true, data: full.rows[0] })
  } catch (e) {
    console.error('POST /api/music error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
