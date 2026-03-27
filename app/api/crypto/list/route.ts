import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    
    if (!user || user.role !== 'Owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const res = await query('SELECT * FROM crypt_data ORDER BY created_at DESC')
    return NextResponse.json({ success: true, data: res.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    
    if (!user || user.role !== 'Owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { title, encrypted_text, method } = await req.json()
    await query(
      'INSERT INTO crypt_data (title, encrypted_text, method) VALUES ($1, $2, $3)',
      [title, encrypted_text, method || 'base64']
    )
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
