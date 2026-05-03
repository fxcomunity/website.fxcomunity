import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'Owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Owner only.' }, { status: 403 })
    }

    const { rows } = await query(`
      SELECT ip_address, failed_attempts, banned_until, is_permanent, created_at, updated_at
      FROM banned_ips
      ORDER BY updated_at DESC
    `)

    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error('Error fetching banned IPs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'Owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Owner only.' }, { status: 403 })
    }

    const { ip } = await req.json()
    
    if (!ip) {
      return NextResponse.json({ success: false, error: 'IP address required' }, { status: 400 })
    }

    await query(`DELETE FROM banned_ips WHERE ip_address = $1`, [ip])

    return NextResponse.json({ success: true, message: 'IP berhasil dibuka blokirnya.' })
  } catch (error: any) {
    console.error('Error unbanning IP:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
