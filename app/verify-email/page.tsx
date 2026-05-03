'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  PageShell, BrandLogo, Card, CardHeader,
  FieldLabel, PrimaryButton, BackToLogin,
} from '../auth-ui-components/components'
import { OTPInput, useOTPTimer } from '../auth-ui-components/OTPInput'
import { OTP_DIGITS, ROUTES } from '../auth-ui-components/constants'

function VerifyEmailInner() {
  const router       = useRouter()
  const params       = useSearchParams()
  const email        = params.get('email') ?? ''

  const [otp, setOtp]         = useState<string[]>(Array(OTP_DIGITS).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [resent, setResent]   = useState(false)
  const { display, expired, reset } = useOTPTimer()

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1*****$2')
  const otpValue    = otp.join('')
  const complete    = otpValue.length === OTP_DIGITS && otp.every(Boolean)

  async function handleVerify() {
    if (!complete) { setError('Lengkapi 6 digit kode OTP terlebih dahulu.'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp: otpValue }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || data.message || 'Kode OTP tidak valid.'); return }
      router.push(ROUTES.dashboard)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!expired) return
    setResent(false)
    try {
      await fetch('/api/auth/resend-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, type: 'email_verification' }),
      })
      reset()
      setOtp(Array(OTP_DIGITS).fill(''))
      setError('')
      setResent(true)
    } catch {
      setError('Gagal mengirim ulang kode.')
    }
  }

  return (
    <PageShell>
      <BrandLogo />

      <Card>
        <CardHeader
          icon="✉️"
          title="Verifikasi Email"
          subtitle={`Kami sudah mengirim kode OTP ke ${maskedEmail}`}
        />

        <div className="px-8 py-7 flex flex-col gap-5">
          {/* Email (read-only) */}
          <div>
            <FieldLabel>Email</FieldLabel>
            <div
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{
                background: '#13132a',
                border:     '1px solid rgba(0,229,255,0.08)',
                color:      '#5a5a8a',
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {email}
            </div>
          </div>

          {/* OTP */}
          <div>
            <FieldLabel>Kode OTP (6 Digit)</FieldLabel>
            <OTPInput value={otp} onChange={v => { setOtp(v); setError('') }} hasError={Boolean(error)} />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-center" style={{ color: '#e04040' }}>
              ✕ {error}
            </p>
          )}

          {/* Timer + resend inline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: '#5a5a8a', fontFamily: "'JetBrains Mono', monospace" }}>
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{
                  background: expired ? '#5a5a8a' : '#e04040',
                  animation:  expired ? 'none' : 'pulse 1s ease infinite',
                }}
              />
              {expired ? 'Kedaluwarsa' : `${display} tersisa`}
            </div>
            <button
              onClick={handleResend}
              disabled={!expired}
              className="text-xs font-semibold transition-colors"
              style={{ color: expired ? '#00e5ff' : '#5a5a8a', cursor: expired ? 'pointer' : 'not-allowed', background: 'none', border: 'none' }}
            >
              {resent ? '✓ Terkirim!' : 'Kirim ulang'}
            </button>
          </div>

          <PrimaryButton onClick={handleVerify} loading={loading} disabled={!complete}>
            ✅ Verifikasi Email
          </PrimaryButton>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

          <div className="text-center">
            <p className="text-xs mb-2" style={{ color: '#5a5a8a' }}>Tidak menerima kode?</p>
            <button
              onClick={handleResend}
              disabled={!expired}
              className="text-xs font-semibold underline underline-offset-4 transition-colors"
              style={{ color: expired ? '#00e5ff' : '#5a5a8a', cursor: expired ? 'pointer' : 'not-allowed', background: 'none', border: 'none', fontFamily: "'Sora', sans-serif" }}
            >
              Minta Kode Baru
            </button>
          </div>
        </div>
      </Card>

      <BackToLogin />

      {/* pulse keyframe */}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </PageShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  )
}
