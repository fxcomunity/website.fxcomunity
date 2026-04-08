'use client'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  const navLinks = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Library', href: '/library' },
    { label: 'Popular', href: '/popular' },
    { label: 'Favorites', href: '/favorites' },
    { label: 'Profile', href: '/profile' },
  ]

  const accountLinks = [
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' },
    { label: 'Pengaturan', href: '/settings' },
    { label: 'Lupa Password', href: '/forgot-password' },
  ]

  const legalLinks = [
    { label: 'FAQ', href: '/faq' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Kirim Laporan', href: '/report' },
  ]

  const linkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    display: 'block',
    padding: '4px 0',
    transition: 'color 0.2s',
  }

  return (
    <footer style={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,10,26,0.98) 100%)',
      borderTop: '1px solid rgba(0,229,255,0.08)',
      marginTop: '60px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow accent */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '-80px', left: '10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'rgba(0,229,255,0.03)', filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '-60px', right: '10%',
        width: '250px', height: '250px', borderRadius: '50%',
        background: 'rgba(168,85,247,0.04)', filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '52px 24px 32px' }}>
        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '40px 32px',
          marginBottom: '44px',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <img 
                src="/logo.png" 
                alt="FXC Logo" 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 6px 24px rgba(0, 229, 255, 0.4)',
                  filter: 'drop-shadow(0 0 12px rgba(0, 229, 255, 0.3))',
                }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff', letterSpacing: '1px' }}>FXCOMUNITY</div>
                <div style={{ fontSize: '10px', color: 'var(--primary, #00E5FF)', fontWeight: 600, letterSpacing: '1.5px' }}>TRADING EDUCATION</div>
              </div>
            </Link>
            <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: '0 0 20px', maxWidth: '220px' }}>
              Platform edukasi trading & komunitas digital terpercaya untuk trader Indonesia.
            </p>
            {/* Social/Contact */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="https://wa.me/62895404147521"
                target="_blank" rel="noreferrer"
                title="WhatsApp"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.2)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,211,102,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,211,102,0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a
                href="mailto:r0895404147521@gmail.com"
                title="Email"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(234,67,53,0.1)', border: '1px solid rgba(234,67,53,0.2)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(234,67,53,0.2)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(234,67,53,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(234,67,53,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(234,67,53,0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(0,229,255,0.8)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px', margin: '0 0 16px' }}>Navigasi</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00E5FF')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(0,229,255,0.8)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px', margin: '0 0 16px' }}>Akun</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {accountLinks.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00E5FF')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(0,229,255,0.8)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px', margin: '0 0 16px' }}>Legal & Bantuan</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {legalLinks.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00E5FF')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  >{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)', marginBottom: '24px' }} />

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            © {year} <span style={{ color: 'rgba(0,229,255,0.5)', fontWeight: 700 }}>FXCOMUNITY</span>. All rights reserved.
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Trading involves risk. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  )
}
