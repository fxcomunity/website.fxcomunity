import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendOTP, sendWhatsAppOTP } from '@/lib/mail'
import { getOtpContactColumn, getOtpTypeColumn, quoteColumn } from '@/lib/otp'
import { checkRateLimit } from '@/lib/rate-limit'

// Validasi email dengan regex
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validasi nomor telepon
const validatePhone = (phone: string): boolean => {
  // Hanya angka, minimal 10 digit
  const phoneRegex = /^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Sanitasi input
const sanitizeInput = (input: string): string => {
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim()
}

const getIP = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '127.0.0.1'
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  
  try {
    // ========== RATE LIMITING (Proteksi DDOS) ==========
    const rateLimitResult = checkRateLimit(ip, 'otp')
    
    if (!rateLimitResult.success) {
      console.log(`[RATE LIMIT] IP ${ip} diblokir untuk OTP: ${rateLimitResult.message}`)
      return NextResponse.json(
        { error: rateLimitResult.message || 'Terlalu banyak permintaan OTP. Silakan coba lagi nanti.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.blockedUntil || 0) - Date.now()) / 1000)
          }
        }
      )
    }

    // ========== VALIDASI INPUT ==========
    const { email, phone, type = 'reset_password', method = 'email' } = await req.json()
    
    // Validasi method
    if (!['email', 'whatsapp', 'phone'].includes(method)) {
      return NextResponse.json({ error: 'Metode tidak valid' }, { status: 400 })
    }
    
    // Validasi type
    if (!['reset_password', 'email_verification'].includes(type)) {
      return NextResponse.json({ error: 'Tipe OTP tidak valid' }, { status: 400 })
    }
    
    const channel = method === 'whatsapp' || method === 'phone' ? 'whatsapp' : 'email'
    
    // Validasi input berdasarkan channel
    if (channel === 'email') {
      if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
      }
      
      const sanitizedEmail = sanitizeInput(email)
      
      if (!validateEmail(sanitizedEmail)) {
        return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
      }
    } else {
      if (!phone || typeof phone !== 'string') {
        return NextResponse.json({ error: 'Nomor WhatsApp wajib diisi' }, { status: 400 })
      }
      
      const sanitizedPhone = sanitizeInput(phone)
      
      if (!validatePhone(sanitizedPhone)) {
        return NextResponse.json({ error: 'Format nomor WhatsApp tidak valid' }, { status: 400 })
      }
    }

    // ========== PROSES OTP ==========
    let user = null
    let contact = ''
    
    if (channel === 'email') {
      const normalizedEmail = sanitizeInput(email).toLowerCase().trim()
      user = await query('SELECT id, first_name, email FROM users WHERE LOWER(email)=$1', [normalizedEmail])
      contact = normalizedEmail
    } else {
      const normalizedPhone = sanitizeInput(phone).replace(/\s+/g, '')
      user = await query('SELECT id, first_name, email, phone_number FROM users WHERE phone_number=$1', [normalizedPhone])
      contact = normalizedPhone
    }

    const otpContactColumn = await getOtpContactColumn()
    const otpTypeColumn = await getOtpTypeColumn()
    
    // Cek OTP yang sudah dikirim dalam 15 menit terakhir
    const recent = otpTypeColumn
      ? await query(
          `SELECT COUNT(*) cnt FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND ${quoteColumn(otpTypeColumn)}=$2 AND created_at > NOW()-INTERVAL '15 minutes'`,
          [contact, type]
        )
      : await query(
          `SELECT COUNT(*) cnt FROM otp_resets WHERE ${quoteColumn(otpContactColumn)}=$1 AND created_at > NOW()-INTERVAL '15 minutes'`,
          [contact]
        )
    
    if (parseInt(recent.rows[0].cnt) >= 3) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan OTP. Tunggu 15 menit.' }, { status: 429 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const exp = new Date(Date.now() + (type === 'reset_password' ? 5 : 24) * 60 * 1000) // 5 menit untuk reset, 24 jam untuk verifikasi
    
    if (otpTypeColumn) {
      await query(
        `INSERT INTO otp_resets (${quoteColumn(otpContactColumn)}, otp_code, ${quoteColumn(otpTypeColumn)}, expired_at, ip_address) VALUES ($1, $2, $3, $4, $5)`,
        [contact, otp, type, exp, ip]
      )
    } else {
      await query(
        `INSERT INTO otp_resets (${quoteColumn(otpContactColumn)}, otp_code, expired_at, ip_address) VALUES ($1, $2, $3, $4)`,
        [contact, otp, exp, ip]
      )
    }

    // Always return success to prevent enumeration
    // But actually try to send the OTP if user exists
    if (user?.rows?.length) {
      try {
        if (channel === 'email') {
          await sendOTP(contact, otp, user.rows[0].first_name || 'User', type)
          console.log(`[OTP-${type.toUpperCase()}] Email sent to ${contact}`)
        } else {
          await sendWhatsAppOTP(user.rows[0].phone_number || contact, otp, user.rows[0].first_name || 'User')
          console.log(`[OTP-${type.toUpperCase()}] WhatsApp sent to ${contact}`)
        }
      } catch (error) {
        // Log the error but don't expose to user
        console.error(`[OTP-${type.toUpperCase()}] Failed to send to ${contact}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Kode OTP ${type === 'reset_password' ? 'reset password' : 'verifikasi email'} dikirim ke ${channel === 'email' ? 'email' : 'WhatsApp'} kamu` 
    })
    
  } catch (e) {
    console.error('[OTP] Error:', e);
    return NextResponse.json({ error: 'Gagal kirim OTP' }, { status: 500 })
  }
}
