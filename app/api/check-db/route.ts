import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const allBanners = await query('SELECT * FROM event_banners');
  const activeBanners = await query('SELECT * FROM vw_active_banners');
  return NextResponse.json({ all: allBanners.rows, active: activeBanners.rows });
}
