import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendOTP, sendWhatsAppOTP } from '@/lib/mail'
import { getOtpContactColumn, getOtpTypeColumn, quoteColumn } from '@/lib/otp'

const getIP = (req: NextRequest) => req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  try {
    const { email, phone, type = 'reset_password', method = 'email' } = await req.json()
    const channel = method === 'whatsapp' || method === 'phone' ? 'whatsapp' : 'email'
    const normalizedPhone = String(phone || '').replace(/\s+/g, '')

    // Validate input based on method
    if (channel === 'email' && !email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    if (channel === 'whatsapp' && !normalizedPhone) return NextResponse.json({ error: 'Nomor WhatsApp wajib diisi' }, { status: 400 })
    if (!['reset_password', 'email_verification'].includes(type)) {
      return NextResponse.json({ error: 'Tipe OTP tidak valid' }, { status: 400 })
    }

    // Find user by email or phone
    let user = null
    let contact = ''
    if (channel === 'email') {
      user = await query('SELECT id,username,email FROM users WHERE email=$1', [email])
      contact = String(email || '').trim()
    } else {
      user = await query('SELECT id,username,email,phone_number FROM users WHERE phone_number=$1', [normalizedPhone])
      contact = normalizedPhone
    }

    const otpContactColumn = await getOtpContactColumn()
    const otpTypeColumn = await getOtpTypeColumn()
    const recent = otpTypeColumn
      ? await query(`SELECT COUNT(*) cnt FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND ${quoteColumn(otpTypeColumn)}=$2 AND created_at > NOW()-INTERVAL '15 minutes'`, [contact, type])
      : await query(`SELECT COUNT(*) cnt FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND created_at > NOW()-INTERVAL '15 minutes'`, [contact])
    if (parseInt(recent.rows[0].cnt) >= 3) return NextResponse.json({ error: 'Terlalu banyak permintaan. Tunggu 15 menit.' }, { status: 429 })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const exp = new Date(Date.now() + (type === 'reset_password' ? 5 : 24) * 60 * 1000) // 5 menit untuk reset, 24 jam untuk verifikasi
    if (otpTypeColumn) {
      await query(`INSERT INTO otp_resets (${quoteColumn(otpContactColumn)},otp_code,${quoteColumn(otpTypeColumn)},expired_at,ip_address) VALUES ($1,$2,$3,$4,$5)`, [contact, otp, type, exp, ip])
    } else {
      await query(`INSERT INTO otp_resets (${quoteColumn(otpContactColumn)},otp_code,expired_at,ip_address) VALUES ($1,$2,$3,$4)`, [contact, otp, exp, ip])
    }

    // Always return success to prevent enumeration
    // But actually try to send the OTP if user exists
    if (user?.rows?.length) {
      try {
        if (channel === 'email') {
          await sendOTP(contact, otp, user.rows[0].username, type)
          console.log(`[OTP-${type.toUpperCase()}] Email sent to ${contact}`)
        } else {
          await sendWhatsAppOTP(user.rows[0].phone_number || contact, otp, user.rows[0].username)
          console.log(`[OTP-${type.toUpperCase()}] WhatsApp sent to ${contact}`)
        }
      } catch (error) {
        // Log the error but don't expose to user
        console.error(`[OTP-${type.toUpperCase()}] Failed to send to ${contact}:`, error)
      }
    }

    return NextResponse.json({ success: true, message: `Kode OTP ${type === 'reset_password' ? 'reset password' : 'verifikasi email'} dikirim ke ${channel === 'email' ? 'email' : 'WhatsApp'} kamu` })
  } catch (e) {
    console.error('[OTP] Error:', e);
    return NextResponse.json({ error: 'Gagal kirim OTP' }, { status: 500 })
  }
}
