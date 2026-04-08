'use client'
import Link from 'next/link'
import Notification from './Notification'

export default function GlobalNavbar() {
  return (
    <nav style={{
      height: '60px',
      background: '#0c0d14',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 99,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      justifyContent: 'space-between'
    }}>
      <Link href="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        textDecoration: 'none',
        fontWeight: 900,
        fontSize: '20px',
        color: '#fff',
        letterSpacing: '1px'
      }}>
        <img 
          src="/logo.png" 
          alt="FXC Logo" 
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 5px 18px rgba(0, 229, 255, 0.35)',
          }}
        />
        <span style={{ fontSize: '18px', letterSpacing: '1px', textTransform: 'uppercase' }}>FXCOMMUNITY</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Notification />
        <Link href="/login" style={{
          color: '#00E5FF',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '14px',
          padding: '6px 16px',
          border: '1px solid rgba(0,229,255,0.35)',
          borderRadius: '8px',
          transition: 'all 0.2s',
        }}>
          Login
        </Link>
      </div>
    </nav>
  )
}
