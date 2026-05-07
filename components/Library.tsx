'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BannerSlider from '@/components/BannerSlider'
import { BookOpen, Heart, GraduationCap, TrendingUp, BarChart2, Target, Loader2, Search, Share2, Link as LinkIcon, MessageCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface PDF {
  id: number; name: string; url: string; category: string
  thumbnail: string; views: number; downloads: number
  is_active: boolean; is_fav: boolean
}
interface User { id: number; username: string; email: string; role: string }

const CATS = [
  { key: 'semua', label: 'Semua', icon: <BookOpen size={16} /> },
  { key: 'publik', label: 'Public', icon: <PublicFolderIcon /> },
  { key: 'fx-basic', label: 'Basic FX', icon: <GraduationCap size={16} /> },
  { key: 'fx-advanced', label: 'Advanced', icon: <TrendingUp size={16} /> },
  { key: 'fx-technical', label: 'Technical', icon: <BarChart2 size={16} /> },
  { key: 'fx-psychology', label: 'Psychology', icon: <Target size={16} /> },
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
  const [showContact, setShowContact] = useState(false)
  const [expandedPDF, setExpandedPDF] = useState(false)
  const [contactStep, setContactStep] = useState<'rules' | 'options'>('rules')
  const [rulesAccepted, setRulesAccepted] = useState(false)
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
    
    // Listen for contact modal trigger from Footer
    const handleContactClick = () => {
      setContactStep('rules')
      setShowContact(true)
      setRulesAccepted(false)
    }
    window.addEventListener('openContactModal', handleContactClick)
    return () => window.removeEventListener('openContactModal', handleContactClick)
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

  function toggleFav(pdf: PDF) {
    if (!user) { showToast('Silakan login untuk simpan favorit', 'error'); return }
    // ── OPTIMISTIC UPDATE: UI langsung berubah sebelum sync ──
    const willBeFav = !pdf.is_fav
    setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, is_fav: willBeFav } : p))
    setAllPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, is_fav: willBeFav } : p))
    showToast(willBeFav ? '❤️ Ditambahkan ke favorit' : 'Dihapus dari favorit')
    // ── Sync ke localStorage setelah render (non-blocking) ──
    setTimeout(() => {
      const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
      const newFavIds = willBeFav
        ? [...new Set([...favIds, pdf.id])]
        : favIds.filter(id => id !== pdf.id)
      localStorage.setItem('fav_pdfs', JSON.stringify(newFavIds))
    }, 0)
  }

  async function handleDownload(pdf: PDF) {
    // Open GET /download — API converts to Google Drive direct download URL
    window.open(`/api/pdfs/${pdf.id}/download`, '_blank')
    // Optimistic UI update
    setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1 } : p))
    setAllPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1 } : p))
    showToast('Download dimulai!')
  }

  function getShareUrl(pdf: PDF) {
    const fId = pdf.category.replace('fx-', '')
    return `${window.location.origin}/library?folder=${fId}`
  }

  function copyLink(pdf: PDF) {
    navigator.clipboard.writeText(getShareUrl(pdf)).then(() => showToast('Link disalin!'))
  }

  function shareWA(pdf: PDF) {
    const text = `*${pdf.name}*\nMateri trading tersedia di FX Comunity!\n${getShareUrl(pdf)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading && !allPdfs.length) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={48} className="spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
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
        padding: 0,
      }}>
        <BannerSlider variant="hero" />
        {search && (
          <div style={{ maxWidth: '100%', margin: '12px auto 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 16px' }}>
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
            <Search size={56} style={{ opacity: 0.6, margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--text2)', marginBottom: '8px', fontWeight: 700 }}>Tidak ada PDF ditemukan</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Coba kata kunci atau kategori lain</p>
          </div>
        ) : (
          <>
            <div className="library-grid">
              {(expandedPDF ? pdfs : pdfs.slice(0, 8)).map(pdf => (
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
            {pdfs.length > 8 && (
              <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
                <button 
                  onClick={() => setExpandedPDF(!expandedPDF)}
                  style={{
                    padding: '14px 32px',
                    borderRadius: '50px',
                    border: '1px solid rgba(0,229,255,0.3)',
                    background: 'rgba(0,229,255,0.1)',
                    color: 'var(--primary)',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,229,255,0.25)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                >
                  {expandedPDF ? (
                    <>
                      <span>↑ Tampilkan Lebih Sedikit</span>
                    </>
                  ) : (
                    <>
                      <span>↓ Lihat Selengkapnya ({pdfs.length - 8} lebih)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
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
                <button
                  onClick={() => handleDownload(viewPdf)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '9px', border: '1px solid rgba(168,85,247,0.3)', cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.25))',
                    color: '#C4B5FD', fontWeight: 700, fontSize: '12px',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </button>
                <button
                  onClick={() => { setSharePdf(viewPdf); setViewPdf(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text2)', fontWeight: 700, fontSize: '12px',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
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
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}><Share2 size={20} /> Bagikan PDF</h3>
                <p style={{ fontSize: '13px', color: 'var(--text2)' }}>{sharePdf.name}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setSharePdf(null); setShowQR(false) }}>✕</button>
            </div>
            
            {/* Meta Description */}
            <div style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: 'var(--text2)', lineHeight: '1.5' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Meta Description:
              </span>
              Belajar {sharePdf.category.replace('fx-', '').toUpperCase()} bersama FX Community. Akses "{sharePdf.name}" dan tingkatkan skill trading kamu sekarang!
            </div>

            {/* QR Code Section */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button 
                onClick={() => setShowQR(!showQR)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '9px',
                  border: '1px solid rgba(0,229,255,0.3)',
                  background: 'rgba(0,229,255,0.08)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: showQR ? '16px' : '0'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.08)' }}
              >
                {showQR ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    Sembunyikan QR Code
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Tampilkan QR Code
                  </span>
                )}
              </button>
              {showQR && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginTop: '12px' }}>
                  <QRCodeSVG value={getShareUrl(sharePdf)} size={200} level="H" includeMargin={true}
                    bgColor="#0D1120" fgColor="#00E5FF" />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { copyLink(sharePdf); setSharePdf(null) }}><LinkIcon size={16} /> Copy Link</button>
              <button className="btn btn-secondary" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => shareWA(sharePdf)}><MessageCircle size={16} /> WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContact && (
        <div className="modal-overlay" onClick={() => { setShowContact(false); setContactStep('rules'); setRulesAccepted(false) }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '28px', maxWidth: '520px', maxHeight: '80vh', overflowY: 'auto' }}>
            {contactStep === 'rules' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                  Peraturan Grup
                </h3>
                  <button className="btn btn-ghost btn-icon" onClick={() => { setShowContact(false); setContactStep('rules'); setRulesAccepted(false) }}>✕</button>
                </div>
                
                <div style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.8', color: 'var(--text2)' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    FX COMMUNITY
                  </h4>
                  <p style={{ marginTop: 0 }}>Tempat sharing trader Forex dari berbagai level, dari pemula sampai pro.</p>
                  <p>Saling belajar, sharing setup, dan jaga vibe positif.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginTop: '16px', marginBottom: '8px', color: '#fff' }}>Peraturan Grup:</h4>
                  <ol style={{ marginTop: 0, paddingLeft: '20px' }}>
                    <li>Dilarang promosi akun, sinyal, atau grup lain tanpa izin admin.</li>
                    <li>Jaga sopan santun & hindari debat gak penting.</li>
                    <li>Share analisa, edukasi, atau info market yang bermanfaat.</li>
                    <li>Hoax, spam, dan SARA = kick tanpa peringatan.</li>
                    <li>Boleh tanya apa pun soal trading, tapi usahakan jelas & sopan.</li>
                    <li>Gunakan bahasa yang mudah dipahami, jangan singkatan berlebihan.</li>
                    <li>Admin berhak menegur atau mengeluarkan anggota jika melanggar.</li>
                    <li>User tidak diperbolehkan memakai BOT Chat lagi di Grub, kami tidak menerima alasan apapun.</li>
                    <li>User tidak diperbolehkan ngirim stiker berbasis vulgar, apabila ketahuan sama admin, admin wajib langsung kick tanpa basa-basi.</li>
                  </ol>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)} 
                    style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.5' }}>
                    Saya telah membaca dan setuju dengan semua peraturan grup FX Community
                  </span>
                </label>

                <button 
                  onClick={() => rulesAccepted && setContactStep('options')}
                  disabled={!rulesAccepted}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '9px',
                    border: 'none',
                    background: rulesAccepted ? 'linear-gradient(135deg, #00B8D4, #00E5FF)' : 'rgba(255,255,255,0.1)',
                    color: rulesAccepted ? '#001020' : 'var(--text3)',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: rulesAccepted ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => rulesAccepted && ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
                >
                  Lanjutkan
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Hubungi Kami
                </h3>
                  <button className="btn btn-ghost btn-icon" onClick={() => { setShowContact(false); setContactStep('rules'); setRulesAccepted(false) }}>✕</button>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {/* WhatsApp Personal */}
                  <a href="https://wa.me/62895404147521" target="_blank" rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(16,181,0,0.2), rgba(34,197,94,0.15))',
                      border: '1px solid rgba(34,197,94,0.3)',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(16,181,0,0.3), rgba(34,197,94,0.25))'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(16,181,0,0.2), rgba(34,197,94,0.15))'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#86EFAC', fontSize: '14px' }}>WhatsApp Personal</div>
                      <div style={{ fontSize: '12px', color: 'rgba(168,225,172,0.8)', marginTop: '2px' }}>Hubungi langsung via WhatsApp</div>
                    </div>
                  </a>

                  {/* Join Group */}
                  <a href="https://chat.whatsapp.com/KnkESJgEUKT5PEki4SpDD0" target="_blank" rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.15))',
                      border: '1px solid rgba(96,165,250,0.3)',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(96,165,250,0.25))'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.15))'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#93C5FD', fontSize: '14px' }}>Masuk Ke Grup</div>
                      <div style={{ fontSize: '12px', color: 'rgba(147,197,253,0.8)', marginTop: '2px' }}>Bergabung dengan komunitas FX</div>
                    </div>
                  </a>
                </div>

                <button 
                  onClick={() => { setContactStep('rules'); setRulesAccepted(false) }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '9px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text2)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '16px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                >
                  ← Kembali
                </button>
              </>
            )}
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
          cursor: 'pointer', fontSize: '15px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >{pdf.is_fav
        ? <Heart size={15} fill="#FF3050" color="#FF3050" style={{ filter: 'drop-shadow(0 0 4px rgba(255,48,80,0.6))' }} />
        : <Heart size={15} />}</button>

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginTop: 'auto', paddingTop: '12px' }}>
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

        {/* Share — same size as other buttons */}
        <button
          onClick={onShare}
          title="Bagikan PDF"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            padding: '8px 4px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
            color: 'var(--text2)', fontWeight: 800, fontSize: '11px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>
      </div>
    </div>
  )
}

