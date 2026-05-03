'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  PageShell, BrandLogo, Card, CardHeader,
  FieldLabel, PrimaryButton, BackToLogin,
} from '../auth-ui-components/components'
import { OTPInput, useOTPTimer } from '../auth-ui-components/OTPInput'
import { OTP_DIGITS, ROUTES } from '../auth-ui-components/constants'

// ─── password strength ───────────────────────────────────────────────────────
function getStrength(pw: string): { level: 0|1|2|3; label: string; color: string } {
  if (pw.length === 0)  return { level: 0, label: '',       color: '' }
  let score = 0
  if (pw.length >= 8)                   score++
  if (/[A-Z]/.test(pw))                 score++
  if (/[0-9]/.test(pw))                 score++
  if (/[^A-Za-z0-9]/.test(pw))         score++
  if (score <= 1) return { level: 1, label: 'Lemah',  color: '#e04040' }
  if (score <= 2) return { level: 2, label: 'Sedang', color: '#ef9f27' }
  return              { level: 3, label: 'Kuat',   color: '#63c122' }
}

function StrengthBar({ password }: { password: string }) {
  const { level, label, color } = getStrength(password)
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1,2,3].map(i => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full transition-all"
            style={{ background: i <= level ? color : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold" style={{ color }}>● {label}</p>
    </div>
  )
}

// ─── eye toggle ──────────────────────────────────────────────────────────────
function PasswordInput({
  label, value, onChange, placeholder
}: {
  label: string; value: string;
  onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
          style={{
            background: '#13132a',
            border:     '1px solid rgba(0,229,255,0.12)',
            color:      '#e0e0ff',
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.45)'
            e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(0,229,255,0.08)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)'
            e.currentTarget.style.boxShadow   = 'none'
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: '#5a5a8a', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
type Step = 'otp' | 'password' | 'success'

function ResetPasswordInner() {
  const router  = useRouter()
  const params  = useSearchParams()
  const email   = params.get('email') ?? ''

  const [step,        setStep]        = useState<Step>('otp')
  const [otp,         setOtp]         = useState<string[]>(Array(OTP_DIGITS).fill(''))
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [resent,      setResent]      = useState(false)
  const { display, expired, reset }   = useOTPTimer()

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1*****$2')
  const otpValue    = otp.join('')
  const otpComplete = otpValue.length === OTP_DIGITS && otp.every(Boolean)
  const strength    = getStrength(password)

  // ── Step 1: verify OTP ───────────────────────────────────────────────────
  async function handleVerifyOTP() {
    if (!otpComplete) { setError('Lengkapi 6 digit kode OTP.'); return }
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/auth/verify-reset-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp: otpValue }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || data.error || 'Kode OTP tidak valid.'); return }
      setStep('password')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: set new password ─────────────────────────────────────────────
  async function handleResetPassword() {
    if (strength.level < 2) { setError('Password terlalu lemah.'); return }
    if (password !== confirm) { setError('Konfirmasi password tidak cocok.'); return }
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp: otpValue, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || data.error || 'Gagal mereset password.'); return }
      setStep('success')
      setTimeout(() => router.push(ROUTES.login), 2500)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!expired) return
    try {
      await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
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
        {/* ── Step indicator ── */}
        <div className="flex px-8 pt-6 gap-2">
          {(['otp', 'password', 'success'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: step === s
                    ? 'linear-gradient(135deg,#00e5ff,#c720e6)'
                    : ['otp','password','success'].indexOf(step) > i
                    ? 'rgba(0,229,255,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  color: step === s ? '#06060f' : '#5a5a8a',
                }}
              >
                {['otp','password','success'].indexOf(step) > i ? '✓' : i + 1}
              </div>
              {i < 2 && (
                <div
                  className="flex-1 h-[1px]"
                  style={{ background: ['otp','password','success'].indexOf(step) > i ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.06)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── OTP step ── */}
        {step === 'otp' && (
          <>
            <CardHeader
              icon="🔑"
              title="Reset Password"
              subtitle={`Masukkan kode OTP yang dikirim ke ${maskedEmail}`}
            />
            <div className="px-8 py-7 flex flex-col gap-5">
              <div>
                <FieldLabel>Kode OTP (6 Digit)</FieldLabel>
                <OTPInput value={otp} onChange={v => { setOtp(v); setError('') }} hasError={Boolean(error)} />
              </div>

              {error && <p className="text-xs" style={{ color: '#e04040' }}>✕ {error}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#5a5a8a', fontFamily: "'JetBrains Mono',monospace" }}>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: expired ? '#5a5a8a' : '#e04040', animation: expired ? 'none' : 'pulse 1s infinite' }}
                  />
                  {expired ? 'Kedaluwarsa' : `${display} tersisa`}
                </div>
                <button
                  onClick={handleResend}
                  disabled={!expired}
                  className="text-xs font-semibold"
                  style={{ color: expired ? '#00e5ff' : '#5a5a8a', cursor: expired ? 'pointer' : 'not-allowed', background: 'none', border: 'none', fontFamily: "'Sora',sans-serif" }}
                >
                  {resent ? '✓ Terkirim!' : 'Kirim ulang'}
                </button>
              </div>

              <PrimaryButton onClick={handleVerifyOTP} loading={loading} disabled={!otpComplete}>
                Verifikasi Kode →
              </PrimaryButton>
            </div>
          </>
        )}

        {/* ── Password step ── */}
        {step === 'password' && (
          <>
            <CardHeader
              icon="🔒"
              title="Buat Password Baru"
              subtitle="Buat password yang kuat dan belum pernah dipakai sebelumnya"
            />
            <div className="px-8 py-7 flex flex-col gap-5">
              <div>
                <PasswordInput
                  label="Password Baru"
                  value={password}
                  onChange={v => { setPassword(v); setError('') }}
                  placeholder="Min. 8 karakter"
                />
                <StrengthBar password={password} />
              </div>

              <PasswordInput
                label="Konfirmasi Password"
                value={confirm}
                onChange={v => { setConfirm(v); setError('') }}
                placeholder="Ulangi password baru"
              />

              {confirm && password !== confirm && (
                <p className="text-[10px]" style={{ color: '#e04040' }}>✕ Password tidak cocok</p>
              )}
              {error && <p className="text-xs" style={{ color: '#e04040' }}>✕ {error}</p>}

              {/* tips */}
              <div
                className="rounded-xl px-4 py-3 text-xs leading-loose"
                style={{ background: 'rgba(31,71,136,0.1)', border: '1px solid rgba(31,71,136,0.2)', color: '#5060a0' }}
              >
                <p className="font-semibold mb-1" style={{ color: '#6080b0' }}>Tips password kuat:</p>
                {[
                  ['Min. 8 karakter',         password.length >= 8],
                  ['Huruf kapital (A-Z)',      /[A-Z]/.test(password)],
                  ['Angka (0-9)',              /[0-9]/.test(password)],
                  ['Karakter spesial (!@#$)', /[^A-Za-z0-9]/.test(password)],
                ].map(([tip, ok]) => (
                  <p key={tip as string} style={{ color: ok ? '#63c122' : '#5060a0' }}>
                    {ok ? '✓' : '○'} {tip}
                  </p>
                ))}
              </div>

              <PrimaryButton
                onClick={handleResetPassword}
                loading={loading}
                disabled={strength.level < 2 || password !== confirm}
              >
                🔒 Simpan Password Baru
              </PrimaryButton>
            </div>
          </>
        )}

        {/* ── Success step ── */}
        {step === 'success' && (
          <div className="px-8 py-12 flex flex-col items-center gap-4 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{
                background: 'linear-gradient(135deg,rgba(0,229,255,0.15),rgba(199,32,230,0.15))',
                border:     '2px solid rgba(0,229,255,0.4)',
                animation:  'popIn .4s cubic-bezier(.175,.885,.32,1.275) both',
              }}
            >
              ✅
            </div>
            <p className="text-lg font-bold" style={{ color: '#00e5ff' }}>Password Berhasil Diubah!</p>
            <p className="text-sm leading-relaxed" style={{ color: '#5a5a8a' }}>
              Akun kamu kini aman dengan password baru.<br />Mengalihkan ke halaman login...
            </p>
          </div>
        )}
      </Card>

      {step !== 'success' && <BackToLogin />}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
      `}</style>
    </PageShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  )
}
