import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const res = await query('SELECT * FROM genres ORDER BY name', [])
    return NextResponse.json({ success: true, data: res.rows })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}
