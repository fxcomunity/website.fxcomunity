import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { sendOTP } from '@/lib/mail'
import { checkRateLimit } from '@/lib/rate-limit'

// Validasi email dengan regex untuk mencegah SQL Injection
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validasi username
const validateUsername = (username: string): boolean => {
  // Username hanya boleh huruf, angka, underscore, dan 3-20 karakter
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// Sanitasi input untuk mencegah SQL Injection
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
    const rateLimitResult = checkRateLimit(ip, 'register')
    
    if (!rateLimitResult.success) {
      console.log(`[RATE LIMIT] IP ${ip} diblokir untuk register: ${rateLimitResult.message}`)
      return NextResponse.json(
        { error: rateLimitResult.message || 'Terlalu banyak percobaan. Silakan coba lagi nanti.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.blockedUntil || 0) - Date.now()) / 1000)
          }
        }
      )
    }

    // ========== VALIDASI INPUT ==========
    const { username, email, password } = await req.json()
    
    // Validasi semua field ada
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }
    
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 })
    }
    
    // Sanitasi input
    const sanitizedUsername = sanitizeInput(username)
    const sanitizedEmail = sanitizeInput(email)
    
    // Validasi format email
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    
    // Validasi format username
    if (!validateUsername(sanitizedUsername)) {
      return NextResponse.json({ error: 'Username harus 3-20 karakter dan hanya boleh huruf, angka, underscore' }, { status: 400 })
    }
    
    // Validasi panjang password
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }
    
    if (password.length > 128) {
      return NextResponse.json({ error: 'Password terlalu panjang' }, { status: 400 })
    }

    // Normalisasi email
    const normalizedEmail = sanitizedEmail.toLowerCase().trim()
    
    // ========== CEK USER SUDAH ADA ==========
    const exist = await query(
      'SELECT id FROM users WHERE LOWER(email)=$1 OR username=$2', 
      [normalizedEmail, sanitizedUsername]
    )
    
    if (exist.rows.length) {
      return NextResponse.json({ error: 'Email atau username sudah digunakan' }, { status: 400 })
    }
    
    // ========== REGISTER USER ==========
    const hashed = await bcrypt.hash(password, 12)
    
    const r = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role',
      [sanitizedUsername, normalizedEmail, hashed]
    )
    
    // Generate dan kirim OTP untuk verifikasi email
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const exp = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
    
    try {
      await query(
        'INSERT INTO otp_resets (email, otp_code, otp_type, expired_at, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [normalizedEmail, otp, 'email_verification', exp, ip]
      )
      await sendOTP(normalizedEmail, otp, sanitizedUsername, 'email_verification')
      console.log(`[REGISTER] OTP dikirim ke ${normalizedEmail}`)
    } catch (otpError) {
      console.error(`[REGISTER] Gagal kirim OTP ke ${normalizedEmail}:`, otpError)
      // Jangan stop proses registrasi jika OTP gagal
    }
    
    // Reset rate limit setelah register berhasil (opsional)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Registrasi berhasil! Silakan cek email kamu untuk OTP verifikasi.',
      data: r.rows[0] 
    }, { status: 201 })
    
  } catch (e) {
    console.error('[REGISTER] Error server:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
