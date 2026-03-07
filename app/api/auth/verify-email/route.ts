import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOtpContactColumn, getOtpTypeColumn, quoteColumn } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return NextResponse.json({ error: 'Email dan OTP wajib diisi' }, { status: 400 })
    
    const otpContactColumn = await getOtpContactColumn()
    const otpTypeColumn = await getOtpTypeColumn()
    const r = otpTypeColumn
      ? await query(`SELECT * FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND otp_code=$2 AND ${quoteColumn(otpTypeColumn)}=$3 AND is_used=false ORDER BY created_at DESC LIMIT 1`, [email, otp, 'email_verification'])
      : await query(`SELECT * FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND otp_code=$2 AND is_used=false ORDER BY created_at DESC LIMIT 1`, [email, otp])
    if (!r.rows.length) return NextResponse.json({ error: 'Kode OTP tidak valid' }, { status: 400 })
    
    const rec = r.rows[0]
    
    // Cek jumlah percobaan
    if (rec.attempt >= 5) return NextResponse.json({ error: 'Terlalu banyak percobaan. Minta OTP baru.' }, { status: 400 })
    
    // Cek apakah OTP sudah kadaluarsa
    if (new Date() > new Date(rec.expired_at)) {
      await query('UPDATE otp_resets SET attempt=attempt+1 WHERE id=$1', [rec.id])
      return NextResponse.json({ error: 'OTP sudah kadaluarsa. Minta kode baru.' }, { status: 400 })
    }
    
    // Verifikasi email user
    const userCheck = await query('SELECT id FROM users WHERE email=$1', [email])
    if (!userCheck.rows.length) return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 400 })
    
    // Update email_verified menjadi true
    await query('UPDATE users SET email_verified=true WHERE email=$1', [email])
    
    // Mark OTP as used
    await query('UPDATE otp_resets SET is_used=true WHERE id=$1', [rec.id])
    
    return NextResponse.json({ success: true, message: 'Email berhasil diverifikasi! Anda sekarang bisa login.' })
  } catch (e) { 
    console.error(e); 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) 
  }
}
