'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BannerSlider from '@/components/BannerSlider'

interface PDF {
  id: number
  name: string
  url: string
  category: string
  thumbnail: string
  views: number
  downloads: number
  is_fav?: boolean
}

interface User {
  id: number
  username: string
  email: string
  role: string
}

const CATEGORIES = [
  { key: 'semua', label: 'Semua', icon: '✨', color: '#a855f7' },
  { key: 'favorit', label: 'Favorit', icon: '❤️', color: '#f43f5e' },
  { key: 'fx-basic', label: 'Forex Basic', icon: '📚', color: '#38bdf8' },
  { key: 'fx-advanced', label: 'Forex Advanced', icon: '🚀', color: '#818cf8' },
  { key: 'fx-technical', label: 'Technical', icon: '📊', color: '#34d399' },
  { key: 'fx-psychology', label: 'Psychology', icon: '🧠', color: '#fbbf24' },
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('semua')
  const [showProfile, setShowProfile] = useState(false)
  const [showQuickLinks, setShowQuickLinks] = useState(false)
  const [hoveredPdf, setHoveredPdf] = useState<number | null>(null)
  const [favLoading, setFavLoading] = useState<number | null>(null)
  const [stats, setStats] = useState({ totalPdf: 0, totalUser: 0, totalDownload: 0 })
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { 
    checkAuth()
    loadData()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => filterPDFs(), 100)
    return () => clearTimeout(t)
  }, [search, activeCat, pdfs])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.status === 503) { router.push('/maintenance'); return }
      const data = await res.json()
      if (data.data) setUser(data.data)
    } catch (e) { console.error(e) }
  }

  async function loadData() {
    try {
      const res = await fetch('/api/pdfs')
      const data = await res.json()
      if (data.success) {
        const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
        const pdfsWithFav = data.data.map((p: PDF) => ({ ...p, is_fav: favIds.includes(p.id) }))
        setPdfs(pdfsWithFav)
        const s = await fetch('/api/stats')
        const sd = await s.json()
        setStats({
          totalPdf: data.data.length,
          totalUser: sd?.data?.activeUsers || 0,
          totalDownload: data.data.reduce((a: number, p: PDF) => a + (p.downloads || 0), 0)
        })
      }
    } catch (e) { console.error(e) }
  }

  function filterPDFs() {
    const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
    let filtered = pdfs

    if (activeCat === 'favorit') {
      filtered = pdfs.filter(p => favIds.includes(p.id))
    } else if (activeCat !== 'semua') {
      filtered = pdfs.filter(p => p.category === activeCat)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q))
    }

    setPdfs(prev => filtered.map(p => ({ ...p, is_fav: favIds.includes(p.id) })))
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setShowProfile(false)
    setShowQuickLinks(false)
  }

  async function handleDownload(pdf: PDF) {
    try {
      await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
      setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
    } catch {}
    window.open(pdf.url, '_blank')
  }

  function getShareUrl(pdf: PDF) {
    return typeof window !== 'undefined' ? `${window.location.origin}/library?pdf=${pdf.id}` : pdf.url
  }

  function copyLink(pdf: PDF) {
    navigator.clipboard.writeText(getShareUrl(pdf))
  }

  function shareWA(pdf: PDF) {
    const text = `📚 ${pdf.name}\n${getShareUrl(pdf)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function toggleFav(e: React.MouseEvent, pdf: PDF) {
    e.stopPropagation()
    if (!user) { router.push('/login'); return }
    setFavLoading(pdf.id)
    const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
    const newFavIds = pdf.is_fav
      ? favIds.filter(id => id !== pdf.id)
      : [...favIds, pdf.id]
    localStorage.setItem('fav_pdfs', JSON.stringify(newFavIds))
    setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, is_fav: !p.is_fav } : p))
    setFavLoading(null)
  }

  const isAdmin = user && ['Owner', 'Admin'].includes(user.role)
  const getCatInfo = (key: string) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0]

  const STATS = [
    { label: 'PDF Tersedia', value: stats.totalPdf + '+', icon: '📄' },
    { label: 'Member Aktif', value: stats.totalUser + '+', icon: '👥' },
    { label: 'Download', value: stats.totalDownload + '+', icon: '📥' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060611', color: '#fff' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(6,6,17,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📚</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.5, background: 'linear-gradient(135deg,#fff,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FX COMUNITY</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 3 }}>TRADING LIBRARY</div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                {isAdmin && <Link href="/admin" style={{ textDecoration: 'none' }}><button style={{ padding: '9px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(255,255,255,0.05)', color: '#a5b4fc' }}>⚙️ Admin</button></Link>}
                <button onClick={() => { setShowQuickLinks(false); setShowProfile(true) }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '7px 14px', cursor: 'pointer', color: '#fff' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{user.username[0].toUpperCase()}</div>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{user.username}</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ textDecoration: 'none' }}><button style={{ padding: '9px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff' }}>🔑 Login</button></Link>
                <Link href="/register" style={{ textDecoration: 'none' }}><button style={{ padding: '9px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff' }}>✨ Daftar Gratis</button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section style={{ position: 'relative', paddingTop: 120, paddingBottom: 60, textAlign: 'center' }}>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', width: 500, height: 500, background: 'rgba(99,102,241,0.12)', top: -100, left: '50%', transform: 'translateX(-50%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 50, padding: '6px 18px', fontSize: 12, fontWeight: 700, color: '#c4b5fd', marginBottom: 16 }}>
            🔥 Platform Edukasi Trading #1 Indonesia
          </div>

          <div style={{ marginBottom: 18 }}>
            <BannerSlider variant="hero" />
          </div>

          <div style={{ position: 'relative', maxWidth: 540, margin: '12px auto 0' }}>
            <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 20 }}>🔍</span>
            <input ref={searchRef} type="text" placeholder="Cari materi trading..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '16px 52px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: 15 }} />
          </div>
        </div>
        
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#a855f7,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 24px' }}>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', border: activeCat === cat.key ? 'none' : '1px solid rgba(255,255,255,0.08)', background: activeCat === cat.key ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.04)', color: activeCat === cat.key ? '#fff' : 'rgba(255,255,255,0.6)' }}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{getCatInfo(activeCat).icon} {activeCat === 'semua' ? 'Semua Materi' : activeCat === 'favorit' ? 'Favorit Saya' : getCatInfo(activeCat).label}</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>Menampilkan {pdfs.length} materi</p>
        </div>

        {pdfs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>{activeCat === 'favorit' ? '❤️' : '🔍'}</div>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 10, fontSize: 22, fontWeight: 700 }}>{activeCat === 'favorit' ? 'Belum ada favorit' : 'Tidak ditemukan'}</h3>
          </div>
        ) : (
          <div className="cards-grid pc-three">
            {pdfs.map((pdf) => {
              const catInfo = getCatInfo(pdf.category)
              return (
                <div key={pdf.id} className="card card-equal" onMouseEnter={() => setHoveredPdf(pdf.id)} onMouseLeave={() => setHoveredPdf(null)} style={{ padding: '20px 16px', position: 'relative' }}>
                  <button onClick={(e) => toggleFav(e, pdf)} disabled={favLoading === pdf.id} style={{ position: 'absolute', top: 12, right: 12, background: pdf.is_fav ? 'rgba(244,63,94,0.2)' : 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, opacity: hoveredPdf === pdf.id || pdf.is_fav ? 1 : 0 }}>
                    {favLoading === pdf.id ? '⏳' : pdf.is_fav ? '❤️' : '🤍'}
                  </button>
                  <div className="thumb" style={{ marginBottom: 14 }}>{pdf.thumbnail}</div>
                  <div className="category-row" style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: catInfo.color + '20', color: catInfo.color }}>{pdf.category.replace('fx-', '')}</span>
                  </div>
                  <p className="title" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pdf.name}</p>
                  <div className="stats" style={{ marginBottom: 0 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <img src="https://img.icons8.com/ios-glyphs/30/ffffff/visible.png" alt="Views" style={{ width: 16, height: 16 }} />
                      {pdf.views}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <img src="https://img.icons8.com/ios-glyphs/30/ffffff/download--v1.png" alt="Downloads" style={{ width: 16, height: 16 }} />
                      {pdf.downloads}
                    </span>
                  </div>
                  <div className="actions" style={{ width: '100%' }}>
                    <button onClick={() => window.open(pdf.url, '_blank')} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>👁 Lihat</button>
                    <button onClick={() => handleDownload(pdf)} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <img src="https://cdn.pixabay.com/photo/2016/12/18/13/45/download-1915753_640.png" alt="Download" style={{ width: 14, height: 14 }} />
                      Download
                    </button>
                    <button onClick={() => copyLink(pdf)} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <img src="https://www.shutterstock.com/image-vector/vector-illustration-share-icon-dark-260nw-2088161425.jpg" alt="Share" style={{ width: 14, height: 14 }} />
                      Share
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      

      {showProfile && user && (
        <div onClick={() => { setShowProfile(false); setShowQuickLinks(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0e0e1f', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 84, height: 84, borderRadius: 22, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 38, marginBottom: 14 }}>{user.username[0].toUpperCase()}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800 }}>{user.username}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '6px 0 10px' }}>{user.email}</p>
              <span style={{ fontSize: 12, padding: '5px 16px', borderRadius: 20, background: user.role === 'Owner' ? 'rgba(249,115,22,0.2)' : 'rgba(168,85,247,0.2)', color: user.role === 'Owner' ? '#fb923c' : '#c4b5fd', fontWeight: 700 }}>{user.role === 'Owner' ? '👑' : '⭐'} {user.role}</span>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <button onClick={handleLogout} style={{ padding: 14, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 14, color: '#f87171', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>🚪 Logout</button>
              <button onClick={() => { setShowProfile(false) }} style={{ padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
