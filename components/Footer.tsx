'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  const [showSupport, setShowSupport] = useState(false)

  // Download QRIS as JPG
  const downloadJPG = async () => {
    const a = document.createElement('a')
    a.href = '/qris-support.png'
    a.download = 'QRIS-ApaAjaGwBisaKo.jpg'
    a.click()
  }

  // Download QRIS as PDF via canvas
  const downloadPDF = async () => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = '/qris-support.png?t=' + Date.now()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej })

      const canvas = document.createElement('canvas')
      const scale = 2
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, img.naturalWidth, img.naturalHeight)
      ctx.drawImage(img, 0, 0)

      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      // Build minimal PDF manually (no external lib needed)
      const w = img.naturalWidth
      const h = img.naturalHeight
      // Use jsPDF via CDN-free approach: just wrap image in a simple PDF blob
      const pdfW = 595  // A4 width in pts
      const pdfH = Math.round(h / w * pdfW)

      // Create a temporary link with data URL for PDF using print approach
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html><html><head>
          <title>QRIS ApaAjaGwBisaKo</title>
          <style>*{margin:0;padding:0} body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}
          img{max-width:100%;max-height:100vh;object-fit:contain}</style>
          </head><body>
          <img src="${imgData}" />
          <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1000)}<\/script>
          </body></html>`)
        printWindow.document.close()
      }
    } catch (e) {
      // fallback: just download the image
      downloadJPG()
    }
  }

  return (
    <footer className="fxc-footer">
      <div className="footer-inner">

        {/* Top glow beam */}
        <div className="footer-beam" />

        {/* Main grid */}
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <div className="footer-logo-ring">
                <img src="/logo.png" alt="FXCommunity" className="footer-logo" />
              </div>
              <div className="footer-brand-text">
                <span className="footer-brand-name">FXCOMMUNITY</span>
                <span className="footer-brand-sub">Trading Education</span>
              </div>
            </div>
            <p className="footer-desc">
              Platform edukasi trading &amp; komunitas digital terpercaya. Akses materi premium dan tingkatkan skill trading kamu.
            </p>
            <div className="footer-socials">
              <a href="https://wa.me/62895404147521" target="_blank" rel="noreferrer" className="footer-social wa" aria-label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>WhatsApp</span>
              </a>
              <a href="mailto:r0895404147521@gmail.com" className="footer-social mail" aria-label="Email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigasi</h4>
            <ul className="footer-links">
              <li><Link href="/" className="footer-link">Beranda</Link></li>
              <li><Link href="/populer" className="footer-link">Populer</Link></li>
              <li><Link href="/music" className="footer-link">Music</Link></li>
              <li><Link href="/report" className="footer-link">Laporan</Link></li>
            </ul>
          </div>

          {/* Akun */}
          <div className="footer-col">
            <h4 className="footer-col-title">Akun</h4>
            <ul className="footer-links">
              <li><Link href="/login" className="footer-link">Masuk</Link></li>
              <li><Link href="/login?tab=register" className="footer-link">Daftar</Link></li>
              <li><Link href="/dashboard" className="footer-link">Dashboard</Link></li>
              <li><Link href="/profile" className="footer-link">Profil</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h4 className="footer-col-title">Legal &amp; Bantuan</h4>
            <ul className="footer-links">
              <li><Link href="/report" className="footer-link">Kirim Laporan</Link></li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
                  className="footer-link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}
                >
                  Hubungi Kami
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowSupport(true)}
                  className="footer-link footer-support-btn"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f87171', flexShrink: 0 }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Support Developer
                </button>
              </li>
            </ul>
            {/* Risk Badge */}
            <div className="footer-risk-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Trading melibatkan risiko tinggi</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span className="footer-copy">© {year} FXCOMMUNITY. All rights reserved.</span>
          <span className="footer-disclaimer">Investasi mengandung risiko. Lakukan riset sebelum berinvestasi.</span>
        </div>
      </div>

      {/* ── Support Developer Modal ── */}
      {showSupport && (
        <div className="support-modal-overlay" onClick={() => setShowSupport(false)}>
          <div className="support-modal-card" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="support-modal-header">
              <div className="support-heart-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#f87171" stroke="#f87171" strokeWidth="1">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="support-modal-title">Support Developer Kecil</h3>
                <p className="support-modal-sub">Terima kasih telah menggunakan FX Community!</p>
              </div>
              {/* Close X */}
              <button
                onClick={() => setShowSupport(false)}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Description */}
            <p className="support-modal-desc">
              Platform ini dikembangkan secara independen. Donasi kecilmu sangat berarti untuk keberlanjutan pengembangan!
            </p>

            {/* QRIS Image */}
            <div className="support-qris-card">
              <img src="/qris-support.png" alt="QRIS ApaAjaGwBisaKo" className="support-qris-img" />
            </div>

            {/* Info */}
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <div className="support-qris-name">ApaAjaGwBisaKo</div>
              <div className="support-qris-nmid">NMID: ID1026515052896</div>
            </div>

            {/* Download row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <button className="support-dl-btn support-dl-jpg" onClick={downloadJPG}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Download JPG
              </button>
              <button className="support-dl-btn support-dl-pdf" onClick={downloadPDF}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                Download PDF
              </button>
            </div>

            {/* Close full-width */}
            <button className="support-modal-btn" onClick={() => setShowSupport(false)}>
              Tutup 🙏 Terima kasih!
            </button>

          </div>
        </div>
      )}

      <style jsx>{`
        .fxc-footer {
          position: relative;
          background: linear-gradient(180deg, #0a0a14 0%, #060610 100%);
          border-top: 1px solid rgba(0,229,255,0.08);
          overflow: hidden;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        /* Mobile nav spacer */
        @media (max-width: 768px) {
          .fxc-footer { padding-bottom: 80px; }
        }

        .footer-beam {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00E5FF, #7C3AED, transparent);
          opacity: 0.6;
        }

        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 32px 40px;
        }

        /* ── GRID ── */
        .footer-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
        }

        @media (max-width: 560px) {
          .footer-inner { padding: 48px 20px 32px; }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
          }
        }

        /* ── BRAND ── */
        .footer-logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .footer-logo-ring {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.2));
          border: 1px solid rgba(0,229,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .footer-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .footer-brand-text {
          display: flex;
          flex-direction: column;
        }

        .footer-brand-name {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #00E5FF, #7C3AED);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .footer-brand-sub {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .footer-desc {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.45);
          margin-bottom: 20px;
        }

        /* ── SOCIALS ── */
        .footer-socials {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .footer-social {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid;
        }

        .footer-social.wa {
          color: #25D366;
          border-color: rgba(37,211,102,0.2);
          background: rgba(37,211,102,0.06);
        }

        .footer-social.wa:hover {
          background: rgba(37,211,102,0.14);
          border-color: rgba(37,211,102,0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(37,211,102,0.15);
        }

        .footer-social.mail {
          color: #00E5FF;
          border-color: rgba(0,229,255,0.2);
          background: rgba(0,229,255,0.06);
        }

        .footer-social.mail:hover {
          background: rgba(0,229,255,0.12);
          border-color: rgba(0,229,255,0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,229,255,0.12);
        }

        /* ── COLUMNS ── */
        .footer-col-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-link {
          font-size: 13.5px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .footer-link::before {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(0,229,255,0.3);
          flex-shrink: 0;
          transition: all 0.18s ease;
        }

        .footer-support-btn::before {
          background: rgba(248,113,113,0.4) !important;
        }

        .footer-link:hover {
          color: #00E5FF;
          transform: translateX(3px);
        }

        .footer-support-btn:hover {
          color: #f87171 !important;
        }

        .footer-link:hover::before {
          background: #00E5FF;
          box-shadow: 0 0 6px rgba(0,229,255,0.6);
        }

        .footer-support-btn:hover::before {
          background: #f87171 !important;
          box-shadow: 0 0 6px rgba(248,113,113,0.6) !important;
        }

        /* ── RISK BADGE ── */
        .footer-risk-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 20px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.18);
          color: rgba(245,158,11,0.7);
          font-size: 11px;
          font-weight: 600;
          line-height: 1.4;
        }

        /* ── DIVIDER ── */
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent);
          margin-bottom: 28px;
        }

        /* ── BOTTOM ── */
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-copy {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
        }

        .footer-disclaimer {
          font-size: 11px;
          color: rgba(255,255,255,0.22);
          text-align: right;
        }

        @media (max-width: 560px) {
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .footer-disclaimer { text-align: left; }
        }

        /* ══════════════════════════════════
           SUPPORT DEVELOPER MODAL
        ══════════════════════════════════ */
        .support-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: supportFadeIn 0.22s ease;
        }

        @keyframes supportFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .support-modal-card {
          position: relative;
          background: linear-gradient(145deg, rgba(13,17,32,0.98), rgba(8,11,20,0.99));
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          padding: 28px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(248,113,113,0.05);
          animation: supportSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        @keyframes supportSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }




        .support-modal-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .support-heart-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          animation: heartPulse 1.8s ease-in-out infinite;
        }

        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .support-modal-title {
          font-size: 18px;
          font-weight: 800;
          color: #f0f4ff;
          margin: 0 0 3px;
        }

        .support-modal-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }

        .support-modal-desc {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.55);
          margin-bottom: 20px;
          padding: 14px;
          background: rgba(248,113,113,0.04);
          border: 1px solid rgba(248,113,113,0.1);
          border-radius: 12px;
        }

        .support-qris-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .support-qris-card {
          width: 100%;
          background: #ffffff;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .support-qris-img {
          width: 100%;
          max-width: 260px;
          height: auto;
          display: block;
          border-radius: 8px;
        }

        .support-qris-info {
          text-align: center;
        }

        .support-qris-name {
          font-size: 16px;
          font-weight: 800;
          color: #f0f4ff;
          margin-bottom: 3px;
        }

        .support-qris-nmid {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        .support-qris-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          padding: 5px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
        }

        .support-modal-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1px solid rgba(248,113,113,0.2);
          background: rgba(248,113,113,0.08);
          color: #f87171;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .support-modal-btn:hover {
          background: rgba(248,113,113,0.15);
          border-color: rgba(248,113,113,0.35);
          transform: translateY(-1px);
        }

        .support-dl-btn {
          flex: 1;
          padding: 12px 8px;
          border-radius: 12px;
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .support-dl-jpg {
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.25);
          color: #60a5fa;
        }
        .support-dl-jpg:hover {
          background: rgba(59,130,246,0.18);
          border-color: rgba(59,130,246,0.4);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(59,130,246,0.15);
        }

        .support-dl-pdf {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.22);
          color: #f87171;
        }
        .support-dl-pdf:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.38);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(239,68,68,0.12);
        }

        @media (max-width: 480px) {
          .support-modal-card { padding: 22px 18px; border-radius: 20px; }
          .support-modal-title { font-size: 16px; }
          .support-action-row { grid-template-columns: 1fr 1fr; }
          .support-modal-btn { grid-column: 1 / -1; }
        }
      `}</style>
    </footer>
  )
}
