'use client'
import Link from 'next/link'

const WA_LOGO = 'https://cdn.simpleicons.org/whatsapp/25D366'
const EMAIL_LOGO = 'https://cdn.simpleicons.org/gmail/EA4335'

export default function Footer() {
  return (
    <footer style={{
      background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.12), transparent 40%), radial-gradient(ellipse at bottom right, rgba(168,85,247,0.12), transparent 40%), linear-gradient(135deg, #0f0a1f 0%, #1a0a2e 100%)',
      borderTop: '1px solid rgba(99, 102, 241, 0.2)',
      padding: '50px 20px 32px',
      marginTop: '60px',
      color: '#e5e7eb'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#fff'
                }}>
                  📈
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    margin: '0 0 2px 0',
                    color: '#fff'
                  }}>
                    FX Community
                  </h3>
                  <p style={{
                    fontSize: '11px',
                    color: '#a855f7',
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: '1px'
                  }}>
                    Premium Platform
                  </p>
                </div>
              </div>
              <p style={{
                fontSize: '13px',
                color: '#9ca3af',
                lineHeight: '1.6',
                margin: 0
              }}>
                Platform Edukasi Trading & Komunitas Digital Terpercaya
              </p>
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: '18px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📚</span> Navigasi Utama
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}><Link href="/" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Homepage</Link></li>
              <li style={{ marginBottom: '10px' }}><Link href="/library" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Library</Link></li>
              <li style={{ marginBottom: '10px' }}><Link href="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Dashboard</Link></li>
              <li style={{ marginBottom: '10px' }}><Link href="/about" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Tentang Kami</Link></li>
              <li><Link href="/profile" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Profil</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: '18px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>👤</span> Akun
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}><Link href="/login" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Login</Link></li>
              <li style={{ marginBottom: '10px' }}><Link href="/register" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Register</Link></li>
              <li style={{ marginBottom: '10px' }}><Link href="/settings" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Pengaturan</Link></li>
              <li style={{ marginBottom: '10px' }}><Link href="/forgot-password" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Lupa Password</Link></li>
              <li><Link href="/reset-password" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Reset Password</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: '18px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>💬</span> Hubungi Kami
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="https://wa.me/62895404147521" target="_blank" rel="noreferrer" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <img src={WA_LOGO} alt="WhatsApp" style={{ width: 20, height: 20 }} /> WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:r0895404147521@gmail.com" style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <img src={EMAIL_LOGO} alt="Email" style={{ width: 20, height: 20 }} /> Email
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '18px', color: '#fff' }}>
              Bantuan & Legal
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}><Link href="/faq" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>FAQ</Link></li>
              <li style={{ marginBottom: '10px' }}><Link href="/privacy" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Kebijakan Privasi</Link></li>
              <li><Link href="/terms" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '13px' }}>Syarat & Ketentuan</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

