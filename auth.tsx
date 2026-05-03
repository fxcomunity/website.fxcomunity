'use client'
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import PremiumLoader from "@/components/PremiumLoader";

type AuthMode = "login" | "register";

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const modeParam = new URLSearchParams(window.location.search).get('mode')
    if (modeParam === 'register') setMode('register')
  }, [])

  useEffect(() => {
    setForm(initialForm);
    setErrors({});
    setSubmitError('');
  }, [mode]);

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Email tidak valid";
    if (mode === "register") {
      if (!form.username.trim()) {
        errs.username = "Username wajib diisi";
      } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username.trim())) {
        errs.username = "Username 3-20 karakter, tanpa spasi (hanya huruf, angka, _)";
      }
      if (form.password.length < 8) errs.password = "Min. 8 karakter";
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Kata sandi tidak cocok";
    } else {
      if (!form.password) errs.password = "Kata sandi wajib diisi";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setSubmitError('');
    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        })
        const data = await res.json()
        if (!data.success) { setSubmitError(data.error || 'Login gagal'); return }
        if (['Owner', 'Admin'].includes(data.data.role)) window.location.href = '/admin'
        else window.location.href = '/library'
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username.trim(), email: form.email, password: form.password })
        })
        const data = await res.json()
        if (!data.success) { setSubmitError(data.error || 'Registrasi gagal'); return }
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
      }
    } catch {
      setSubmitError('Koneksi gagal')
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    if (submitError) setSubmitError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background: #05060f;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Background effects */
        .auth-page::before {
          content: '';
          position: absolute;
          top: -200px;
          left: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0,229,255,0.06), transparent 70%);
          pointer-events: none;
        }
        .auth-page::after {
          content: '';
          position: absolute;
          bottom: -150px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%);
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          background: rgba(10, 14, 28, 0.95);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Card top glow */
        .card-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.5), rgba(124,58,237,0.5), transparent);
        }

        /* Header */
        .auth-header {
          padding: 32px 32px 0;
          text-align: center;
        }
        .auth-logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          object-fit: cover;
          margin: 0 auto 12px;
          display: block;
          border: 2px solid rgba(0,229,255,0.2);
          box-shadow: 0 4px 16px rgba(0,229,255,0.15);
        }
        .auth-brand {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .auth-subtitle {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          background: linear-gradient(90deg, #00E5FF, #A855F7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
        }

        /* Tab Switcher */
        .tab-row {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 4px;
          margin: 24px 32px 0;
          gap: 4px;
        }
        .tab-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 11px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          background: transparent;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .tab-btn:hover {
          color: rgba(255,255,255,0.6);
        }
        .tab-btn.active {
          background: linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.12));
          color: #fff;
          border: 1px solid rgba(0,229,255,0.15);
          box-shadow: 0 2px 12px rgba(0,229,255,0.08);
        }

        /* Form Body */
        .form-body {
          padding: 24px 32px 32px;
        }

        /* Error banner */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #F87171;
          font-weight: 600;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Fields */
        .field {
          margin-bottom: 16px;
        }
        .field label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.45);
          margin-bottom: 7px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }
        .field-input-wrap {
          position: relative;
        }
        .field input {
          width: 100%;
          padding: 12px 16px;
          font-family: inherit;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          color: #fff;
          outline: none;
          transition: all 0.25s ease;
        }
        .field input:focus {
          border-color: rgba(0,229,255,0.4);
          background: rgba(0,229,255,0.03);
          box-shadow: 0 0 0 3px rgba(0,229,255,0.08);
        }
        .field input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .field-error {
          font-size: 11px;
          color: #F87171;
          margin-top: 4px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Password toggle */
        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .pass-toggle:hover {
          color: rgba(255,255,255,0.6);
        }

        /* Name row */
        .name-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Forgot link */
        .forgot {
          display: block;
          text-align: right;
          font-size: 12px;
          color: #00E5FF;
          margin-top: -10px;
          margin-bottom: 16px;
          cursor: pointer;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .forgot:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #00B8D4, #00E5FF);
          color: #000;
          border: none;
          border-radius: 14px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(0,229,255,0.2);
          letter-spacing: 0.3px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,229,255,0.35);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .auth-divider span {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          font-weight: 600;
        }

        /* Switch text */
        .switch-text {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          text-align: center;
          margin-top: 20px;
        }
        .switch-text a {
          color: #00E5FF;
          cursor: pointer;
          font-weight: 700;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .switch-text a:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        /* Terms */
        .terms {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          text-align: center;
          margin-top: 16px;
          line-height: 1.7;
        }
        .terms a {
          color: #00E5FF;
          cursor: pointer;
          text-decoration: none;
        }
        .terms a:hover {
          text-decoration: underline;
        }

        /* Security badge */
        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 20px;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          font-weight: 500;
        }

        /* Back button */
        .back-link {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s;
        }
        .back-link:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.1);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .auth-header { padding: 28px 24px 0; }
          .tab-row { margin: 20px 24px 0; }
          .form-body { padding: 20px 24px 28px; }
          .auth-card { border-radius: 20px; }
          .name-row { grid-template-columns: 1fr; gap: 0; }
        }

        /* Spinner */
        @keyframes authSpin {
          to { transform: rotate(360deg); }
        }
        .auth-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: authSpin 0.6s linear infinite;
        }
      `}</style>

      <div className="auth-page">
        {/* Back to home */}
        <a href="/" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Beranda
        </a>

        <div className="auth-card">
          <div className="card-glow" />

          {/* Header */}
          <div className="auth-header">
            <img className="auth-logo" src="/logo.png" alt="FXCommunity Logo" />
            <div className="auth-brand">FXCOMMUNITY</div>
            <div className="auth-subtitle">Trading Education</div>
          </div>

          {/* Tab Switcher */}
          <div className="tab-row">
            <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              Masuk
            </button>
            <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Daftar
            </button>
          </div>

          {/* Form */}
          <div className="form-body">

            {/* Submit error */}
            {submitError && (
              <div className="error-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {submitError}
              </div>
            )}

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <div onKeyDown={handleKeyDown}>
                <div className="field">
                  <label>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Email
                  </label>
                  <input type="email" placeholder="nama@email.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} autoComplete="email" />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>
                <div className="field">
                  <label>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Kata Sandi
                  </label>
                  <div className="field-input-wrap">
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => handleChange('password', e.target.value)} autoComplete="current-password" />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                      {showPass ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>
                <a className="forgot" href="/forgot-password">Lupa kata sandi?</a>
                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><div className="auth-spinner" /> Memproses...</> : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                      Masuk
                    </>
                  )}
                </button>
                <p className="switch-text">Belum punya akun? <a onClick={() => setMode('register')}>Daftar sekarang</a></p>
              </div>
            )}

            {/* ── REGISTER ── */}
            {mode === 'register' && (
              <div onKeyDown={handleKeyDown}>
                <div className="field">
                  <label>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Username
                  </label>
                  <input type="text" placeholder="budi_santoso" value={form.username} onChange={(e) => handleChange('username', e.target.value)} autoComplete="username" />
                  {errors.username && <div className="field-error">{errors.username}</div>}
                </div>
                <div className="field">
                  <label>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Email
                  </label>
                  <input type="email" placeholder="nama@email.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} autoComplete="email" />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>
                <div className="field">
                  <label>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Kata Sandi
                  </label>
                  <div className="field-input-wrap">
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 karakter" value={form.password} onChange={(e) => handleChange('password', e.target.value)} autoComplete="new-password" />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                      {showPass ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>
                <div className="field">
                  <label>Konfirmasi Kata Sandi</label>
                  <div className="field-input-wrap">
                    <input type={showConfirm ? 'text' : 'password'} placeholder="Ulangi kata sandi" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} autoComplete="new-password" />
                    <button type="button" className="pass-toggle" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                      {showConfirm ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                </div>
                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><div className="auth-spinner" /> Membuat akun...</> : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                      Buat Akun
                    </>
                  )}
                </button>
                <p className="terms">Dengan mendaftar, kamu menyetujui <a href="/terms">Syarat & Ketentuan</a> serta <a href="/privacy">Kebijakan Privasi</a> kami.</p>
                <p className="switch-text">Sudah punya akun? <a onClick={() => setMode('login')}>Masuk di sini</a></p>
              </div>
            )}

            {/* Security footer */}
            <div className="security-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Data terenkripsi & aman
            </div>
          </div>
        </div>
      </div>

      {loading && <PremiumLoader />}
    </>
  );
}
