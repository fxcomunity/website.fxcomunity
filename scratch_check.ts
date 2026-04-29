import { query } from './lib/db';

async function run() {
  console.log("Connected to DB");
  
  const res1 = await query('SELECT id, title, start_date, end_date, is_active FROM event_banners');
  console.log("ALL BANNERS:", res1.rows);
  
  const res2 = await query('SELECT id, title FROM vw_active_banners');
  console.log("ACTIVE BANNERS:", res2.rows);
}

run().catch(console.error);
