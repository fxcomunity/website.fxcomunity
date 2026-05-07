"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'

type Banner = {
  id: number
  title?: string
  description?: string
  media_type?: 'image' | 'video'
  media_url?: string
  thumbnail_url?: string
  alt_text?: string
  target_url?: string
  target_blank?: boolean
}

interface Props { variant?: 'grid' | 'hero' }

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');

  .bs-root { width: 100%; font-family: 'DM Sans', sans-serif; margin-bottom: 16px; margin-top: 16px; }

  /* ── GRID ── */
  .bs-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  .bs-grid-card {
    border-radius: 10px;
    overflow: hidden;
    background: #111827;
    aspect-ratio: 16/9;
    position: relative;
  }
  .bs-grid-card img,
  .bs-grid-card video {
    width: 100%; height: 100%; object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .bs-grid-card:hover img,
  .bs-grid-card:hover video { transform: scale(1.05); }

  /* ── HERO WRAPPER ── */
  .bs-hero {
    position: relative;
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    user-select: none;
    --accent: #e53e3e;
    --track-bg: rgba(0,0,0,0.35);
  }

  /* track */
  .bs-track {
    display: flex;
    overflow: hidden;
    width: 100%;
  }

  /* slides */
  .bs-slides {
    display: flex;
    width: 100%;
    transition: transform 0.55s cubic-bezier(0.77, 0, 0.175, 1);
    will-change: transform;
  }

  .bs-slide {
    flex: 0 0 100%;
    position: relative;
    overflow: hidden;
    border-radius: 14px;
    background: #0d1117;
  }

  /* single banner centered */
  .bs-single .bs-slide {
    border-radius: 14px;
  }

  /* media */
  .bs-media {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    image-rendering: high-quality;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  /* overlay gradient at bottom */
  .bs-slide::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 45%,
      rgba(0,0,0,0.55) 100%
    );
    pointer-events: none;
    border-radius: inherit;
  }

  /* caption */
  .bs-caption {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 14px 16px 12px;
    z-index: 2;
  }
  .bs-caption-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(14px, 2.5vw, 20px);
    color: #fff;
    letter-spacing: 0.04em;
    line-height: 1.1;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    margin: 0 0 3px;
  }
  .bs-caption-desc {
    font-size: 11px;
    color: rgba(255,255,255,0.72);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── ARROWS ── */
  .bs-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 30px; height: 30px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #fff;
    transition: background 0.2s, transform 0.2s;
    padding: 0;
  }
  .bs-arrow:hover {
    background: var(--accent);
    transform: translateY(-50%) scale(1.08);
  }
  .bs-arrow-prev { left: 8px; }
  .bs-arrow-next { right: 8px; }
  .bs-arrow svg { width: 14px; height: 14px; }

  /* hide arrows if only 1 */
  .bs-single .bs-arrow { display: none; }

  /* ── DOTS ── */
  .bs-dots {
    display: flex;
    gap: 5px;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
  }
  .bs-dot {
    width: 18px; height: 3px;
    border-radius: 999px;
    background: rgba(255,255,255,0.2);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.3s, width 0.3s;
  }
  .bs-dot.active {
    width: 28px;
    background: var(--accent, #e53e3e);
  }
  .bs-dot:hover:not(.active) { background: rgba(255,255,255,0.45); }

  /* single → hide dots */
  .bs-single .bs-dots { display: none; }

  /* ── ASPECT RATIO responsive ── */
  .bs-track-wrap {
    position: relative;
    width: 100%;
  }

  /* slide height: landscape or portrait computed dynamically via style */
  .bs-slide-inner {
    width: 100%;
    overflow: hidden;
    border-radius: 14px;
  }

  /* link wrap */
  .bs-link { display: block; width: 100%; height: 100%; }

  @media (max-width: 600px) {
    .bs-arrow { width: 26px; height: 26px; }
    .bs-arrow svg { width: 12px; height: 12px; }
    .bs-arrow-prev { left: 5px; }
    .bs-arrow-next { right: 5px; }
  }
`

function ArrowIcon({ dir }: { dir: 'prev' | 'next' }) {
  return dir === 'prev' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default function BannerSlider({ variant = 'hero' }: Props) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [ratios, setRatios] = useState<Record<number, number>>({})
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)

  // ── Fetch ──
  useEffect(() => {
    let mounted = true
    async function fetchBanners() {
      try {
        const r = await fetch('/api/banners', { cache: 'no-store' })
        const data = await r.json()
        const list: Banner[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.banners)
            ? data.banners
            : Array.isArray(data?.data)
              ? data.data
              : []
        if (!mounted) return
        setBanners(list)
        const newRatios: Record<number, number> = {}
        await Promise.all(list.map(b => new Promise<void>(resolve => {
          const src = b.media_type === 'video' ? (b.thumbnail_url || b.media_url) : b.media_url
          if (!src) { newRatios[b.id] = 16 / 9; return resolve() }
          const img = new window.Image()
          img.onload = () => { newRatios[b.id] = img.width / img.height || 16 / 9; resolve() }
          img.onerror = () => { newRatios[b.id] = 16 / 9; resolve() }
          img.src = src
        })))
        if (mounted) setRatios(newRatios)
      } catch { if (mounted) setBanners([]) }
    }
    fetchBanners()
    const id = setInterval(fetchBanners, 30_000)
    const onVis = () => { if (document.visibilityState === 'visible') fetchBanners() }
    document.addEventListener('visibilitychange', onVis)
    return () => { mounted = false; clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  // ── Auto-play ──
  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
  }, [])

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % Math.max(1, banners.length))
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + banners.length) % Math.max(1, banners.length))
  }, [banners.length])

  useEffect(() => {
    if (variant !== 'hero' || banners.length <= 1) return
    if (timerRef.current) clearInterval(timerRef.current)
    if (!paused) {
      timerRef.current = setInterval(next, 4500)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, banners.length, next, variant])

  // ── Touch swipe ──
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev() }
    touchStartX.current = null
  }

  if (!banners.length) return null

  const isSingle = banners.length === 1

  if (variant === 'grid') {
    return (
      <div className="bs-root">
        <style>{CSS}</style>
        <div className="bs-grid">
          {banners.map(b => (
            <a
              key={b.id}
              className="bs-grid-card"
              href={b.target_url || '#'}
              target={b.target_blank ? '_blank' : undefined}
              rel="noopener noreferrer"
            >
              {b.media_type === 'video'
                ? <video src={b.media_url} poster={b.thumbnail_url || undefined} muted playsInline className="bs-media" />
                : <img src={b.media_url} alt={b.alt_text || b.title || ''} className="bs-media" />}
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bs-root">
      <style>{CSS}</style>
      <div
        className={`bs-hero${isSingle ? ' bs-single' : ''}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* track */}
        <div className="bs-track-wrap">
          <div
            className="bs-track"
            style={{ borderRadius: 14, height: 'clamp(180px, 30vw, 340px)', width: '100%' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="bs-slides"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {banners.map((b, i) => {
                const inner = (
                  <>
                    {b.media_type === 'video'
                      ? <video
                          src={b.media_url}
                          poster={b.thumbnail_url || undefined}
                          autoPlay muted loop playsInline
                          className="bs-media"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      : <img
                          src={b.media_url}
                          alt={b.alt_text || b.title || ''}
                          className="bs-media"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', imageRendering: 'high-quality' as any }}
                          loading={i === 0 ? 'eager' : 'lazy'}
                        />}

                  </>
                )

                return (
                  <div key={`${b.id}-${i}`} className="bs-slide">
                    {b.target_url
                      ? <a href={b.target_url} target={b.target_blank ? '_blank' : undefined} rel="noopener noreferrer" className="bs-link">{inner}</a>
                      : inner}
                  </div>
                )
              })}
            </div>
          </div>

          {/* arrows */}
          {!isSingle && (
            <>
              <button className="bs-arrow bs-arrow-prev" onClick={prev} aria-label="Previous">
                <ArrowIcon dir="prev" />
              </button>
              <button className="bs-arrow bs-arrow-next" onClick={next} aria-label="Next">
                <ArrowIcon dir="next" />
              </button>
            </>
          )}
        </div>

        {/* dots */}
        {!isSingle && (
          <div className="bs-dots" role="tablist" aria-label="Slides">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`bs-dot${i === current ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                role="tab"
                aria-selected={i === current}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}