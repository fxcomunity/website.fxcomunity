import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

// Validasi email dengan regex untuk mencegah SQL Injection
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return ''
  
  // Hapus karakter yang berpotensi berbahaya
  return input
    .replace(/['";\\]/g, '')  // Hapus kutip dan semicolon
    .replace(/--/g, '')       // Hapus comment SQL
    .replace(/\*\//g, '')
    .trim()
}

const getIP = (req: NextRequest) => {
  // Coba berbagai header untuk mendapatkan IP asli
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return req.headers.get('cf-connecting-ip') || '127.0.0.1'
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  
  try {
    // ========== RATE LIMITING DISABLED FOR TESTING ==========
    // const rateLimitResult = checkRateLimit(ip, 'login')
    const rateLimitResult = { success: true, remaining: 5, resetAt: Date.now() + 900000, message: 'Rate limiting disabled for testing', blockedUntil: undefined }
    
    if (!rateLimitResult.success) {
      console.log(`[RATE LIMIT] IP ${ip} diblokir: ${rateLimitResult.message}`)
      
      // Catat ke login_logs
      try {
        await query(
          `INSERT INTO login_logs (email, ip_address, status, keterangan) VALUES ($1, $2, 'Blocked', $3)`,
          ['rate_limit', ip, rateLimitResult.message || 'Rate limit exceeded']
        )
      } catch (logError) {
        console.error('Gagal mencatat rate limit:', logError)
      }
      
      return NextResponse.json(
        { 
          error: rateLimitResult.message || 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
          retryAfter: rateLimitResult.blockedUntil
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.blockedUntil || 0) - Date.now()) / 1000)
          }
        }
      )
    }

    // ========== VALIDASI INPUT (Proteksi SQL Injection) ==========
    const { email, password } = await req.json()
    
    // Validasi email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    }
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password wajib diisi' }, { status: 400 })
    }
    
    // Sanitasi email
    const sanitizedEmail = sanitizeInput(email)
    
    // Validasi format email dengan regex
    if (!validateEmail(sanitizedEmail)) {
      console.log(`[VALIDASI] Email tidak valid: ${sanitizedEmail}`)
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    
    // Validasi panjang password
    if (password.length < 1 || password.length > 128) {
      return NextResponse.json({ error: 'Password tidak valid' }, { status: 400 })
    }

    // Normalisasi email (lowercase dan trim)
    const normalizedEmail = sanitizedEmail.toLowerCase().trim()
    
    // ========== PROSES LOGIN ==========
    console.log(`[LOGIN] Percobaan login untuk: ${normalizedEmail} dari IP: ${ip}`)
    
    // Query dengan parameterized query (sudah aman dari SQL Injection)
    const r = await query('SELECT * FROM users WHERE LOWER(email)=$1', [normalizedEmail])
    const user = r.rows[0]
    
    if (!user) {
      console.log(`[LOGIN] User tidak ditemukan: ${normalizedEmail}`)
      await query(
        `INSERT INTO login_logs (email, ip_address, status, keterangan) VALUES ($1, $2, 'Failed', 'User tidak ditemukan')`,
        [normalizedEmail, ip]
      )
      return NextResponse.json({ 
        error: 'Email atau password salah',
        remainingAttempts: rateLimitResult.remaining
      }, { status: 401 })
    }
    
    // Cek status akun
    if (user.status === 'Tidak Aktif') {
      console.log(`[LOGIN] Akun nonaktif: ${normalizedEmail}`)
      await query(
        `INSERT INTO login_logs (user_id, email, ip_address, status, keterangan) VALUES ($1, $2, $3, 'Failed', 'Akun nonaktif')`,
        [user.id, normalizedEmail, ip]
      )
      return NextResponse.json({ error: 'Akun kamu dinonaktifkan. Hubungi admin.' }, { status: 403 })
    }
    
    // Verifikasi password dengan bcrypt
    console.log(`[LOGIN] Verifikasi password untuk user ID: ${user.id}`)
    console.log(`[LOGIN] Password hash di database: ${user.password.substring(0, 20)}...`)
    
    let ok = false
    try {
      ok = await bcrypt.compare(password, user.password)
      console.log(`[LOGIN] Hasil bcrypt.compare: ${ok}`)
    } catch (bcryptError) {
      console.error(`[LOGIN] Error bcrypt.compare:`, bcryptError)
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }
    
    if (!ok) {
      console.log(`[LOGIN] Password salah untuk user: ${normalizedEmail}`)
      await query(
        `INSERT INTO login_logs (user_id, email, ip_address, status, keterangan) VALUES ($1, $2, $3, 'Failed', 'Password salah')`,
        [user.id, normalizedEmail, ip]
      )
      
      // Berikan informasi tentang percobaan yang tersisa
      const attemptsLeft = rateLimitResult.remaining - 1
      if (attemptsLeft <= 2) {
        return NextResponse.json({ 
          error: 'Email atau password salah',
          warning: `Peringatan: ${attemptsLeft} percobaan tersisa sebelum diblokir!`,
          remainingAttempts: attemptsLeft
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: 'Email atau password salah',
        remainingAttempts: attemptsLeft
      }, { status: 401 })
    }
    
    // ========== LOGIN BERHASIL ==========
    console.log(`[LOGIN] Login berhasil untuk user: ${normalizedEmail}`)
    
    // Reset rate limit setelah login berhasil
    // resetRateLimit(ip, 'login')
    
    // Generate JWT token
    const token = await signToken({ 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    })
    
    // Catat login success
    await query(
      `INSERT INTO login_logs (user_id, email, ip_address, status, keterangan) VALUES ($1, $2, $3, 'Success', 'Login berhasil')`,
      [user.id, normalizedEmail, ip]
    )
    
    // Buat response
    const res = NextResponse.json({ 
      success: true, 
      data: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }
    })
    
    // Set cookie dengan keamanan ekstra
    res.cookies.set('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/'
    })
    
    return res
    
  } catch (e) {
    console.error('[LOGIN] Error server:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
