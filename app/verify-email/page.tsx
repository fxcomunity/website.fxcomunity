'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromParams = searchParams.get('email') || ''
  
  const [form, setForm] = useState({ email: emailFromParams, otp: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.otp) { setError('Email dan OTP wajib diisi'); return }
    if (form.otp.length !== 6) { setError('OTP harus 6 digit'); return }
    
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp })
      })
      const data = await res.json()
      if (data.success) { 
        setSuccess(data.message)
        setTimeout(() => router.push('/login'), 2000) 
      } else setError(data.error || 'Verifikasi gagal')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  async function requestNewOTP() {
    if (!form.email) { setError('Masukkan email terlebih dahulu'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, type: 'email_verification' })
      })
      const data = await res.json()
      if (data.success) setSuccess('✅ Kode OTP baru telah dikirim ke email kamu')
      else setError(data.error || 'Gagal request OTP')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,32,230,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,71,136,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>✉️</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '6px' }}><span className="grad-text">Verifikasi Email</span></h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Kami sudah mengirim kode OTP ke email kamu</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow2)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Masukkan Kode OTP</h2>

          {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ff8080', fontSize: '14px' }}>⚠️ {error}</div>}
          {success && <div style={{ background: 'rgba(40,200,100,0.1)', border: '1px solid rgba(40,200,100,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#60d090', fontSize: '14px' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>EMAIL</label>
              <input 
                className="input" 
                type="email" 
                placeholder="email@example.com"
                value={form.email} 
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                required 
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'var(--text2)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>KODE OTP (6 DIGIT)</label>
              <input 
                className="input" 
                type="text" 
                placeholder="000000"
                maxLength={6}
                value={form.otp} 
                onChange={e => setForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))} 
                required 
                style={{ fontSize: '20px', letterSpacing: '8px', textAlign: 'center', fontWeight: 600 }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, borderRadius: '12px', marginTop: '8px' }}>
              {loading ? <><span className="spin">⚙️</span> Verifikasi...</> : '✅ Verifikasi Email'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '12px' }}>Tidak menerima kode?</p>
            <button 
              onClick={requestNewOTP}
              disabled={loading}
              style={{ 
                background: 'transparent', 
                border: '1px solid var(--secondary)', 
                color: 'var(--secondary)', 
                padding: '10px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '14px', 
                fontWeight: 600 
              }}
            >
              Minta Kode Baru
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
              <Link href="/login" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Kembali ke Login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  )
}
