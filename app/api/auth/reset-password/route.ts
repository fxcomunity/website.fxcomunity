import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { getOtpAttemptColumn, getOtpContactColumn, getOtpTypeColumn, quoteColumn } from '@/lib/otp'
export async function POST(req: NextRequest) {
  try {
    const { email, phone, otp, password } = await req.json()
    const contact = email || phone
    if (!contact || !otp || !password) return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    
    // Cari user berdasarkan email atau phone
    const userQuery = email ? 'SELECT * FROM users WHERE email=$1' : 'SELECT * FROM users WHERE phone_number=$1'
    const userRes = await query(userQuery, [contact])
    if (!userRes.rows.length) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 400 })
    
    const otpContactColumn = await getOtpContactColumn()
    const otpTypeColumn = await getOtpTypeColumn()
    const otpAttemptColumn = await getOtpAttemptColumn()
    const r = otpTypeColumn
      ? await query(`SELECT * FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND otp_code=$2 AND ${quoteColumn(otpTypeColumn)}=$3 AND is_used=false ORDER BY created_at DESC LIMIT 1`, [contact, otp, 'reset_password'])
      : await query(`SELECT * FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND otp_code=$2 AND is_used=false ORDER BY created_at DESC LIMIT 1`, [contact, otp])
    if (!r.rows.length) return NextResponse.json({ error: 'Kode OTP tidak valid' }, { status: 400 })
    const rec = r.rows[0]
    if (otpAttemptColumn && Number(rec[otpAttemptColumn] || 0) >= 5) return NextResponse.json({ error: 'Terlalu banyak percobaan. Minta OTP baru.' }, { status: 400 })
    if (new Date() > new Date(rec.expired_at)) {
      if (otpAttemptColumn) await query(`UPDATE otp_resets SET ${quoteColumn(otpAttemptColumn)}=${quoteColumn(otpAttemptColumn)}+1 WHERE id=$1`, [rec.id])
      return NextResponse.json({ error: 'OTP sudah kadaluarsa. Minta kode baru.' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 12)
    await query('UPDATE users SET password=$1 WHERE email=$2', [hashed, userRes.rows[0].email])
    await query('UPDATE otp_resets SET is_used=true WHERE id=$1', [rec.id])
    return NextResponse.json({ success: true, message: 'Password berhasil direset! Silakan login.' })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
