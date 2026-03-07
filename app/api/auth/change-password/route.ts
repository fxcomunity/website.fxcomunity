import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
    const { current_password, new_password } = await req.json()

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Password lama dan baru wajib diisi' }, { status: 400 })
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    // Get current user data
    const userResult = await query('SELECT password FROM users WHERE id=$1', [decoded.userId])
    if (!userResult.rows.length) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Verify current password
    const isValid = await bcrypt.compare(current_password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 12)

    // Update password
    await query('UPDATE users SET password=$1 WHERE id=$2', [hashedNewPassword, decoded.userId])

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' })
  } catch (e) {
    console.error('Change password error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
