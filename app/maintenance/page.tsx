'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, RefreshCcw, ShieldAlert, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function MaintenancePage() {
  const router = useRouter()
  const [dots, setDots] = useState(".")
  const [checking, setChecking] = useState(false)

  // Animasi titik-titik
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."))
    }, 500)
    return () => clearInterval(dotsInterval)
  }, [])

  // Auto-check status maintenance tiap 5 detik
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const r = await fetch('/api/auth/me', { cache: 'no-store' })
        // Jika tidak 503, berarti maintenance sudah mati!
        if (r.status !== 503) {
          window.location.href = '/' // Force full reload ke halaman utama
        }
      } catch (e) {
        // Abaikan jika network error
      }
    }

    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  async function manualCheck() {
    setChecking(true)
    try {
      const r = await fetch('/api/auth/me', { cache: 'no-store' })
      if (r.status !== 503) {
        window.location.href = '/'
      }
    } finally {
      setTimeout(() => setChecking(false), 1000)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030305",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .bg-gradient-blob {
          position: absolute;
          width: 60vw;
          height: 60vw;
          max-width: 600px;
          max-height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
          animation: pulse-glow 8s ease-in-out infinite;
          pointer-events: none;
        }
        .glass-card {
          position: relative;
          background: rgba(20, 20, 30, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 48px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }
        .icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 32px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2));
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 32px rgba(139, 92, 246, 0.3);
          position: relative;
        }
        .icon-wrapper::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, #8b5cf6, transparent, #6366f1);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .title-gradient {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          font-size: 15px;
          margin-bottom: 32px;
        }
        .status-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #f59e0b;
          border-radius: 50%;
          box-shadow: 0 0 12px #f59e0b;
          animation: pulse-glow 2s infinite;
        }
        .btn-check {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-check:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .btn-check:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .spin { animation: spin-slow 1s linear infinite; }
        .slow-spin { animation: spin-slow 8s linear infinite; }
      `}</style>

      {/* Background Ornaments */}
      <div className="bg-gradient-blob" style={{ top: '-10%', left: '-10%' }} />
      <div className="bg-gradient-blob" style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', animationDelay: '-4s' }} />

      <div className="glass-card">
        <div className="icon-wrapper">
          <Settings size={36} color="#c4b5fd" className="slow-spin" />
        </div>

        <h1 className="title-gradient">Sistem Sedang<br/>Ditingkatkan</h1>
        
        <p className="subtitle">
          Kami sedang melakukan pemeliharaan rutin untuk meningkatkan performa dan stabilitas server. Website akan segera kembali online dalam beberapa saat.
        </p>

        <div className="status-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="status-dot" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fcd34d' }}>MAINTENANCE AKTIF</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Auto-refresh menyala{dots}</div>
            </div>
          </div>
          <button className="btn-check" onClick={manualCheck} disabled={checking}>
            <RefreshCcw size={14} className={checking ? 'spin' : ''} />
            {checking ? 'Mengecek...' : 'Cek Status'}
          </button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <ShieldAlert size={14} />
            Akses Panel Admin <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
