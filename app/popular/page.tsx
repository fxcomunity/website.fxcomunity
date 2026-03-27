'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserLayout from '@/components/UserLayout'

interface PDF {
  id: number; name: string; url: string; category: string
  thumbnail: string; views: number; downloads: number
  is_active: boolean; is_fav: boolean
}

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

const catColor = (cat: string) =>
  cat.includes('basic') ? '#00E5FF'
  : cat.includes('advanced') ? '#A855F7'
  : cat.includes('technical') ? '#F59E0B'
  : cat.includes('psychology') ? '#10B981'
  : '#6B7280'

export default function PopularPage() {
  const router = useRouter()
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'views' | 'downloads'>('views')
  const [viewPdf, setViewPdf] = useState<PDF | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (r.status === 503) router.push('/maintenance') })
      .catch(() => {})
    loadPDFs()
  }, [])

  async function loadPDFs() {
    setLoading(true)
    try {
      const res = await fetch('/api/pdfs')
      const data = await res.json()
      if (data.success) {
        setPdfs(data.data)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleOpen(pdf: PDF) {
    try {
      await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
      window.open(`/api/pdfs/${pdf.id}/view`, '_blank')
    } catch {}
  }

  const sorted = [...pdfs]
    .filter(p => p.is_active)
    .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0))
    .slice(0, 50)

  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <UserLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px 40px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)',
            borderRadius: '50px', padding: '5px 16px', marginBottom: '16px',
            fontSize: '12px', fontWeight: 800, color: '#FB923C', letterSpacing: '1px',
          }}>
            🔥 TRENDING NOW
          </div>
          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, marginBottom: '10px',
            background: 'linear-gradient(135deg, #fff 0%, #FB923C 60%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Materi Paling Populer</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
            PDF trading yang paling banyak dibaca & didownload komunitas FXCommunity
          </p>
        </div>

        {/* Sort Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {(['views', 'downloads'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                padding: '8px 20px', borderRadius: '50px', fontWeight: 700,
                fontSize: '13px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: sortBy === s
                  ? 'linear-gradient(135deg, #FB923C, #F59E0B)'
                  : 'rgba(255,255,255,0.05)',
                color: sortBy === s ? '#000' : 'var(--text2)',
                boxShadow: sortBy === s ? '0 4px 16px rgba(251,146,60,0.3)' : 'none',
              }}
            >
              {s === 'views' ? '👁 Views' : '📥 Downloads'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: '72px', borderRadius: '14px' }} className="skeleton" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <h3 style={{ color: 'var(--text2)', fontWeight: 700 }}>Belum ada materi populer</h3>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px', marginBottom: '28px',
            }}>
              {top3.map((pdf, idx) => (
                <div
                  key={pdf.id}
                  onClick={() => handleOpen(pdf)}
                  style={{
                    background: idx === 0
                      ? 'linear-gradient(145deg, rgba(251,191,36,0.12), rgba(13,17,32,0.9))'
                      : idx === 1
                      ? 'linear-gradient(145deg, rgba(148,163,184,0.1), rgba(13,17,32,0.9))'
                      : 'linear-gradient(145deg, rgba(180,83,9,0.12), rgba(13,17,32,0.9))',
                    border: `1px solid ${idx === 0 ? 'rgba(251,191,36,0.3)' : idx === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(180,83,9,0.25)'}`,
                    borderRadius: '18px', padding: '20px',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                >
                  <div style={{ fontSize: '32px', position: 'absolute', top: '12px', left: '14px' }}>{MEDAL[idx]}</div>
                  <div style={{ fontSize: '52px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))', marginTop: '8px' }}>{pdf.thumbnail}</div>
                  <div style={{
                    textAlign: 'center', fontWeight: 800, fontSize: '14px', lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{pdf.name}</div>
                  <span style={{
                    fontSize: '10px', fontWeight: 800, letterSpacing: '0.8px',
                    padding: '3px 9px', borderRadius: '10px',
                    background: `${catColor(pdf.category)}18`, color: catColor(pdf.category),
                    border: `1px solid ${catColor(pdf.category)}30`,
                  }}>{pdf.category.replace('fx-', '').toUpperCase()}</span>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '4px' }}>👁 {pdf.views ?? 0}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '4px' }}>📥 {pdf.downloads ?? 0}</span>
                  </div>
                  <button style={{
                    background: 'linear-gradient(135deg, #00B8D4, #00E5FF)',
                    border: 'none', color: '#000', padding: '8px 20px',
                    borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer', width: '100%',
                  }}>Buka PDF</button>
                </div>
              ))}
            </div>

            {/* Ranked List */}
            {rest.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rest.map((pdf, idx) => {
                  const rank = idx + 4
                  return (
                    <div
                      key={pdf.id}
                      onClick={() => handleOpen(pdf)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        background: 'rgba(13,17,32,0.7)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '14px', padding: '14px 16px',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.05)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.15)'
                        ;(e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(13,17,32,0.7)'
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                        ;(e.currentTarget as HTMLElement).style.transform = 'translateX(0)'
                      }}
                    >
                      {/* Rank number */}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 800, color: 'var(--text3)',
                      }}>{rank}</div>

                      {/* Thumbnail */}
                      <span style={{ fontSize: '28px', flexShrink: 0 }}>{pdf.thumbnail}</span>

                      {/* Name + category */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: '14px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{pdf.name}</div>
                        <span style={{
                          fontSize: '10px', fontWeight: 800, color: catColor(pdf.category),
                          letterSpacing: '0.5px',
                        }}>{pdf.category.replace('fx-', '').toUpperCase()}</span>
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
                        <span style={{ fontSize: '12px', color: sortBy === 'views' ? 'var(--primary)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          👁 {pdf.views ?? 0}
                        </span>
                        <span style={{ fontSize: '12px', color: sortBy === 'downloads' ? '#F59E0B' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          📥 {pdf.downloads ?? 0}
                        </span>
                      </div>

                      {/* Arrow */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Back to library */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/library" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ padding: '11px 28px' }}>
              📚 Lihat Semua Materi
            </button>
          </Link>
        </div>
      </div>
    </UserLayout>
  )
}
