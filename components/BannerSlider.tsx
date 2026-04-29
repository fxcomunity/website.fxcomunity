'use client'
import { useEffect, useState } from 'react'

interface Banner {
  id: number
  title: string
  description: string | null
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url: string | null
  alt_text: string | null
  target_url: string | null
  target_blank: boolean
  priority: number
}

export default function BannerSlider({ variant = 'grid' }: { variant?: 'grid' | 'hero' }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [paused, setPaused] = useState(false)

  async function fetchBanners() {
    try {
      const r = await fetch('/api/banners', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
      const data = await r.json()
      const list = Array.isArray(data) ? data : Array.isArray(data?.banners) ? data.banners : Array.isArray(data?.data) ? data.data : []
      setBanners(list)
    } catch {
      setBanners([])
    }
  }

  useEffect(() => {
    // Fetch langsung saat load
    fetchBanners()

    // Polling setiap 30 detik supaya real-time
    const interval = setInterval(fetchBanners, 30_000)

    // Refresh saat user kembali ke tab
    const onVisible = () => { if (document.visibilityState === 'visible') fetchBanners() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  
  if (!banners.length) return null
  const loopBanners = [...banners, ...banners]

  return (
    <>
      <style>{`
        .banner-wrap { max-width: 1200px; margin: 0 auto; padding: 0 20px ${variant === 'hero' ? '0' : '24px'}; }
        .banner-grid { display: grid; gap: 12px; }
        @media (max-width: 640px) { .banner-grid { grid-template-columns: 1fr; } }
        @media (min-width: 641px) and (max-width: 1024px) { .banner-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1025px) { .banner-grid { grid-template-columns: repeat(3, 1fr); } }
        .banner-card { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); }
        .banner-media { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
        .banner-caption { position: absolute; bottom: 8px; left: 8px; right: 8px; background: rgba(0,0,0,0.5); color: #fff; border-radius: 8px; padding: 8px 10px; }
        .banner-title { font-size: 13px; font-weight: 700; }
        .banner-desc { font-size: 11px; color: rgba(255,255,255,0.85); }

        .hero { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); }
        .hero-track { display: flex; gap: 12px; width: max-content; padding: 10px; animation: heroScroll 24s linear infinite; }
        .hero-item { width: min(430px, 86vw); position: relative; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); flex: 0 0 auto; }
        .hero-media { width: 100%; height: clamp(220px, 33vh, 360px); object-fit: cover; display: block; }
        .hero-caption { position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(0,0,0,0.45); color: #fff; border-radius: 10px; padding: 10px 12px; }
        @keyframes heroScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
      <div className="banner-wrap">
        {variant === 'grid' ? (
          <div className="banner-grid">
            {banners.map(b => {
          const content = b.media_type === 'video' ? (
            <video src={b.media_url} poster={b.thumbnail_url || undefined} autoPlay muted loop className="banner-media" />
          ) : (
            <img src={b.media_url} alt={b.alt_text || b.title} loading="lazy" className="banner-media" />
          )
          const inner = (
            <div className="banner-card">
              {content}
              <div className="banner-caption">
                <div className="banner-title">{b.title}</div>
                {b.description && <div className="banner-desc">{b.description}</div>}
              </div>
            </div>
          )
          return b.target_url ? (
            <a key={b.id} href={b.target_url} target={b.target_blank ? '_blank' : '_self'} rel="noreferrer" style={{ textDecoration: 'none' }}>
              {inner}
            </a>
          ) : (
            <div key={b.id}>{inner}</div>
          )
            })}
          </div>
        ) : (
          <div className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="hero-track" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
              {loopBanners.map((b, idx) => {
                const content = b.media_type === 'video'
                  ? <video src={b.media_url} poster={b.thumbnail_url || undefined} autoPlay muted loop className="hero-media" />
                  : <img src={b.media_url} alt={b.alt_text || b.title} loading="lazy" className="hero-media" />
                const item = (
                  <div className="hero-item" key={`${b.id}-${idx}`}>
                    {content}
                    <div className="hero-caption">
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{b.title}</div>
                      {b.description && <div style={{ fontSize: 12, opacity: 0.9 }}>{b.description}</div>}
                    </div>
                  </div>
                )
                return b.target_url
                  ? <a key={`a-${b.id}-${idx}`} href={b.target_url} target={b.target_blank ? '_blank' : '_self'} rel="noreferrer" style={{ textDecoration: 'none' }}>{item}</a>
                  : item
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
