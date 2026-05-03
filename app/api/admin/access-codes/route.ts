import { NextRequest, NextResponse } from 'next/server'
import { query, logActivity } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

function generateRandomCode(length: number = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'Owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Owner only.' }, { status: 403 })
    }

    const { rows } = await query(`
      SELECT a.*, 
             u.username as creator_name, 
             u2.username as used_by_name
      FROM admin_access_codes a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN users u2 ON a.used_by = u2.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `)

    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error('Error fetching access codes:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'Owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Owner only.' }, { status: 403 })
    }

    const { target_tool, duration_hours } = await req.json()
    
    if (!target_tool || !duration_hours) {
      return NextResponse.json({ success: false, error: 'target_tool and duration_hours required' }, { status: 400 })
    }

    const code = generateRandomCode(12) // 12 karakter alphanumeric
    
    // Hitung waktu expired
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + parseInt(duration_hours))

    const { rows } = await query(`
      INSERT INTO admin_access_codes (code, target_tool, expires_at, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [code, target_tool, expiresAt, auth.id])

    await logActivity(auth.id, 'GENERATE_ACCESS_CODE', 'admin_access_codes', rows[0].id, `Target: ${target_tool}`, req)

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error: any) {
    console.error('Error generating access code:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
