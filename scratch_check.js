const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Connected to DB");
  
  const res1 = await client.query('SELECT id, title, start_date, end_date, is_active FROM event_banners');
  console.log("ALL BANNERS:", res1.rows);
  
  const res2 = await client.query('SELECT id, title FROM vw_active_banners');
  console.log("ACTIVE BANNERS:", res2.rows);

  await client.end();
}

run().catch(console.error);
