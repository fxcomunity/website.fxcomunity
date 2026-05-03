import { Pool } from 'pg'

let connectionString = process.env.DATABASE_URL
if (connectionString && connectionString.includes('sslmode=require')) {
  connectionString = connectionString.replace('sslmode=require', 'sslmode=verify-full')
}

const shouldUseSSL = Boolean(
  process.env.DATABASE_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  (connectionString && connectionString.includes('neon'))
)

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export async function query(text: string, params?: any[]) {
  try {
    return await pool.query(text, params)
  } catch (err: any) {
    console.error('Database query error:', err.message)
    throw err
  }
}

export async function logActivity(
  userId: number | null,
  action: string,
  targetType?: string,
  targetId?: string | number,
  details?: string,
  req?: Request
) {
  try {
    const ip = req ? (req.headers.get('x-forwarded-for') || '127.0.0.1') : null
    const ua = req ? req.headers.get('user-agent') : null
    
    await query(`
      INSERT INTO activity_logs (user_id, action, target_type, target_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, targetType, targetId?.toString(), details, ip, ua])
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

let initPromise: Promise<void> | null = null;

export function initDB() {
  if (!initPromise) {
    initPromise = doInitDB().catch(e => {
      initPromise = null;
      throw e;
    });
  }
  return initPromise;
}

async function doInitDB() {
  await query(`CREATE TABLE IF NOT EXISTS banned_ips (
    ip_address VARCHAR(50) PRIMARY KEY,
    failed_attempts INTEGER DEFAULT 0,
    banned_until TIMESTAMP,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'User' CHECK (role IN ('Owner','Admin','User')),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif','Tidak Aktif','Banned')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(50)`)
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(50)`)
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)`)
  
  // Update status constraint to include 'Banned'
  await query(`
    DO $$ 
    BEGIN 
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
      ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('Aktif','Tidak Aktif','Banned'));
    EXCEPTION 
      WHEN others THEN NULL; 
    END $$;
  `)
  // Ensure username is unique and not null if we just added it
  // This might be tricky if there's already data, but let's try to make it at least exist.
  // We can't easily add UNIQUE NOT NULL to existing column without data handling,
  // but for now let's just make sure the column exists to stop the 500 errors.

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

  // Create table for admin access codes (Temporary Access)
  await query(`CREATE TABLE IF NOT EXISTS admin_access_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    target_tool VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_by INTEGER REFERENCES users(id),
    used_by INTEGER REFERENCES users(id),
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`)

  await query(`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`)

  // Create table for activity logs (Security Auditing)
  await query(`CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`)

  // Music Tables
  await query(`CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
  )`)

  await query(`CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    album VARCHAR(255),
    file_url TEXT NOT NULL,
    cover_url TEXT,
    duration_sec INTEGER DEFAULT 0,
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    play_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    media_data BYTEA,
    media_mimetype VARCHAR(100),
    media_filename VARCHAR(255),
    media_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT NOW()
  )`)

  await query(`CREATE TABLE IF NOT EXISTS song_genres (
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (song_id, genre_id)
  )`)

  await query(`
    CREATE OR REPLACE FUNCTION fn_set_banner_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)
  await query(`
    CREATE OR REPLACE TRIGGER trg_banner_updated_at
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
}
