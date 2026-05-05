'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
          radial-gradient(circle at 20% 50%, rgba(0,229,255,0.1) 0%, transparent 50%),
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
        {/* 404 Number */}
        <div style={{
          fontSize: 'clamp(80px, 20vw, 200px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 20px',
          letterSpacing: '-2px',
          lineHeight: 1,
          animation: 'slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          404
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
          Halaman Tidak Ditemukan
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 28px',
          lineHeight: '1.6',
          animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
        }}>
          Oops! Sepertinya Anda mencoba mengakses halaman yang tidak ada atau sudah dihapus. 
          <br />
          Mari kembali ke halaman utama dan jelajahi konten lainnya.
        </p>

        {/* Error Details */}
        <div style={{
          background: 'rgba(0,229,255,0.08)',
          border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '28px',
          animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
        }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(0,229,255,0.9)',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
          }}>
            Endpoint tidak ditemukan atau kesalahan server (4xx/5xx)
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
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00E5FF, #00B8D4)',
              color: '#000',
              border: 'none',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(0,229,255,0.3)',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,229,255,0.4)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,229,255,0.3)'
              }}
            >
              🏠 Kembali ke Beranda
            </button>
          </Link>

          <Link href="/library" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              color: '#00E5FF',
              border: '1px solid rgba(0,229,255,0.3)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.12)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.5)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.3)'
              }}
            >
              📚 Ke Library
            </button>
          </Link>
        </div>

        {/* Fun illustration */}
        <div style={{
          marginTop: '40px',
          fontSize: '80px',
          animation: 'bounce 2s ease-in-out infinite',
        }}>
          🔍
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
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        * {
          color-scheme: dark;
        }
      `}</style>
    </div>
  )
}
