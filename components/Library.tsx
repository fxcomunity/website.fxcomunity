'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  { key: 'publik', label: 'Public', icon: <PublicFolderIcon /> },
  { key: 'fx-basic', label: 'Basic FX', icon: '🎓' },
  { key: 'fx-advanced', label: 'Advanced', icon: '🚀' },
  { key: 'fx-technical', label: 'Technical', icon: '📊' },
  { key: 'fx-psychology', label: 'Psychology', icon: '🧠' },
]

function PublicFolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="#00E5FF" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.5,5.5H18.2L16.1,9.7H4.4V26.5H29.6V5.5Zm0,4.2H19.3l1.1-2.1h7.1Z" />
      <path d="M22.6,16.3a3.787,3.787,0,0,1,1.8,2.8,3.048,3.048,0,1,0-1.8-2.8Zm-2,6.3a3.1,3.1,0,1,0-3.1-3.1h0A3.116,3.116,0,0,0,20.6,22.6Zm1.3.2H19.3a3.9,3.9,0,0,0-3.9,3.9V30h0l.2.1A16.106,16.106,0,0,0,21,31a9.638,9.638,0,0,0,4.7-.9l.2-.1h0V26.8A4.148,4.148,0,0,0,21.9,22.8ZM27,19.6H24.4a3.225,3.225,0,0,1-1.2,2.6,4.621,4.621,0,0,1,3.3,4.5v1a9.782,9.782,0,0,0,4.1-.9l.2-.1h0V23.5A3.82,3.82,0,0,0,27,19.6Zm-11.8-.2a3.022,3.022,0,0,0,1.6-.5,3.71,3.71,0,0,1,1.4-2.4v-.2a3.1,3.1,0,0,0-6.2,0,3.272,3.272,0,0,0,3.2,3.1Zm2.7,2.9a4.2,4.2,0,0,1-1.2-2.6H13.8a3.9,3.9,0,0,0-3.9,3.9v3.2h0l.2.1a16.28,16.28,0,0,0,4.4.8v-1a4.81,4.81,0,0,1,3.4-4.4Z" fill="#66EFFF" />
    </svg>
  )
}

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }
  return { toast, show }
}

export default function Library() {
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
  const [folderId, setFolderId] = useState<string | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast, show: showToast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const folderParam = urlParams.get('folder')
    const qParam = urlParams.get('q')
    if (folderParam) { setFolderId(folderParam); setActiveCat('semua') }
    if (qParam) setSearch(qParam)
    fetch('/api/auth/me').then(r => r.status === 200 ? r.json() : null).then(d => {
      if (d?.data) setUser(d.data)
    }).catch(() => { })
    loadPDFs()
  }, [])

  // Sync when header search updates the URL
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null) setSearch(q)
  }, [searchParams])

  async function loadPDFs() {
    setLoading(true)
    try {
      const url = new URL('/api/pdfs', window.location.origin)
      const urlParams = new URLSearchParams(window.location.search)
      if (folderId || urlParams.get('folder')) {
        url.searchParams.set('folder', folderId || urlParams.get('folder') || '')
      }
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
        const pdfData = data.data.map((p: any) => ({ ...p, is_fav: favIds.includes(p.id) }))
        setAllPdfs(pdfData)
        filterPDFs(pdfData)
      }
    } catch (e) { console.error(e) }
  }

  function filterPDFs(allPdfs?: PDF[]) {
    setLoading(true)
    const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
    let filtered: PDF[] = allPdfs || []
    if (folderId) {
      filtered = filtered.filter(p => p.category === `fx-${folderId}` || p.id.toString() === folderId)
    } else if (activeCat === 'favorit') {
      filtered = filtered.filter(p => favIds.includes(p.id))
    } else if (activeCat === 'publik') {
      filtered = filtered.filter(p => p.views > 5)
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
      const fId = sharePdf.category.replace('fx-', '')
      const url = `${window.location.origin}/library?folder=${fId}`
      if ((window as any).QRCode) {
        new (window as any).QRCode(qrRef.current, { text: url, width: 200, height: 200, colorDark: '#00E5FF', colorLight: '#0D1120' })
      }
    }
  }, [showQR, sharePdf])

  function toggleFav(pdf: PDF) {
    if (!user) { showToast('Silakan login untuk simpan favorit', 'error'); return }
    const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
    const newFavIds = pdf.is_fav ? favIds.filter(id => id !== pdf.id) : [...favIds, pdf.id]
    localStorage.setItem('fav_pdfs', JSON.stringify(newFavIds))
    setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, is_fav: !p.is_fav } : p))
    showToast(pdf.is_fav ? '💔 Dihapus dari favorit' : '❤️ Ditambahkan ke favorit')
  }

  async function handleDownload(pdf: PDF) {
    try {
      await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
      setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
      setAllPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
      window.open(`/api/pdfs/${pdf.id}/view`, '_blank')
      showToast('📥 PDF dibuka!')
    } catch { }
  }

  function getShareUrl(pdf: PDF) {
    const fId = pdf.category.replace('fx-', '')
    return `${window.location.origin}/library?folder=${fId}`
  }

  function copyLink(pdf: PDF) {
    navigator.clipboard.writeText(getShareUrl(pdf)).then(() => showToast('🔗 Link disalin!'))
  }

  function shareWA(pdf: PDF) {
    const text = `📚 *${pdf.name}*\nMateri trading tersedia di FX Comunity!\n${getShareUrl(pdf)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading && !allPdfs.length) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '44px', marginBottom: '16px' }} className="spin">⚙️</div>
        <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Memuat materi...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '90px' }}>
      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Hero / Banner Section */}
      <div style={{
        background: 'radial-gradient(ellipse 90% 50% at 50% -5%, rgba(0,229,255,0.1) 0%, transparent 65%)',
        padding: '24px 16px 16px',
      }}>
        <div style={{ margin: '0 auto', maxWidth: '1200px' }}>
          <BannerSlider variant="hero" />
        </div>
        {search && (
          <div style={{ maxWidth: '1200px', margin: '12px auto 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text2)', fontSize: '13px' }}>Hasil pencarian:</span>
            <span style={{
              background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)',
              color: 'var(--primary)', padding: '3px 12px', borderRadius: '20px',
              fontSize: '13px', fontWeight: 700,
            }}>"{search}"</span>
            <button
              onClick={() => { setSearch(''); router.replace('/library') }}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--text3)', fontSize: '12px',
                padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
              }}
            >Hapus ✕</button>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
          {CATS.map(cat => {
            const isActive = activeCat === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCat(cat.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '50px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  whiteSpace: 'nowrap', border: 'none', transition: 'all 0.25s ease',
                  background: isActive
                    ? 'linear-gradient(135deg, #00B8D4, #00E5FF)'
                    : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#000' : 'var(--text2)',
                  boxShadow: isActive ? '0 4px 16px rgba(0,229,255,0.28)' : 'none',
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{cat.icon}</span>
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* PDF Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {pdfs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.6 }}>🔍</div>
            <h3 style={{ color: 'var(--text2)', marginBottom: '8px', fontWeight: 700 }}>Tidak ada PDF ditemukan</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Coba kata kunci atau kategori lain</p>
          </div>
        ) : (
          <div className="library-grid">
            {pdfs.map(pdf => (
              <PDFCard
                key={pdf.id}
                pdf={pdf}
                onView={() => setViewPdf(pdf)}
                onDownload={() => handleDownload(pdf)}
                onShare={() => setSharePdf(pdf)}
                onFav={() => toggleFav(pdf)}
              />
            ))}
          </div>
        )}
      </div>

      {/* View PDF Modal */}
      {viewPdf && (
        <div className="modal-overlay" onClick={() => setViewPdf(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: '20px',
              width: '100%', maxWidth: '940px', height: '90vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{viewPdf.thumbnail}</span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{viewPdf.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(viewPdf)}>📥 Download</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setSharePdf(viewPdf); setViewPdf(null) }}>📤 Share</button>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewPdf(null)}>✕</button>
              </div>
            </div>
            <iframe src={`/api/pdfs/${viewPdf.id}/view`} style={{ flex: 1, border: 'none', width: '100%' }} title={viewPdf.name} />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {sharePdf && (
        <div className="modal-overlay" onClick={() => { setSharePdf(null); setShowQR(false) }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>📤 Bagikan PDF</h3>
                <p style={{ fontSize: '13px', color: 'var(--text2)' }}>{sharePdf.name}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setSharePdf(null); setShowQR(false) }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ padding: '14px' }} onClick={() => { copyLink(sharePdf); setSharePdf(null) }}>🔗 Copy Link</button>
              <button className="btn btn-secondary" style={{ padding: '14px' }} onClick={() => shareWA(sharePdf)}>💬 WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PDFCard({ pdf, onView, onDownload, onShare, onFav }: {
  pdf: PDF; onView: () => void; onDownload: () => void; onShare: () => void; onFav: () => void
}) {
  const catLabel = pdf.category.replace('fx-', '').toUpperCase()
  const catColor = pdf.category.includes('basic') ? '#00E5FF'
    : pdf.category.includes('advanced') ? '#A855F7'
      : pdf.category.includes('technical') ? '#F59E0B'
        : pdf.category.includes('psychology') ? '#10B981'
          : '#6B7280'

  return (
    <div
      className="pdf-card"
      style={{
        position: 'relative',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '240px',
        height: '100%',
      }}
    >
      {/* Fav Button */}
      <button
        onClick={e => { e.stopPropagation(); onFav() }}
        title={pdf.is_fav ? 'Hapus favorit' : 'Tambah favorit'}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: pdf.is_fav ? 'rgba(255,50,80,0.18)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${pdf.is_fav ? 'rgba(255,50,80,0.35)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '8px', padding: '5px 7px',
          cursor: 'pointer', fontSize: '15px', lineHeight: 1,
          transition: 'all 0.2s ease',
        }}
      >{pdf.is_fav ? '❤️' : '🤍'}</button>

      {/* Thumbnail */}
      <div
        onClick={onView}
        style={{
          fontSize: '48px', textAlign: 'center', cursor: 'pointer',
          lineHeight: 1, paddingTop: '6px', flexShrink: 0,
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
      <div style={{
        fontWeight: 700, fontSize: '13px', textAlign: 'center',
        marginTop: '8px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: '1.45',
        minHeight: '2.9em',
        color: 'var(--text)',
        wordBreak: 'break-word',
      }}>{pdf.name}</div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '12px',
        marginTop: '8px', flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          {pdf.views}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          {pdf.downloads}
        </span>
      </div>

      {/* Actions — 3 premium buttons */}
      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '12px' }}>
        {/* Lihat / View */}
        <button
          onClick={onView}
          title="Buka PDF"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            padding: '8px 4px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #00B8D4, #00E5FF)',
            color: '#001020', fontWeight: 800, fontSize: '11px',
            boxShadow: '0 4px 12px rgba(0,229,255,0.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(0,229,255,0.4)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,229,255,0.25)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          Lihat
        </button>

        {/* Download */}
        <button
          onClick={onDownload}
          title="Download PDF"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            padding: '8px 4px', borderRadius: '9px', border: '1px solid rgba(168,85,247,0.3)',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.15))',
            color: '#C4B5FD', fontWeight: 800, fontSize: '11px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(168,85,247,0.3))'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.15))'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Unduh
        </button>

        {/* Share */}
        <button
          onClick={onShare}
          title="Bagikan PDF"
          style={{
            width: '34px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </div>
  )
}

