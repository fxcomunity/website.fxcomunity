import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { sendOTP } from '@/lib/mail'

const getIP = (req: NextRequest) => req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  try {
    const { username, email, password } = await req.json()
    if (!username||!email||!password) return NextResponse.json({ error:'Semua field wajib diisi' }, { status:400 })
    if (password.length < 6) return NextResponse.json({ error:'Password minimal 6 karakter' }, { status:400 })
    const exist = await query('SELECT id FROM users WHERE email=$1 OR username=$2', [email, username])
    if (exist.rows.length) return NextResponse.json({ error:'Email atau username sudah digunakan' }, { status:400 })
    const hashed = await bcrypt.hash(password, 12)
    const r = await query('INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id,username,email,role', [username,email,hashed])
    
    // Generate dan kirim OTP untuk verifikasi email
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const exp = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
    try {
      await query('INSERT INTO otp_resets (email,otp_code,otp_type,expired_at,ip_address) VALUES ($1,$2,$3,$4,$5)', [email, otp, 'email_verification', exp, ip])
      await sendOTP(email, otp, username, 'email_verification')
      console.log(`[REGISTER] OTP dikirim ke ${email}`)
    } catch (otpError) {
      console.error(`[REGISTER] Gagal kirim OTP ke ${email}:`, otpError)
      // Jangan stop proses registrasi jika OTP gagal, user bisa request ulang
    }
    
    return NextResponse.json({ success:true, message:'Registrasi berhasil! Silakan cek email kamu untuk OTP verifikasi.', data:r.rows[0] }, { status:201 })
  } catch(e) { console.error(e); return NextResponse.json({ error:'Server error' }, { status:500 }) }
}
