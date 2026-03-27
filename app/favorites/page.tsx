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

export default function FavoritesPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; username: string; email: string; role: string } | null>(null)
  const [favPdfs, setFavPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (r.status === 503) { router.push('/maintenance'); return null }
        return r.json()
      })
      .then(d => {
        if (d?.data) { setUser(d.data); loadFavorites() }
        else if (d) router.push('/login')
      })
      .catch(() => router.push('/login'))
  }, [router])

  async function loadFavorites() {
    setLoading(true)
    try {
      const res = await fetch('/api/pdfs')
      const data = await res.json()
      if (data.success) {
        const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
        setFavPdfs(data.data.filter((p: any) => favIds.includes(p.id)))
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleDownload(pdf: PDF) {
    try {
      await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
      setFavPdfs(prev => prev.map(p => p.id === pdf.id
        ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 }
        : p))
      window.open(`/api/pdfs/${pdf.id}/view`, '_blank')
    } catch {}
  }

  function toggleFav(pdf: PDF) {
    const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
    localStorage.setItem('fav_pdfs', JSON.stringify(favIds.filter(id => id !== pdf.id)))
    setFavPdfs(prev => prev.filter(p => p.id !== pdf.id))
  }

  return (
    <UserLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 16px' }}>

        {/* Page Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '36px', gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #ff6b8a, #ff4466)',
                borderRadius: '10px', padding: '6px 10px', fontSize: '20px',
                boxShadow: '0 4px 16px rgba(255,68,102,0.3)',
              }}>❤️</span>
              <span style={{
                background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>My Favorites</span>
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: 1.6 }}>
              Materi trading yang kamu simpan untuk belajar lebih lanjut.
            </p>
          </div>
          <Link href="/library" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button className="btn btn-primary" style={{ padding: '11px 22px' }}>📚 Jelajahi Library</button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="library-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                borderRadius: '16px', overflow: 'hidden',
                background: 'rgba(13,17,32,0.8)', border: '1px solid var(--border)',
                padding: '16px',
              }}>
                <div className="skeleton" style={{ height: '80px', borderRadius: '12px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ height: '14px', marginBottom: '8px', borderRadius: '6px' }} />
                <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '6px' }} />
              </div>
            ))}
          </div>
        ) : favPdfs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5, filter: 'grayscale(0.3)' }}>📁</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Belum ada favorit</h3>
            <p style={{ color: 'var(--text2)', marginBottom: '28px', fontSize: '14px', lineHeight: 1.7 }}>
              Tandai materi dengan ❤️ di Library untuk menyimpannya di sini.
            </p>
            <Link href="/library" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ padding: '11px 24px' }}>Mulai Jelajahi</button>
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px', fontWeight: 600 }}>
              {favPdfs.length} materi tersimpan
            </p>
            <div className="library-grid">
              {favPdfs.map(pdf => {
                const catColor = pdf.category.includes('basic') ? '#00E5FF'
                  : pdf.category.includes('advanced') ? '#A855F7'
                  : pdf.category.includes('technical') ? '#F59E0B'
                  : pdf.category.includes('psychology') ? '#10B981'
                  : '#6B7280'
                const catLabel = pdf.category.replace('fx-', '').toUpperCase()

                return (
                  <div
                    key={pdf.id}
                    className="pdf-card"
                    style={{
                      position: 'relative',
                      padding: '16px',
                      display: 'flex', flexDirection: 'column',
                      minHeight: '230px', height: '100%',
                      borderRadius: '16px',
                    }}
                  >
                    {/* Remove Fav Button */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleFav(pdf) }}
                      title="Hapus dari favorit"
                      style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'rgba(255,50,80,0.18)',
                        border: '1px solid rgba(255,50,80,0.35)',
                        borderRadius: '8px', padding: '5px 7px',
                        cursor: 'pointer', fontSize: '15px', lineHeight: 1,
                        transition: 'all 0.2s ease',
                      }}
                    >💔</button>

                    {/* Thumbnail */}
                    <div
                      onClick={() => handleDownload(pdf)}
                      style={{
                        fontSize: '52px', textAlign: 'center',
                        cursor: 'pointer', lineHeight: 1,
                        paddingTop: '6px', flexShrink: 0,
                        filter: 'drop-shadow(0 4px 12px rgba(0,229,255,0.2))',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >{pdf.thumbnail}</div>

                    {/* Category badge */}
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.8px',
                        padding: '3px 9px', borderRadius: '10px',
                        background: `${catColor}18`, color: catColor,
                        border: `1px solid ${catColor}30`,
                      }}>{catLabel}</span>
                    </div>

                    {/* Title */}
                    <p style={{
                      fontSize: '13px', fontWeight: 700, textAlign: 'center',
                      marginTop: '8px', lineHeight: 1.45,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', minHeight: '2.9em', color: 'var(--text)',
                    }}>
                      {pdf.name}
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        👁 {pdf.views}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📥 {pdf.downloads}
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleDownload(pdf)}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 'auto', paddingTop: '12px', fontSize: '13px', fontWeight: 800 }}
                    >
                      📖 Lanjutkan Membaca
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  )
}
