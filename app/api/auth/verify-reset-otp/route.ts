import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOtpAttemptColumn, getOtpContactColumn, getOtpTypeColumn, quoteColumn } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    const { email, phone, otp } = await req.json()
    const contact = email || phone
    if (!contact || !otp) return NextResponse.json({ error: 'Kontak dan OTP wajib diisi' }, { status: 400 })

    const otpContactColumn = await getOtpContactColumn()
    const otpTypeColumn = await getOtpTypeColumn()
    const otpAttemptColumn = await getOtpAttemptColumn()
    const r = otpTypeColumn
      ? await query(`SELECT * FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND otp_code=$2 AND ${quoteColumn(otpTypeColumn)}=$3 AND is_used=false ORDER BY created_at DESC LIMIT 1`, [contact, otp, 'reset_password'])
      : await query(`SELECT * FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND otp_code=$2 AND is_used=false ORDER BY created_at DESC LIMIT 1`, [contact, otp])

    if (!r.rows.length) return NextResponse.json({ error: 'OTP tidak valid' }, { status: 400 })
    const row = r.rows[0]
    if (new Date(row.expired_at) < new Date()) return NextResponse.json({ error: 'OTP sudah kadaluarsa' }, { status: 400 })
    if (otpAttemptColumn && Number(row[otpAttemptColumn] || 0) >= 5) return NextResponse.json({ error: 'Terlalu banyak percobaan. Minta OTP baru.' }, { status: 429 })
    return NextResponse.json({ success: true, message: 'OTP valid' })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
