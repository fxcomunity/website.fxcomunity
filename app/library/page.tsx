'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BannerSlider from '@/components/BannerSlider'

interface PDF {
  id: number; name: string; url: string; category: string
  thumbnail: string; views: number; downloads: number
  is_active: boolean; is_fav: boolean
}
interface User { id: number; username: string; email: string; role: string }

const CATS = [
  { key: 'semua', label: 'Semua', icon: '📚' },
  { key: 'favorit', label: 'Favorit', icon: '❤️' },
  { key: 'fx-basic', label: 'Basic FX', icon: '🎓' },
  { key: 'fx-advanced', label: 'Advanced FX', icon: '🚀' },
  { key: 'fx-technical', label: 'Technical', icon: '📊' },
  { key: 'fx-psychology', label: 'Psychology', icon: '🧠' },
]

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }
  return { toast, show }
}

export default function LibraryPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [allPdfs, setAllPdfs] = useState<PDF[]>([])
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('semua')
  const [viewPdf, setViewPdf] = useState<PDF | null>(null)
  const [sharePdf, setSharePdf] = useState<PDF | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast, show: showToast } = useToast()

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.status === 503) { router.push('/maintenance'); return }
      return r.json()
    }).then(d => {
      if (d?.data) setUser(d.data)
      else if (d) router.push('/login')
    }).catch(() => router.push('/login'))
    loadPDFs()
  }, [router])

  async function loadPDFs() {
    setLoading(true)
    try {
      const res = await fetch('/api/pdfs')
      const data = await res.json()
      if (data.success) {
        const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
        const pdfData = data.data.map((p: any) => ({ ...p, is_fav: favIds.includes(p.id) }))
        setAllPdfs(pdfData)
        filterPDFs(pdfData)
      }
    } catch (e) {
      console.error(e)
    }
  }

  function filterPDFs(allPdfs?: PDF[]) {
    setLoading(true)
    const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
    let filtered: PDF[] = allPdfs || []
    if (activeCat === 'favorit') {
      filtered = filtered.filter(p => favIds.includes(p.id))
    } else if (activeCat !== 'semua') {
      filtered = filtered.filter(p => p.category === activeCat)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q))
    }
    setPdfs(filtered)
    setLoading(false)
  }

  useEffect(() => { const t = setTimeout(() => filterPDFs(allPdfs), 100); return () => clearTimeout(t) }, [search, activeCat, user, allPdfs])

  useEffect(() => {
    if (showQR && sharePdf && qrRef.current && typeof window !== 'undefined') {
      qrRef.current.innerHTML = ''
      const url = `${window.location.origin}/library?pdf=${sharePdf.id}`
      if ((window as any).QRCode) {
        new (window as any).QRCode(qrRef.current, { text: url, width: 200, height: 200, colorDark: '#C720E6', colorLight: '#0d0d1a' })
      }
    }
  }, [showQR, sharePdf])

  function toggleFav(pdf: PDF) {
    if (!user) return
    const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
    const newFavIds = pdf.is_fav
      ? favIds.filter(id => id !== pdf.id)
      : [...favIds, pdf.id]
    localStorage.setItem('fav_pdfs', JSON.stringify(newFavIds))
    setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, is_fav: !p.is_fav } : p))
    showToast(pdf.is_fav ? '💔 Dihapus dari favorit' : '❤️ Ditambahkan ke favorit')
  }

  async function handleDownload(pdf: PDF) {
    try {
      await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
      setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
      setAllPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
    } catch {}
    window.open(pdf.url, '_blank')
    showToast('📥 Membuka PDF...')
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
  }

  function getShareUrl(pdf: PDF) {
    return typeof window !== 'undefined' ? `${window.location.origin}/library?pdf=${pdf.id}` : pdf.url
  }

  function copyLink(pdf: PDF) {
    navigator.clipboard.writeText(getShareUrl(pdf)).then(() => showToast('🔗 Link disalin!'))
  }

  function shareWA(pdf: PDF) {
    const text = `📚 *${pdf.name}*\nMakelah trading tersedia di FX Comunity!\n${getShareUrl(pdf)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function nativeShare(pdf: PDF) {
    if (navigator.share) {
      await navigator.share({ title: pdf.name, text: 'Materi trading dari FX Comunity', url: getShareUrl(pdf) })
    } else copyLink(pdf)
  }

  const isAdmin = user && ['Owner', 'Admin'].includes(user.role)

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }} className="spin">⚙️</div>
        <p style={{ color: 'var(--text2)' }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '80px' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <header style={{ background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📚</span>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }} className="grad-text">FX COMUNITY</span>
              <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '1px' }}>TRADING LIBRARY</div>
            </div>
          </div>
          <a href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn btn-ghost btn-sm">📊 Dashboard</button>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hide-mobile">
            {isAdmin && (
              <a href="/admin" style={{ textDecoration: 'none' }}>
                <button className="btn btn-ghost btn-sm">⚙️ Admin</button>
              </a>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/music'}>
              🎵 Music
            </button>
            <button onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(31,71,136,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text)' }}>
              <span style={{ fontSize: '18px' }}>👤</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.username}</span>
            </button>
          </div>
          <button className="hide-desktop btn btn-ghost btn-icon" onClick={() => setMenuOpen(v => !v)}>☰</button>
        </div>
        {menuOpen && (
          <div style={{ background: 'var(--bg3)', borderTop: '1px solid var(--border)', padding: '12px' }} className="hide-desktop">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg4)', borderRadius: '10px' }}>
                <span style={{ fontSize: '24px' }}>👤</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px' }}>{user.username}</p>
                  <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{user.email}</p>
                </div>
                <span className={`badge ${user.role === 'Owner' ? 'badge-orange' : user.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`} style={{ marginLeft: 'auto' }}>{user.role}</span>
              </div>
              {isAdmin && <a href="/admin" style={{ textDecoration: 'none' }}><button className="btn btn-ghost" style={{ width: '100%' }}>⚙️ Admin Panel</button></a>}
              <button className="btn btn-ghost" onClick={() => { window.location.href = '/music'; setMenuOpen(false) }}>🎵 Music Deezer</button>
              <button className="btn btn-danger" onClick={handleLogout}>🚪 Logout</button>
            </div>
          </div>
        )}
      </header>

      <div style={{ background: 'linear-gradient(180deg, rgba(31,71,136,0.15) 0%, transparent 100%)', padding: '40px 16px 24px', textAlign: 'center' }}>
        <div style={{ margin: '0 auto 20px', maxWidth: '1200px' }}>
          <BannerSlider variant="hero" />
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
          <input className="input" placeholder="Cari materi trading..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '44px', borderRadius: '50px', border: '1px solid var(--border2)', fontSize: '15px' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text3)' }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {CATS.map(cat => (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderRadius: '50px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', border: 'none', transition: 'all 0.2s ease',
                background: activeCat === cat.key ? 'var(--gradient)' : 'rgba(255,255,255,0.05)',
                color: activeCat === cat.key ? '#fff' : 'var(--text2)',
                boxShadow: activeCat === cat.key ? 'var(--shadow)' : 'none',
                transform: activeCat === cat.key ? 'scale(1.05)' : 'scale(1)',
              }}>
              {cat.icon} {cat.label}
              {cat.key !== 'semua' && cat.key !== 'favorit' && (
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>
                  {pdfs.filter(p => p.category === cat.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: '140px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', marginBottom: '6px' }} />
                <div className="skeleton" style={{ height: '10px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : pdfs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: 'var(--text2)', marginBottom: '8px' }}>Tidak ada PDF ditemukan</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Coba kata kunci lain atau pilih kategori berbeda</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '16px' }}>{pdfs.length} materi ditemukan</p>
            <div className="cards-grid pc-three">
              {pdfs.map(pdf => (
                <PDFCard
                  key={pdf.id} pdf={pdf}
                  onView={() => setViewPdf(pdf)}
                  onDownload={() => handleDownload(pdf)}
                  onShare={() => setSharePdf(pdf)}
                  onFav={() => toggleFav(pdf)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {viewPdf && (
        <div className="modal-overlay" onClick={() => setViewPdf(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '18px', width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{viewPdf.thumbnail}</span>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewPdf.name}</h3>
                  <span className={`badge ${viewPdf.category.includes('basic') ? 'badge-blue' : viewPdf.category.includes('advanced') ? 'badge-purple' : viewPdf.category.includes('psychology') ? 'badge-orange' : 'badge-green'}`}>{viewPdf.category}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { handleDownload(viewPdf); }}>📥 Download</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setSharePdf(viewPdf); setViewPdf(null) }}>📤 Share</button>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewPdf(null)}>✕</button>
              </div>
            </div>
            <iframe
              src={viewPdf.url.replace('/view', '/preview')}
              style={{ flex: 1, border: 'none', width: '100%' }}
              title={viewPdf.name}
            />
          </div>
        </div>
      )}

      {sharePdf && (
        <div className="modal-overlay" onClick={() => { setSharePdf(null); setShowQR(false) }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>📤 Bagikan PDF</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { setSharePdf(null); setShowQR(false) }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg4)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '32px' }}>{sharePdf.thumbnail}</span>
              <div><p style={{ fontWeight: 600, fontSize: '14px' }}>{sharePdf.name}</p>
                <span className="badge badge-blue">{sharePdf.category}</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { icon: '🔗', label: 'Salin Link', action: () => { copyLink(sharePdf); setSharePdf(null) } },
                { icon: '💬', label: 'WhatsApp', action: () => shareWA(sharePdf) },
                { icon: '📱', label: 'Share Native', action: () => nativeShare(sharePdf) },
                { icon: '📷', label: showQR ? 'Sembunyikan QR' : 'QR Code', action: () => setShowQR(v => !v) },
              ].map(b => (
                <button key={b.label} className="btn btn-secondary" onClick={b.action}
                  style={{ padding: '12px', borderRadius: '12px', flexDirection: 'column', gap: '4px', height: '70px' }}>
                  <span style={{ fontSize: '24px' }}>{b.icon}</span>
                  <span style={{ fontSize: '12px' }}>{b.label}</span>
                </button>
              ))}
            </div>
            {showQR && (
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg4)', borderRadius: '12px' }}>
                <div ref={qrRef} style={{ display: 'inline-block', background: '#0d0d1a', padding: '12px', borderRadius: '8px' }} />
                <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '8px' }}>Scan untuk membuka PDF</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 12px' }}>
                {user.username[0].toUpperCase()}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{user.username}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '8px' }}>{user.email}</p>
              <span className={`badge ${user.role === 'Owner' ? 'badge-orange' : user.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/dashboard" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%' }}>📊 Dashboard Saya</button>
              </a>
              {isAdmin && (
                <a href="/admin" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-secondary" style={{ width: '100%' }}>⚙️ Admin Panel</button>
                </a>
              )}
              <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%' }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      )}

      <EscHandler onEsc={() => { setViewPdf(null); setSharePdf(null); setShowProfile(false); setShowQR(false) }} />
    </div>
  )
}

function PDFCard({ pdf, onView, onDownload, onShare, onFav }: {
  pdf: PDF; onView: () => void; onDownload: () => void; onShare: () => void; onFav: () => void
}) {
  const catColor = pdf.category.includes('basic') ? '#4488ff' : pdf.category.includes('advanced') ? '#C720E6' : pdf.category.includes('psychology') ? '#FF6B35' : '#28c864'

  return (
    <div className="card card-equal" style={{ padding: '14px', position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); onFav() }}
        style={{ position: 'absolute', top: '10px', right: '10px', background: pdf.is_fav ? 'rgba(255,50,80,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${pdf.is_fav ? 'rgba(255,50,80,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '4px 6px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', zIndex: 1 }}>
        {pdf.is_fav ? '❤️' : '🤍'}
      </button>
      <div onClick={onView} className="thumb" style={{ fontSize: '56px', textAlign: 'center', margin: '6px 0 12px', lineHeight: 1 }}>{pdf.thumbnail}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
          {pdf.category.replace('fx-', '').toUpperCase()}
        </span>
      </div>
      <p onClick={onView} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', textAlign: 'center', marginBottom: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 48 }}>
        {pdf.name}
      </p>
      <div className="stats" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <img src="https://img.icons8.com/ios-glyphs/30/ffffff/visible.png" alt="Views" style={{ width: 16, height: 16 }} />
          {pdf.views}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <img src="https://img.icons8.com/ios-glyphs/30/ffffff/download--v1.png" alt="Downloads" style={{ width: 16, height: 16 }} />
          {pdf.downloads}
        </span>
      </div>
      <div className="actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        <button onClick={onView} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '11px', padding: '5px 4px' }}>👁 Lihat</button>
        <button onClick={onDownload} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '11px', padding: '5px 4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://cdn.pixabay.com/photo/2016/12/18/13/45/download-1915753_640.png" alt="Download" style={{ width: 14, height: 14 }} />
        </button>
        <button onClick={onShare} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '11px', padding: '5px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://www.shutterstock.com/image-vector/vector-illustration-share-icon-dark-260nw-2088161425.jpg" alt="Share" style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )
}

function EscHandler({ onEsc }: { onEsc: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onEsc() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onEsc])
  return null
}

