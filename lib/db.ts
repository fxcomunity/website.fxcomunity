import { Pool } from 'pg'

const shouldUseSSL = Boolean(
  process.env.DATABASE_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon'))
)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : false,
  max: 10,
  connectionTimeoutMillis: 15000, // Wait 15s for connection
  idleTimeoutMillis: 30000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try { return await client.query(text, params) }
  finally { client.release() }
}

export async function initDB() {
  await query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'User' CHECK (role IN ('Owner','Admin','User')),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif','Tidak Aktif')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255), ip_address VARCHAR(50),
    status VARCHAR(20), keterangan TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS pdfs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'fx-basic',
    thumbnail VARCHAR(10) DEFAULT '📄',
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS otp_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_type VARCHAR(20) NOT NULL DEFAULT 'reset_password' CHECK (otp_type IN ('reset_password','email_verification')),
    expired_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    attempt INTEGER DEFAULT 0,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pdf_id INTEGER REFERENCES pdfs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, pdf_id)
  )`)
  await query(`CREATE TABLE IF NOT EXISTS user_downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pdf_id INTEGER REFERENCES pdfs(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS admin_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    requested_role VARCHAR(20) NOT NULL DEFAULT 'Admin' CHECK (requested_role IN ('Admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
    owner_note TEXT,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`INSERT INTO settings (key, value) VALUES ('maintenance_mode', 'false') ON CONFLICT (key) DO NOTHING`)
  await query(`CREATE TABLE IF NOT EXISTS event_banners (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    media_type VARCHAR(10) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
    media_url VARCHAR(500) NULL,
    media_data BYTEA NULL,
    media_mimetype VARCHAR(100) NULL,
    media_filename VARCHAR(255) NULL,
    media_size INT NULL,
    thumbnail_url VARCHAR(500) NULL,
    thumbnail_data BYTEA NULL,
    thumb_mimetype VARCHAR(100) NULL,
    alt_text VARCHAR(255) NULL,
    target_url VARCHAR(500) NULL,
    target_blank BOOLEAN NOT NULL DEFAULT TRUE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    CONSTRAINT chk_banner_dates CHECK (end_date > start_date)
  )`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS media_data BYTEA NULL`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS media_mimetype VARCHAR(100) NULL`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS media_filename VARCHAR(255) NULL`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS media_size INT NULL`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS media_url VARCHAR(500) NULL`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500) NULL`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS thumbnail_data BYTEA NULL`)
  await query(`ALTER TABLE event_banners ADD COLUMN IF NOT EXISTS thumb_mimetype VARCHAR(100) NULL`)
  await query(`ALTER TABLE event_banners ALTER COLUMN media_url DROP NOT NULL`)
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_media_size'
      ) THEN
        ALTER TABLE event_banners
        ADD CONSTRAINT chk_media_size CHECK (media_size IS NULL OR media_size <= 10485760);
      END IF;
    END
    $$;
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_banner_active_schedule ON event_banners (is_active, start_date, end_date, priority DESC)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_banner_media_type ON event_banners (media_type)`)
  await query(`
    CREATE OR REPLACE FUNCTION fn_set_banner_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)
  await query(`DROP TRIGGER IF EXISTS trg_banner_updated_at ON event_banners`)
  await query(`
    CREATE TRIGGER trg_banner_updated_at
    BEFORE UPDATE ON event_banners
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_banner_updated_at()
  `)
  await query(`DROP VIEW IF EXISTS vw_active_banners`)
  await query(`
    CREATE OR REPLACE VIEW vw_active_banners AS
    SELECT 
      id, title, description, media_type,
      media_mimetype, media_filename, media_size, thumb_mimetype, alt_text,
      COALESCE(media_url, '/api/banners/' || id || '/media') AS media_url,
      COALESCE(thumbnail_url, CASE WHEN thumbnail_data IS NOT NULL THEN '/api/banners/' || id || '/media?thumb=1' ELSE NULL END) AS thumbnail_url,
      target_url, target_blank, start_date, end_date, priority
    FROM event_banners
    WHERE is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()
    ORDER BY priority DESC, created_at DESC
  `)
  const bcount = await query(`SELECT COUNT(*)::int AS total FROM event_banners`)
  if ((bcount.rows[0]?.total || 0) === 0) {
    await query(`
      INSERT INTO event_banners
        (title, description, media_type, media_url, media_data, media_mimetype, media_filename, media_size, thumbnail_url, alt_text,
         target_url, target_blank, start_date, end_date, priority, is_active, created_by)
      VALUES
      (
        'Promo Lebaran 2025',
        'Diskon hingga 50% untuk semua produk',
        'image',
        'https://cdn.example.com/banners/lebaran-2025.jpg',
        decode('', 'hex'),
        'image/jpeg',
        'lebaran-2025.jpg',
        0,
        NULL,
        'Banner promo Lebaran 2025',
        'https://example.com/promo/lebaran',
        TRUE,
        '2025-03-20 00:00:00+07',
        '2025-04-10 23:59:59+07',
        10,
        TRUE,
        'admin'
      ),
      (
        'Video Launching Produk Baru',
        NULL,
        'video',
        'https://cdn.example.com/banners/launch-video.mp4',
        decode('', 'hex'),
        'video/mp4',
        'launch-video.mp4',
        0,
        'https://cdn.example.com/banners/launch-thumb.jpg',
        'Video peluncuran produk baru',
        'https://example.com/produk-baru',
        TRUE,
        '2025-03-25 00:00:00+07',
        '2025-04-15 23:59:59+07',
        20,
        TRUE,
        'admin'
      )
    `)
  }
  await query(`
    UPDATE event_banners
    SET start_date = NOW() - INTERVAL '1 day',
        end_date   = NOW() + INTERVAL '30 day',
        is_active  = TRUE
    WHERE title IN ('Promo Lebaran 2025','Video Launching Produk Baru')
      AND end_date < NOW()
  `)
  const activeCount = await query(`
    SELECT COUNT(*)::int AS total
    FROM event_banners
    WHERE is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()
  `)
  if ((activeCount.rows[0]?.total || 0) === 0) {
    await query(`
      INSERT INTO event_banners
        (title, description, media_type, media_url, media_data, media_mimetype, media_filename, media_size, alt_text, target_url, target_blank, start_date, end_date, priority, is_active, created_by)
      VALUES
        ('Welcome Banner', 'Banner aktif default', 'image', 'https://cdn.example.com/banners/lebaran-2025.jpg', decode('', 'hex'), 'image/jpeg', 'welcome.jpg', 0, 'Welcome Banner', NULL, TRUE, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 day', 1, TRUE, 'system')
    `)
  }
  await query(`CREATE TABLE IF NOT EXISTS crypt_data (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    encrypted_text TEXT NOT NULL,
    method VARCHAR(50) DEFAULT 'base64',
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`)

  // ─── SOUNDVAULT MUSIC SCHEMA ───────────────────────────────

  // Genres
  await query(`CREATE TABLE IF NOT EXISTS genres (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50)  NOT NULL UNIQUE,
    slug VARCHAR(60)  NOT NULL UNIQUE
  )`)

  // Songs — dengan search_vector GENERATED ALWAYS
  await query(`CREATE TABLE IF NOT EXISTS songs (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    title        VARCHAR(200) NOT NULL,
    artist       VARCHAR(150),
    album        VARCHAR(150),
    file_url     VARCHAR(500) NOT NULL,
    media_data   BYTEA        NULL,
    media_mimetype VARCHAR(100) NULL,
    media_filename VARCHAR(255) NULL,
    media_size   BIGINT       NULL,
    cover_url    VARCHAR(500),
    duration_sec INTEGER      DEFAULT 0 CHECK (duration_sec >= 0),
    file_size    BIGINT       DEFAULT 0 CHECK (file_size >= 0),
    mime_type    VARCHAR(50),
    status       TEXT         NOT NULL DEFAULT 'active'
                   CHECK (status IN ('processing', 'active', 'private', 'deleted')),
    play_count   INTEGER      NOT NULL DEFAULT 0 CHECK (play_count >= 0),
    uploaded_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`)

  // Tambah search_vector jika belum ada (Neon supports GENERATED ALWAYS)
  await query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'songs' AND column_name = 'search_vector'
        AND table_schema = 'public'
      ) THEN
        ALTER TABLE songs ADD COLUMN search_vector TSVECTOR
          GENERATED ALWAYS AS (
            to_tsvector('english',
              COALESCE(title,  '') || ' ' ||
              COALESCE(artist, '') || ' ' ||
              COALESCE(album,  '')
            )
          ) STORED;
      END IF;
    END $$;
  `)

  // Migrate: tambah kolom yang mungkin belum ada
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS mime_type VARCHAR(50)`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS duration_sec INTEGER DEFAULT 0`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS media_data BYTEA NULL`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS media_mimetype VARCHAR(100) NULL`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS media_filename VARCHAR(255) NULL`)
  await query(`ALTER TABLE songs ADD COLUMN IF NOT EXISTS media_size BIGINT NULL`)

  // Indexes
  await query(`CREATE INDEX IF NOT EXISTS idx_songs_user_id  ON songs(user_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_songs_status   ON songs(status)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_songs_uploaded ON songs(uploaded_at DESC)`)
  await query(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'songs' AND column_name = 'search_vector'
        AND table_schema = 'public'
      ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_songs_fts ON songs USING GIN(search_vector)';
      END IF;
    END $$;
  `)

  // Song genres
  await query(`CREATE TABLE IF NOT EXISTS song_genres (
    song_id  INTEGER NOT NULL REFERENCES songs(id)  ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (song_id, genre_id)
  )`)

  // Playlists
  await query(`CREATE TABLE IF NOT EXISTS playlists (
    id         SERIAL       PRIMARY KEY,
    user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    is_public  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id)`)

  // Playlist songs
  await query(`CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER     NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id     INTEGER     NOT NULL REFERENCES songs(id)     ON DELETE CASCADE,
    position    SMALLINT    NOT NULL DEFAULT 0,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (playlist_id, song_id)
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_ps_position ON playlist_songs(playlist_id, position)`)

  // Auto-update updated_at trigger
  await query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql
  `)
  await query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_playlists_updated'
      ) THEN
        CREATE TRIGGER trg_playlists_updated
          BEFORE UPDATE ON playlists
          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      END IF;
    END $$;
  `)

  // Seed genres (ONLY if table is empty to allow manual SQL changes)
  const genreCount = await query(`SELECT COUNT(*) FROM genres`)
  if (parseInt(genreCount.rows[0].count) === 0) {
    await query(`
      INSERT INTO genres (name, slug) VALUES
        ('Pop',        'pop'),
        ('Rock',       'rock'),
        ('Hip-Hop',    'hip-hop'),
        ('R&B',        'rnb'),
        ('Jazz',       'jazz'),
        ('Classical',  'classical'),
        ('Electronic', 'electronic'),
        ('Indie',      'indie'),
        ('Metal',      'metal'),
        ('Lo-Fi',      'lo-fi'),
        ('Dangdut',    'dangdut'),
        ('Campursari', 'campursari'),
        ('Keroncong',  'keroncong'),
        ('Gambus',     'gambus'),
        ('Tarling',    'tarling'),
        ('DJ',         'dj'),
        ('Daerah',     'daerah')
    `)
  }
}
