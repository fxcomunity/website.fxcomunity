'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm: '' })
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [verifiedOtp, setVerifiedOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) { setError('Email wajib diisi'); return }
    if (form.otp.length !== 6) { setError('OTP harus 6 digit'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp })
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'OTP tidak valid'); return }
      setVerifiedOtp(form.otp)
      setStep('password')
      setSuccess('OTP valid. Silakan masukkan password baru.')
    } catch {
      setError('Koneksi gagal')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return }
    if (form.password !== form.confirm) { setError('Konfirmasi password tidak cocok'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: verifiedOtp, password: form.password })
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Reset password gagal'); return }
      setSuccess('Password berhasil direset. Mengarahkan ke login...')
      setTimeout(() => router.push('/login'), 1200)
    } catch {
      setError('Koneksi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow2)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }} className="grad-text">Reset Password</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 18 }}>
          {step === 'otp' ? 'Masukkan email dan kode OTP terlebih dahulu.' : 'OTP sudah valid, sekarang set password baru.'}
        </p>
        {error && <div style={{ marginBottom: 12, background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: 10, padding: '10px 12px', color: '#ff8080', fontSize: 13 }}>⚠️ {error}</div>}
        {success && <div style={{ marginBottom: 12, background: 'rgba(40,200,100,0.1)', border: '1px solid rgba(40,200,100,0.3)', borderRadius: 10, padding: '10px 12px', color: '#60d090', fontSize: 13 }}>✅ {success}</div>}
        {step === 'otp' ? (
        <form onSubmit={handleVerifyOtp}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>EMAIL</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>OTP</label>
            <input className="input" type="text" inputMode="numeric" maxLength={6} value={form.otp} onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))} required />
          </div>
          <button className="btn btn-primary" disabled={loading} type="submit" style={{ width: '100%' }}>
            {loading ? <><span className="spin">⚙️</span> Verifikasi...</> : 'Verifikasi OTP'}
          </button>
        </form>
        ) : (
        <form onSubmit={handleResetPassword}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>EMAIL</label>
            <input className="input" type="email" value={form.email} disabled />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>PASSWORD BARU</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>KONFIRMASI PASSWORD</label>
            <input className="input" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
          </div>
          <button className="btn btn-primary" disabled={loading} type="submit" style={{ width: '100%' }}>
            {loading ? <><span className="spin">⚙️</span> Memproses...</> : 'Reset Password'}
          </button>
        </form>
        )}
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <Link href="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>← Kembali ke Login</Link>
        </div>
      </div>
    </div>
  )
}
