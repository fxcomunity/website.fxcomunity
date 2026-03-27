
const { Pool } = require('pg');
const fs = require('fs');

async function listUsers() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const dbUrlMatch = env.match(/DATABASE_URL=(.*)/);
  if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env.local');
    return;
  }
  const connectionString = dbUrlMatch[1].trim();

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT id, username, email FROM users LIMIT 10');
    console.log('Users found:', res.rows);
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await pool.end();
  }
}

listUsers();
