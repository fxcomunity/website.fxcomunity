import { NextRequest, NextResponse } from 'next/server'
import { query, logActivity } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || !['Owner', 'Admin'].includes(auth.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }

    const { code, target_tool } = await req.json()
    
    if (!code || !target_tool) {
      return NextResponse.json({ success: false, error: 'code and target_tool required' }, { status: 400 })
    }

    // Cek kode di database
    const { rows } = await query(`
      SELECT * FROM admin_access_codes 
      WHERE code = $1 AND target_tool = $2
    `, [code, target_tool])

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Kode Akses tidak valid.' }, { status: 400 })
    }

    const accessCode = rows[0]

    // Cek apakah sudah expired
    if (new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Kode Akses sudah kedaluwarsa.' }, { status: 400 })
    }

    // Cek apakah sudah pernah digunakan oleh user lain? (opsional, jika kodenya single-use per admin)
    // Untuk sekarang kita biarkan bisa dipakai berkali-kali selama belum expired,
    // atau jika user ingin kodenya hangus setelah dipakai sekali, kita bisa tandai is_used = true.
    // Tapi karena ini sifatnya "pass/tiket" dengan durasi, lebih baik kita tidak batasi "is_used" kecuali diinginkan.
    // Kita tandai saja siapa yang pakai terakhir kali:
    await query(`
      UPDATE admin_access_codes 
      SET used_by = $1, is_used = true
      WHERE id = $2
    `, [auth.id, accessCode.id])

    await logActivity(auth.id, 'VERIFY_ACCESS_CODE', 'admin_access_codes', accessCode.id, `Tool: ${target_tool}`, req)

    // Buat response success
    const res = NextResponse.json({ success: true, message: 'Akses diberikan' })
    
    // Hitung maxAge dalam detik (selisih expires_at dengan sekarang)
    const maxAgeSeconds = Math.floor((new Date(accessCode.expires_at).getTime() - new Date().getTime()) / 1000)

    // Set cookie spesifik untuk tool ini
    res.cookies.set(`access_${target_tool}`, code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgeSeconds,
      path: '/'
    })

    return res
  } catch (error: any) {
    console.error('Error verifying access code:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
