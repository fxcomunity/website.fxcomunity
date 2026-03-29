const { Pool } = require('pg');

// Read from .env.local
require('fs').readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const res = await pool.query('SELECT user_id, email, ip_address, status, keterangan, created_at FROM login_logs ORDER BY created_at DESC LIMIT 5');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

main().catch(console.error);
