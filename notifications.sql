-- Schema SQL Neon PostgreSQL untuk Tabel Notifications
-- Copy-paste langsung ke Neon Console atau pgAdmin

-- Tabel utama notifications (sudah ada di lib/db.ts)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_time ON notifications (user_id, created_at DESC);

-- View untuk unread notifications per user
CREATE OR REPLACE VIEW vw_user_notifications AS
SELECT 
  n.id, n.user_id, n.title, n.message, n.type, n.is_read, n.created_at,
  CASE 
    WHEN n.is_read = false THEN 'UNREAD'
    ELSE 'READ'
  END as status
FROM notifications n
WHERE n.user_id IS NOT NULL
UNION ALL
SELECT 
  n.id, NULL as user_id, n.title, n.message, n.type, n.is_read, n.created_at,
  CASE 
    WHEN n.is_read = false THEN 'UNREAD'
    ELSE 'READ'
  END as status
FROM notifications n
WHERE n.user_id IS NULL;

-- Function untuk kirim global notification
CREATE OR REPLACE FUNCTION send_global_notification(
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (p_title, p_message, p_type, NULL);
END;
$$ LANGUAGE plpgsql;

-- Function untuk kirim personal notification
CREATE OR REPLACE FUNCTION send_user_notification(
  p_user_id INTEGER,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (p_title, p_message, p_type, p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto mark read setelah 30 hari
CREATE OR REPLACE FUNCTION mark_old_notifications_read()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE notifications 
  SET is_read = true 
  WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = false;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Jalankan setiap hari (schedule di Neon atau cron job)
-- SELECT mark_old_notifications_read();

-- Contoh penggunaan:
-- SELECT send_global_notification('Server Maintenance', 'Maintenance malam ini jam 22:00 WIB', 'warning');
-- SELECT send_user_notification(123, 'PDF Baru', 'PDF favorit Anda sudah tersedia', 'info');

-- Query untuk test data:
-- SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
-- SELECT COUNT(*) as unread FROM notifications WHERE is_read = false AND (user_id = 123 OR user_id IS NULL);
