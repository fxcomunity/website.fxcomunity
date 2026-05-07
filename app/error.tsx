'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.error(error)
  }, [error])

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #080B14 0%, #0d1526 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `
          radial-gradient(circle at 20% 50%, rgba(239,68,68,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(168,85,247,0.08) 0%, transparent 50%)
        `,
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Main container */}
      <div style={{
        textAlign: 'center',
        maxWidth: '560px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Error Number */}
        <div style={{
          fontSize: 'clamp(80px, 20vw, 200px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 20px',
          letterSpacing: '-2px',
          lineHeight: 1,
          animation: 'slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          ⚠️
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 14px',
          letterSpacing: '-0.5px',
          animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both',
        }}>
          Terjadi Kesalahan Server
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 28px',
          lineHeight: '1.6',
          animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
        }}>
          Maaf, terjadi kesalahan tak terduga pada server kami. 
          <br />
          Tim kami telah diberitahu dan sedang menangani masalah ini.
        </p>

        {/* Error Details */}
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '28px',
          animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
          maxHeight: '120px',
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(239,68,68,0.9)',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            textAlign: 'left',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Error Details:</div>
            <div style={{ fontSize: '11px' }}>
              {error?.message || 'Unknown error occurred'}
              {error?.digest && <div style={{ marginTop: '4px', opacity: 0.7 }}>Digest: {error.digest}</div>}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both',
        }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(239,68,68,0.4)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(239,68,68,0.3)'
            }}
          >
            🔄 Coba Lagi
          </button>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'
              }}
            >
              🏠 Ke Beranda
            </button>
          </Link>
        </div>

        {/* Helpful info */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(168,85,247,0.08)',
          border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: '14px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: '1.6',
        }}>
          <strong style={{ color: '#C084FC' }}>💡 Tips:</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px', textAlign: 'left' }}>
            <li>Coba refresh halaman</li>
            <li>Pastikan koneksi internet stabil</li>
            <li>Coba lagi dalam beberapa saat</li>
          </ul>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          color-scheme: dark;
        }
      `}</style>
    </div>
  )
}
