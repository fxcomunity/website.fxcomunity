'use client'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="fxc-footer">
      {/* Animated gradient line */}
      <div className="footer-gradient-line" />

      {/* Decorative top glow */}
      <div className="footer-top-glow" />

      <div className="footer-main">
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <div className="footer-logo-wrap">
                <img src="/logo.png" alt="FXCommunity Logo" className="footer-logo" />
                <div className="footer-logo-pulse" />
              </div>
              <div>
                <div className="footer-brand-name">FXCOMMUNITY</div>
                <div className="footer-brand-tag">TRADING EDUCATION</div>
              </div>
            </div>
            <p className="footer-brand-desc">
              Platform edukasi trading & komunitas digital terpercaya untuk trader Indonesia.
              Akses materi premium dan tingkatkan skill trading Anda.
            </p>
            <div className="footer-socials">
              <a href="https://wa.me/62895404147521" target="_blank" rel="noreferrer" className="footer-social-btn footer-social-wa" title="WhatsApp" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="mailto:r0895404147521@gmail.com" className="footer-social-btn footer-social-mail" title="Email" aria-label="Email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div className="footer-col">
            <h4 className="footer-col-title">
              <span className="footer-col-dot" style={{ background: '#00E5FF' }} />
              Navigasi
            </h4>
            <ul className="footer-links">
              <li><Link href="/dashboard">Home</Link></li>
              <li><Link href="/library">Library</Link></li>
              <li><Link href="/popular">Popular</Link></li>
              <li><Link href="/music">Music</Link></li>
              <li><Link href="/favorites">Favorites</Link></li>
            </ul>
          </div>

          {/* Akun */}
          <div className="footer-col">
            <h4 className="footer-col-title">
              <span className="footer-col-dot" style={{ background: '#A855F7' }} />
              Akun
            </h4>
            <ul className="footer-links">
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/register">Register</Link></li>
              <li><Link href="/profile">Profile</Link></li>
              <li><Link href="/settings">Pengaturan</Link></li>
              <li><Link href="/forgot-password">Lupa Password</Link></li>
            </ul>
          </div>

          {/* Legal & Bantuan */}
          <div className="footer-col">
            <h4 className="footer-col-title">
              <span className="footer-col-dot" style={{ background: '#F59E0B' }} />
              Legal & Bantuan
            </h4>
            <ul className="footer-links">
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/privacy">Kebijakan Privasi</Link></li>
              <li><Link href="/terms">Syarat & Ketentuan</Link></li>
              <li><Link href="/report">Kirim Laporan</Link></li>
              <li><Link href="/about">Tentang Kami</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <span className="footer-copy-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9.354a4 4 0 1 0 0 5.292"/></svg>
            </span>
            <span>{year} <strong>FXCOMMUNITY</strong></span>
            <span className="footer-sep">•</span>
            <span>All rights reserved.</span>
          </div>
          <div className="footer-disclaimer">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Trading involves risk. Trade responsibly.</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── FOOTER BASE ── */
        .fxc-footer {
          background: linear-gradient(180deg, #060912 0%, #030508 100%);
          position: relative;
          overflow: hidden;
          margin-top: auto;
          padding-bottom: 0;
        }

        /* Gradient Top Line */
        .footer-gradient-line {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #00B8D4 20%, #7C3AED 50%, #00E5FF 80%, transparent 100%);
          opacity: 0.5;
        }

        /* Decorative glow behind the footer */
        .footer-top-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, rgba(124,58,237,0.03) 40%, transparent 70%);
          pointer-events: none;
        }

        /* ── MAIN CONTAINER ── */
        .footer-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 52px 28px 24px;
          position: relative;
          z-index: 1;
        }

        /* ── GRID ── */
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr repeat(3, 1fr);
          gap: 48px;
        }

        /* ── BRAND ── */
        .footer-logo-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .footer-logo-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .footer-logo {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          object-fit: cover;
          border: 2px solid rgba(0,229,255,0.25);
          position: relative;
          z-index: 1;
        }
        .footer-logo-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15));
          animation: logoPulse 3s ease-in-out infinite;
          z-index: 0;
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        .footer-brand-name {
          font-size: 17px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #fff;
        }
        .footer-brand-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          background: linear-gradient(90deg, #00E5FF, #A855F7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-top: 2px;
        }
        .footer-brand-desc {
          color: rgba(139,156,200,0.6);
          font-size: 13px;
          line-height: 1.75;
          margin-bottom: 22px;
          max-width: 300px;
        }

        /* ── SOCIAL BUTTONS ── */
        .footer-socials {
          display: flex;
          gap: 10px;
        }
        .footer-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .footer-social-wa:hover {
          background: rgba(37,211,102,0.12);
          border-color: rgba(37,211,102,0.35);
          color: #25D366;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(37,211,102,0.15);
        }
        .footer-social-mail:hover {
          background: rgba(0,229,255,0.1);
          border-color: rgba(0,229,255,0.3);
          color: #00E5FF;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,229,255,0.12);
        }

        /* ── LINK COLUMNS ── */
        .footer-col-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.85);
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .footer-col-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 8px currentColor;
        }
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .footer-links a {
          color: rgba(139,156,200,0.55);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          position: relative;
        }
        .footer-links a::before {
          content: '';
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, #00E5FF, transparent);
          position: absolute;
          bottom: 3px;
          left: 0;
          transition: width 0.3s ease;
        }
        .footer-links a:hover {
          color: #00E5FF;
          transform: translateX(4px);
        }
        .footer-links a:hover::before {
          width: 100%;
        }

        /* ── DIVIDER ── */
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          margin: 36px 0 0;
        }

        /* ── BOTTOM BAR ── */
        .footer-bottom {
          padding: 20px 0 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .footer-copyright {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.25);
          font-size: 12px;
          font-weight: 500;
        }
        .footer-copy-icon {
          display: flex;
          align-items: center;
          color: rgba(0,229,255,0.3);
        }
        .footer-copyright strong {
          color: rgba(0,229,255,0.5);
          font-weight: 800;
        }
        .footer-sep { opacity: 0.2; }
        .footer-disclaimer {
          display: flex;
          align-items: center;
          gap: 5px;
          color: rgba(255,255,255,0.18);
          font-size: 11px;
        }

        /* ══════════════════════════════════════
           RESPONSIVE – TABLET (601px – 1024px)
        ══════════════════════════════════════ */
        @media (max-width: 1024px) {
          .footer-main {
            padding: 44px 24px 80px;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px 40px;
          }
          .footer-brand {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .footer-logo-row { justify-content: center; }
          .footer-brand-desc {
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          }
          .footer-socials { justify-content: center; }
          .footer-col-title { justify-content: center; }
          .footer-links { align-items: center; }
          .footer-links a:hover { transform: none; }
          .footer-links a::before { left: 50%; transform: translateX(-50%); }
        }

        /* ══════════════════════════════════════
           RESPONSIVE – MOBILE (≤ 600px)
        ══════════════════════════════════════ */
        @media (max-width: 600px) {
          .footer-main {
            padding: 36px 20px 84px;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px 20px;
          }
          .footer-brand {
            grid-column: 1 / -1;
            text-align: center;
          }
          .footer-logo-row { justify-content: center; }
          .footer-brand-name { font-size: 15px; letter-spacing: 1.5px; }
          .footer-logo {
            width: 42px;
            height: 42px;
            border-radius: 12px;
          }
          .footer-logo-pulse { border-radius: 16px; }
          .footer-brand-desc {
            font-size: 12px;
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 16px;
          }
          .footer-socials { justify-content: center; }
          .footer-social-btn {
            width: 38px;
            height: 38px;
          }
          .footer-col-title {
            font-size: 10px;
            margin-bottom: 14px;
            padding-bottom: 8px;
            justify-content: center;
          }
          .footer-links a {
            font-size: 12px;
            padding: 5px 0;
          }
          .footer-links { align-items: center; }
          .footer-links a:hover { transform: none; }
          .footer-links a::before { left: 50%; transform: translateX(-50%); }
          .footer-divider { margin: 24px 0 0; }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 6px;
            padding: 16px 0 4px;
          }
          .footer-copyright {
            justify-content: center;
            font-size: 11px;
            flex-wrap: wrap;
          }
          .footer-disclaimer {
            justify-content: center;
            font-size: 10px;
          }
        }

        /* ══════════════════════════════════════
            VERY SMALL SCREENS (≤ 360px)
        ══════════════════════════════════════ */
        @media (max-width: 360px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .footer-main {
            padding: 32px 16px 84px;
          }
        }
      `}</style>
    </footer>
  )
}
