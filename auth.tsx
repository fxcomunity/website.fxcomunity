 'use client'
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation'

type AuthMode = "login" | "register" | "forgot";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitError, setSubmitError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modeParam = new URLSearchParams(window.location.search).get('mode')
    if (modeParam === 'register') setMode('register')
    if (modeParam === 'forgot') setMode('forgot')
  }, [])

  useEffect(() => {
    setForm(initialForm);
    setErrors({});
    setShowPass(false);
    setShowConfirm(false);
    setSubmitError('');
  }, [mode]);

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Email tidak valid";
    if (mode === "register" && !form.name.trim()) errs.name = "Nama wajib diisi";
    if (mode !== "forgot") {
      if (form.password.length < 6) errs.password = "Min. 6 karakter";
      if (mode === "register" && form.password !== form.confirmPassword)
        errs.confirmPassword = "Kata sandi tidak cocok";
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
      } else if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.name.trim(), email: form.email, password: form.password })
        })
        const data = await res.json()
        if (!data.success) { setSubmitError(data.error || 'Registrasi gagal'); return }
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
      } else {
        const res = await fetch('/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, method: 'email', type: 'reset_password' })
        })
        const data = await res.json()
        if (!data.success) { setSubmitError(data.error || 'Gagal kirim OTP'); return }
        router.push('/reset-password')
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

  const titles: Record<AuthMode, { heading: string; sub: string }> = {
    login: { heading: "Selamat Datang", sub: "Masuk ke akun Anda" },
    register: { heading: "Buat Akun", sub: "Bergabung dengan kami hari ini" },
    forgot: { heading: "Lupa Password", sub: "Kami kirim OTP ke email kamu" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          position: relative;
          overflow: hidden;
        }

        .auth-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 15% 50%, rgba(99,60,180,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 50% 70% at 85% 30%, rgba(20,120,200,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 60% 80%, rgba(200,50,100,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Grid overlay */
        .auth-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Floating orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: floatOrb 8s ease-in-out infinite;
        }
        .orb-1 {
          width: 300px; height: 300px;
          background: rgba(99,60,180,0.15);
          top: 10%; left: 5%;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 200px; height: 200px;
          background: rgba(20,120,200,0.12);
          bottom: 15%; right: 8%;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 150px; height: 150px;
          background: rgba(200,50,100,0.1);
          top: 60%; left: 60%;
          animation-delay: -5s;
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .auth-card {
          position: relative;
          z-index: 10;
          width: 420px;
          max-width: calc(100vw - 32px);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 48px 44px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 40px 80px rgba(0,0,0,0.5),
            0 0 120px rgba(99,60,180,0.08);
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo mark */
        .logo-mark {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        .logo-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.4);
        }
        .logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.5px;
        }

        .auth-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 300;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 6px;
          letter-spacing: -0.3px;
        }
        .auth-heading em {
          font-style: italic;
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-sub {
          font-size: 13.5px;
          color: rgba(255,255,255,0.38);
          margin-bottom: 32px;
          font-weight: 300;
          letter-spacing: 0.2px;
        }

        /* Tab switcher */
        .auth-tabs {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
        }
        .auth-tab {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: rgba(255,255,255,0.4);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .auth-tab:hover { color: rgba(255,255,255,0.65); }
        .auth-tab.active {
          background: rgba(124,58,237,0.35);
          color: #fff;
          font-weight: 500;
          box-shadow: 0 1px 8px rgba(124,58,237,0.25);
        }

        /* Form */
        .form-field {
          margin-bottom: 16px;
          animation: fieldIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes fieldIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .field-label {
          display: block;
          font-size: 11.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .field-wrap {
          position: relative;
        }
        .field-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 300;
          outline: none;
          transition: all 0.2s ease;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .field-input:focus {
          border-color: rgba(124,58,237,0.5);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }
        .field-input.has-error {
          border-color: rgba(248,113,113,0.5);
          box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
        }
        .field-input.has-icon { padding-right: 44px; }

        .toggle-pass {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer; padding: 2px;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .toggle-pass:hover { color: rgba(255,255,255,0.6); }

        .field-error {
          font-size: 11.5px;
          color: #f87171;
          margin-top: 5px;
          display: flex; align-items: center; gap: 4px;
        }

        /* Submit button */
        .btn-submit {
          width: 100%;
          padding: 13px;
          margin-top: 8px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          letter-spacing: 0.3px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .btn-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,58,237,0.45); }
        .btn-submit:hover::before { opacity: 1; }
        .btn-submit:active { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }



        /* Forgot link */
        .forgot-link {
          display: block;
          text-align: right;
          font-size: 12px;
          color: rgba(167,139,250,0.7);
          cursor: pointer;
          margin-top: -8px;
          margin-bottom: 16px;
          transition: color 0.2s;
          background: none; border: none;
          font-family: 'Outfit', sans-serif;
        }
        .forgot-link:hover { color: #a78bfa; }

        /* Footer switch */
        .auth-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.28);
        }
        .auth-footer button {
          background: none; border: none;
          color: rgba(167,139,250,0.8);
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          margin-left: 4px;
          transition: color 0.2s;
        }
        .auth-footer button:hover { color: #a78bfa; }

        /* Success state */
        .success-box {
          text-align: center;
          padding: 12px 0 4px;
          animation: fieldIn 0.5s ease both;
        }
        .success-icon {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(52,211,153,0.12);
          border: 1px solid rgba(52,211,153,0.25);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
        }
        .success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          color: #fff;
          margin-bottom: 8px;
          font-weight: 400;
        }
        .success-text {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
          margin-bottom: 24px;
          font-weight: 300;
        }
        .back-link {
          background: none; border: none;
          color: rgba(167,139,250,0.8);
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          transition: color 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .back-link:hover { color: #a78bfa; }



        @media (max-width: 480px) {
          .auth-card { padding: 36px 28px; }
          .auth-heading { font-size: 30px; }
        }
      `}</style>

      <div className="auth-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="auth-card" ref={panelRef}>
          {/* Logo */}
          <div className="logo-mark">
            <div className="logo-icon">✦</div>
            <span className="logo-text">Nexora</span>
          </div>

          {/* Heading */}
          <h1 className="auth-heading">
            {mode === "login" && <><em>Masuk</em> ke Akun</>}
            {mode === "register" && <>Buat <em>Akun</em> Baru</>}
            {mode === "forgot" && <>Reset <em>Password</em></>}
          </h1>
          <p className="auth-sub">{titles[mode].sub}</p>

          {/* Tab switcher for login/register */}
          {mode !== "forgot" && (
            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => setMode("login")}
              >
                Masuk
              </button>
              <button
                className={`auth-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => setMode("register")}
              >
                Daftar
              </button>
            </div>
          )}

          <>
              {/* Name field — register only */}
              {mode === "register" && (
                <div className="form-field" style={{ animationDelay: "0ms" }}>
                  <label className="field-label">Nama Lengkap</label>
                  <div className="field-wrap">
                    <input
                      className={`field-input${errors.name ? " has-error" : ""}`}
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>
                  {errors.name && <div className="field-error">⚠ {errors.name}</div>}
                </div>
              )}

              {/* Email */}
              <div className="form-field" style={{ animationDelay: "40ms" }}>
                <label className="field-label">Alamat Email</label>
                <div className="field-wrap">
                  <input
                    className={`field-input${errors.email ? " has-error" : ""}`}
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                {errors.email && <div className="field-error">⚠ {errors.email}</div>}
              </div>

              {/* Password */}
              {mode !== "forgot" && (
                <div className="form-field" style={{ animationDelay: "80ms" }}>
                  <label className="field-label">Kata Sandi</label>
                  <div className="field-wrap">
                    <input
                      className={`field-input has-icon${errors.password ? " has-error" : ""}`}
                      type={showPass ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                    <button className="toggle-pass" onClick={() => setShowPass((v) => !v)} type="button">
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.password && <div className="field-error">⚠ {errors.password}</div>}
                </div>
              )}
              {mode === "login" && (
                <button className="forgot-link" onClick={() => setMode("forgot")} type="button">
                  Lupa kata sandi?
                </button>
              )}

              {/* Confirm Password */}
              {mode === "register" && (
                <div className="form-field" style={{ animationDelay: "120ms" }}>
                  <label className="field-label">Konfirmasi Kata Sandi</label>
                  <div className="field-wrap">
                    <input
                      className={`field-input has-icon${errors.confirmPassword ? " has-error" : ""}`}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi kata sandi"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    />
                    <button className="toggle-pass" onClick={() => setShowConfirm((v) => !v)} type="button">
                      {showConfirm ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="field-error">⚠ {errors.confirmPassword}</div>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                <span className="btn-inner">
                  {loading && <span className="spinner" />}
                  {!loading && (
                    mode === "login"
                      ? "Masuk Sekarang"
                      : mode === "register"
                      ? "Buat Akun"
                      : "Kirim OTP"
                  )}
                  {loading && "Memproses..."}
                </span>
              </button>
              {submitError && <div className="field-error" style={{ marginTop: 10 }}>⚠ {submitError}</div>}



              {/* Footer */}
              <div className="auth-footer">
                {mode === "login" && (
                  <>Belum punya akun?<button onClick={() => setMode("register")}>Daftar</button></>
                )}
                {mode === "register" && (
                  <>Sudah punya akun?<button onClick={() => setMode("login")}>Masuk</button></>
                )}
                {mode === "forgot" && (
                  <>Ingat sandi?<button onClick={() => setMode("login")}>Kembali masuk</button></>
                )}
              </div>
          </>
        </div>
      </div>
    </>
  );
}
