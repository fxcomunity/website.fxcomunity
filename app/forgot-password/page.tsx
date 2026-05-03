'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PageShell, BrandLogo, Card, CardHeader,
  FieldLabel, TextInput, PrimaryButton, BackToLogin,
} from '../auth-ui-components/components'
import { ROUTES } from '../auth-ui-components/constants'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [sent,    setSent]    = useState(false)

  async function handleSubmit() {
    if (!email.trim()) { setError('Masukkan alamat email kamu.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Format email tidak valid.'); return }
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || data.error || 'Gagal mengirim kode.'); return }
      setSent(true)
      // redirect ke halaman reset password dengan email sebagai param
      setTimeout(() => {
        router.push(`${ROUTES.resetPassword}?email=${encodeURIComponent(email)}`)
      }, 1800)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <BrandLogo />

      <Card>
        <CardHeader
          icon="🔑"
          title="Lupa Password"
          subtitle="Masukkan email kamu dan kami akan mengirimkan kode OTP untuk reset password"
        />

        <div className="px-8 py-7 flex flex-col gap-5">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-4 flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{
                  background: 'linear-gradient(135deg,rgba(0,229,255,0.15),rgba(199,32,230,0.15))',
                  border:     '1.5px solid rgba(0,229,255,0.35)',
                }}
              >
                📨
              </div>
              <p className="font-semibold text-sm" style={{ color: '#00e5ff' }}>Kode OTP Terkirim!</p>
              <p className="text-xs leading-relaxed" style={{ color: '#5a5a8a' }}>
                Cek email <span style={{ color: '#e0e0ff' }}>{email}</span> dan masukkan kode OTP di halaman berikutnya.
              </p>
              <p className="text-xs" style={{ color: '#5a5a8a' }}>Mengalihkan halaman...</p>
            </div>
          ) : (
            <>
              <div>
                <FieldLabel>Email</FieldLabel>
                <TextInput
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: '#e04040' }}>✕ {error}</p>
              )}

              {/* info box */}
              <div
                className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{
                  background: 'rgba(31,71,136,0.12)',
                  border:     '1px solid rgba(31,71,136,0.25)',
                  color:      '#6080b0',
                }}
              >
                🛡️ Kode OTP akan dikirim ke email kamu dan berlaku selama <strong style={{ color: '#a0c0e0' }}>5 menit</strong>.
              </div>

              <PrimaryButton onClick={handleSubmit} loading={loading}>
                🔑 Kirim Kode OTP
              </PrimaryButton>
            </>
          )}
        </div>
      </Card>

      <BackToLogin />
    </PageShell>
  )
}
