'use client'
import { useState, useEffect, useRef } from 'react'
import UserLayout from '@/components/UserLayout'
import Link from 'next/link'

const TYPES = [
  { key: 'bug',        label: 'Bug / Error',   icon: 'bug',        color: '#EF4444', desc: 'Fitur tidak berfungsi / ada error', bgGrad: 'rgba(239,68,68,0.08)' },
  { key: 'saran',      label: 'Saran',         icon: 'lightbulb',  color: '#F59E0B', desc: 'Usulan fitur atau perbaikan', bgGrad: 'rgba(245,158,11,0.08)' },
  { key: 'pertanyaan', label: 'Pertanyaan',     icon: 'help',       color: '#3B82F6', desc: 'Butuh bantuan atau penjelasan', bgGrad: 'rgba(59,130,246,0.08)' },
  { key: 'konten',     label: 'Konten',         icon: 'document',   color: '#8B5CF6', desc: 'Masalah pada materi / PDF', bgGrad: 'rgba(139,92,246,0.08)' },
  { key: 'lainnya',    label: 'Lainnya',        icon: 'inbox',      color: '#6B7280', desc: 'Hal lain yang ingin dilaporkan', bgGrad: 'rgba(107,114,128,0.08)' },
]

const PRIORITIES = [
  { key: 'low',    label: 'Rendah',  color: '#22C55E', icon: '▽' },
  { key: 'medium', label: 'Sedang',  color: '#F59E0B', icon: '◇' },
  { key: 'high',   label: 'Tinggi',  color: '#EF4444', icon: '△' },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  open:     { label: 'Menunggu',  color: '#EF4444', icon: '●', desc: 'Belum ditinjau admin' },
  resolved: { label: 'Ditinjau', color: '#F59E0B', icon: '●', desc: 'Sedang ditangani admin' },
  closed:   { label: 'Selesai',  color: '#10B981', icon: '●', desc: 'Laporan telah diselesaikan' },
}

// SVG Icon Components
const IconBug = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M6 17l-4 1M17.47 9c1.93-.2 3.53-1.9 3.53-4M18 13h4M18 17l4 1"/>
  </svg>
)
const IconLightbulb = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
)
const IconHelp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconDocument = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconInbox = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)

const ICON_MAP: Record<string, React.FC> = {
  bug: IconBug, lightbulb: IconLightbulb, help: IconHelp,
  document: IconDocument, inbox: IconInbox,
}

export default function ReportPage() {
  const [tab, setTab] = useState<'kirim' | 'riwayat'>('kirim')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('tab')
    if (p === 'riwayat') setTab('riwayat')
  }, [])

  const [type, setType] = useState('bug')
  const [priority, setPriority] = useState('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  // Auth + History state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [histError, setHistError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const selectedType = TYPES.find(t => t.key === type)!
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setIsLoggedIn(!!d?.data))
      .catch(() => setIsLoggedIn(false))
  }, [])

  async function loadHistory() {
    setHistLoading(true); setHistError('')
    try {
      const res = await fetch('/api/report?mine=1')
      const data = await res.json()
      if (data.success) setHistory(data.data || [])
      else setHistError(data.message || 'Gagal memuat riwayat')
    } catch { setHistError('Terjadi kesalahan koneksi') }
    setHistLoading(false)
  }

  useEffect(() => { if (tab === 'riwayat' && isLoggedIn) loadHistory() }, [tab, isLoggedIn])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setMsg('Mohon isi semua kolom yang wajib diisi.'); setStatus('error'); return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title: title.trim(), description: description.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success'); setMsg(data.message)
        setTitle(''); setDescription(''); setType('bug'); setPriority('medium')
      } else { setStatus('error'); setMsg(data.message || 'Gagal mengirim laporan') }
    } catch { setStatus('error'); setMsg('Terjadi kesalahan koneksi') }
  }

  const filteredHistory = filterStatus === 'all' ? history : history.filter(r => r.status === filterStatus)

  const statusCounts = {
    all: history.length,
    open: history.filter(r => r.status === 'open').length,
    resolved: history.filter(r => r.status === 'resolved').length,
    closed: history.filter(r => r.status === 'closed').length,
  }

  return (
    <UserLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '32px', position: 'relative' }}>
          {/* Background Glow */}
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '400px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '50px', padding: '5px 16px', marginBottom: '16px',
            fontSize: '11px', fontWeight: 800, color: '#A78BFA', letterSpacing: '1px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            PUSAT LAPORAN
          </div>
          <h1 style={{
            fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, marginBottom: '10px',
            background: 'linear-gradient(135deg, #fff 0%, #A78BFA 60%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}>Formulir Laporan</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: 1.7, maxWidth: '500px' }}>
            Temukan bug, punya saran, atau butuh bantuan? Ceritakan ke kami dan kami akan segera menindaklanjutinya.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
          padding: '4px', marginBottom: '28px', border: '1px solid var(--border)',
        }}>
          {([
            { key: 'kirim', label: 'Kirim Laporan', iconPath: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
            { key: 'riwayat', label: 'Riwayat Saya', iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '11px 14px', borderRadius: '11px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                background: tab === t.key ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(139,92,246,0.2))' : 'transparent',
                color: tab === t.key ? '#C4B5FD' : 'var(--text3)',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                border: tab === t.key ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.iconPath} />
                {t.key === 'riwayat' && <polyline points="14 2 14 8 20 8" />}
              </svg>
              {t.label}
              {t.key === 'riwayat' && history.length > 0 && (
                <span style={{
                  background: 'rgba(124,58,237,0.3)', color: '#C4B5FD',
                  padding: '1px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 800,
                }}>{history.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: KIRIM ── */}
        {tab === 'kirim' && (
          <>
            {/* Login gate for guests */}
            {isLoggedIn === false && (
              <div style={{
                background: 'linear-gradient(145deg, rgba(251,146,60,0.06), rgba(124,58,237,0.04))',
                border: '1px solid rgba(251,146,60,0.2)',
                borderRadius: '20px', padding: '36px 28px', marginBottom: '24px', textAlign: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '-40px', right: '-40px',
                  width: '150px', height: '150px',
                  background: 'radial-gradient(circle, rgba(251,146,60,0.1), transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{ marginBottom: '16px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px', color: '#FB923C' }}>
                  Wajib Login / Registrasi
                </h3>
                <p style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.7, marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                  Untuk mengirim laporan dan melacak statusnya, kamu wajib login terlebih dahulu.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ padding: '11px 24px', fontWeight: 800 }}>
                      Masuk Sekarang
                    </button>
                  </Link>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-secondary" style={{ padding: '11px 24px', fontWeight: 800 }}>
                      Daftar Gratis
                    </button>
                  </Link>
                </div>
                <div style={{
                  borderTop: '1px solid rgba(251,146,60,0.12)', paddingTop: '16px',
                  fontSize: '12px', color: 'var(--text3)',
                }}>
                  Tidak ingin daftar?{' '}
                  <a
                    href="https://wa.me/62895404147521?text=Halo%20Admin%20FXCommunity%2C%20saya%20ingin%20menyampaikan%20laporan%3A%20"
                    target="_blank" rel="noreferrer"
                    style={{ color: '#25D366', fontWeight: 700, textDecoration: 'none' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366" style={{ verticalAlign: '-2px', marginRight: '4px' }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Hubungi Admin via WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Loading auth */}
            {isLoggedIn === null && (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
              }}>
                <div className="spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
                <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Memverifikasi sesi...</p>
              </div>
            )}

            {/* Form — only for logged in users */}
            {isLoggedIn === true && (
              status === 'success' ? (
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16,185,129,0.06), rgba(34,197,94,0.04))',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '20px', padding: '40px 28px', textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
                    width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{ marginBottom: '16px' }}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h3 style={{ fontWeight: 900, fontSize: '20px', color: '#4ADE80', marginBottom: '8px' }}>Laporan Terkirim!</h3>
                  <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>{msg}</p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setStatus('idle')} className="btn btn-secondary" style={{ padding: '11px 22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Kirim Lagi
                    </button>
                    <button onClick={() => { setStatus('idle'); setTab('riwayat') }} className="btn btn-primary" style={{ padding: '11px 22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Lihat Riwayat
                    </button>
                  </div>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit}>
                  {status === 'error' && msg && (
                    <div style={{
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '14px', padding: '14px 18px', marginBottom: '20px',
                      color: '#F87171', fontSize: '13px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      {msg}
                    </div>
                  )}

                  {/* Type selector */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontWeight: 700, fontSize: '12px', color: 'var(--text2)',
                      marginBottom: '12px', letterSpacing: '0.5px', textTransform: 'uppercase',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                      Jenis Laporan
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                      {TYPES.map(t => {
                        const IconComp = ICON_MAP[t.icon]
                        const isSelected = type === t.key
                        return (
                          <button key={t.key} type="button" onClick={() => setType(t.key)} style={{
                            padding: '14px 10px', borderRadius: '14px',
                            border: `1.5px solid ${isSelected ? t.color : 'rgba(255,255,255,0.06)'}`,
                            background: isSelected ? t.bgGrad : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s ease',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                          }}>
                            <div style={{
                              display: 'flex', justifyContent: 'center', marginBottom: '6px',
                              color: isSelected ? t.color : 'var(--text3)',
                              transition: 'color 0.2s',
                            }}>
                              {IconComp && <IconComp />}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? t.color : 'var(--text2)' }}>{t.label}</div>
                          </button>
                        )
                      })}
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '20px', height: '20px', borderRadius: '6px',
                        background: `${selectedType.color}15`, color: selectedType.color,
                      }}>
                        {(() => { const C = ICON_MAP[selectedType.icon]; return C ? <C /> : null })()}
                      </span>
                      {selectedType.desc}
                    </p>
                  </div>

                  {/* Priority */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontWeight: 700, fontSize: '12px', color: 'var(--text2)',
                      marginBottom: '12px', letterSpacing: '0.5px', textTransform: 'uppercase',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      Prioritas
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {PRIORITIES.map(p => {
                        const isSelected = priority === p.key
                        return (
                          <button key={p.key} type="button" onClick={() => setPriority(p.key)} style={{
                            flex: 1, padding: '10px 12px', borderRadius: '10px',
                            border: `1.5px solid ${isSelected ? p.color : 'rgba(255,255,255,0.06)'}`,
                            background: isSelected ? `${p.color}12` : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          }}>
                            <span style={{ 
                              color: isSelected ? p.color : 'var(--text3)', 
                              fontSize: '12px',
                              transition: 'color 0.2s',
                            }}>{p.icon}</span>
                            <span style={{ 
                              fontSize: '12px', fontWeight: 700, 
                              color: isSelected ? p.color : 'var(--text2)',
                            }}>{p.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontWeight: 700, fontSize: '12px', color: 'var(--text2)',
                      marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                      Judul Laporan *
                    </label>
                    <input className="input" placeholder="Ringkasan singkat masalah..." value={title} onChange={e => setTitle(e.target.value)} maxLength={200} style={{
                      fontSize: '14px', borderRadius: '12px', padding: '13px 16px',
                    }} />
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: '5px',
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Tulis judul yang jelas dan deskriptif</span>
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        color: title.length > 180 ? '#EF4444' : title.length > 100 ? '#F59E0B' : 'var(--text3)',
                      }}>{title.length}/200</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontWeight: 700, fontSize: '12px', color: 'var(--text2)',
                      marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Deskripsi Detail *
                    </label>
                    <textarea
                      className="input"
                      placeholder={type === 'bug'
                        ? 'Jelaskan bug yang kamu temui:\n1. Langkah yang dilakukan\n2. Apa yang seharusnya terjadi\n3. Apa yang terjadi'
                        : 'Jelaskan secara detail...'}
                      value={description} onChange={e => setDescription(e.target.value)}
                      rows={8} maxLength={2000}
                      style={{ fontSize: '14px', resize: 'vertical', minHeight: '160px', lineHeight: 1.7, borderRadius: '12px', padding: '13px 16px' }}
                    />
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: '5px',
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Sertakan detail sebanyak mungkin</span>
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        color: description.length > 1800 ? '#EF4444' : description.length > 1000 ? '#F59E0B' : 'var(--text3)',
                      }}>{description.length}/2000</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'loading' || !title.trim() || !description.trim()}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      borderRadius: '14px',
                      border: 'none',
                      background: (!title.trim() || !description.trim()) 
                        ? 'rgba(124,58,237,0.15)'
                        : 'linear-gradient(135deg, #7C3AED, #A855F7)',
                      color: (!title.trim() || !description.trim()) ? 'rgba(255,255,255,0.3)' : '#fff',
                      fontSize: '15px',
                      fontWeight: 800,
                      cursor: (!title.trim() || !description.trim()) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: (!title.trim() || !description.trim()) ? 'none' : '0 6px 24px rgba(124,58,237,0.35)',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="spin" style={{ display: 'inline-flex' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        </span>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Kirim Laporan
                      </>
                    )}
                  </button>

                  {/* Footer note */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    marginTop: '16px', fontSize: '12px', color: 'var(--text3)',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Hanya dapat dilihat oleh Admin / Owner
                  </div>
                </form>
              )
            )}
          </>
        )}


        {/* ── TAB: RIWAYAT ── */}
        {tab === 'riwayat' && (
          <div>
            {/* Not logged in gate */}
            {isLoggedIn === false && (
              <div style={{
                textAlign: 'center', padding: '52px 24px',
                background: 'linear-gradient(145deg, rgba(124,58,237,0.06), rgba(139,92,246,0.03))',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '20px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
                  width: '200px', height: '200px',
                  background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px', color: '#C4B5FD' }}>Wajib Login</h3>
                <p style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.7, marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>
                  Untuk melihat riwayat laporan kamu, silakan login terlebih dahulu.
                </p>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 800 }}>Masuk Sekarang →</button>
                </Link>
                <div style={{ marginTop: '14px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Belum punya akun? </span>
                  <Link href="/register" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Daftar gratis</Link>
                </div>
              </div>
            )}

            {/* Loading auth state */}
            {isLoggedIn === null && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div className="spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
                <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Memverifikasi sesi...</p>
              </div>
            )}

            {/* Logged in content */}
            {isLoggedIn === true && (
              <>
                {/* Stats Overview */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                  marginBottom: '20px',
                }}>
                  {[
                    { key: 'all', label: 'Semua', count: statusCounts.all, color: '#A78BFA' },
                    { key: 'open', label: 'Menunggu', count: statusCounts.open, color: '#EF4444' },
                    { key: 'resolved', label: 'Ditinjau', count: statusCounts.resolved, color: '#F59E0B' },
                    { key: 'closed', label: 'Selesai', count: statusCounts.closed, color: '#10B981' },
                  ].map(s => (
                    <button key={s.key} onClick={() => setFilterStatus(s.key)} style={{
                      padding: '12px 8px', borderRadius: '12px',
                      border: `1.5px solid ${filterStatus === s.key ? s.color : 'rgba(255,255,255,0.06)'}`,
                      background: filterStatus === s.key ? `${s.color}10` : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                    }}>
                      <div style={{
                        fontSize: '20px', fontWeight: 900,
                        color: filterStatus === s.key ? s.color : 'var(--text2)',
                        transition: 'color 0.2s',
                      }}>{s.count}</div>
                      <div style={{
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.5px', marginTop: '2px',
                        color: filterStatus === s.key ? s.color : 'var(--text3)',
                      }}>{s.label}</div>
                    </button>
                  ))}
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600 }}>
                    {histLoading ? 'Memuat...' : `${filteredHistory.length} laporan`}
                  </span>
                  <button onClick={loadHistory} disabled={histLoading} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                    fontSize: '12px', color: 'var(--text2)', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={histLoading ? 'spin' : ''}>
                      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Refresh
                  </button>
                </div>

                {histError && (
                  <div style={{
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '12px', padding: '14px 18px', color: '#F87171', fontSize: '13px',
                    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {histError} —{' '}
                    <button onClick={loadHistory} style={{
                      background: 'none', border: 'none', color: '#F87171',
                      cursor: 'pointer', textDecoration: 'underline', fontSize: '13px',
                    }}>Coba lagi</button>
                  </div>
                )}

                {!histLoading && !histError && filteredHistory.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '18px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '14px', opacity: 0.4 }}>
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                    </svg>
                    <h3 style={{ color: 'var(--text2)', fontWeight: 700, marginBottom: '8px' }}>
                      {filterStatus === 'all' ? 'Belum ada laporan' : 'Tidak ada laporan'}
                    </h3>
                    <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '20px' }}>
                      {filterStatus === 'all'
                        ? 'Laporan yang kamu kirim akan muncul di sini'
                        : 'Tidak ada laporan dengan status ini'}
                    </p>
                    {filterStatus === 'all' ? (
                      <button onClick={() => setTab('kirim')} className="btn btn-primary" style={{
                        padding: '11px 22px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        Kirim Laporan Pertama
                      </button>
                    ) : (
                      <button onClick={() => setFilterStatus('all')} className="btn btn-secondary" style={{
                        padding: '10px 20px',
                      }}>Lihat Semua</button>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredHistory.map(r => {
                    const typeInfo = TYPES.find(t => t.key === r.type) || TYPES[4]
                    const s = STATUS_MAP[r.status] || STATUS_MAP.open
                    const isExpanded = expandedId === r.id
                    const IconComp = ICON_MAP[typeInfo.icon]

                    return (
                      <div
                        key={r.id}
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isExpanded ? `${s.color}30` : 'rgba(255,255,255,0.05)'}`,
                          borderLeft: `3px solid ${s.color}`,
                          borderRadius: '14px', padding: '16px 18px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        {/* Header Row */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginBottom: isExpanded ? '12px' : '6px', gap: '8px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                              background: typeInfo.bgGrad,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: typeInfo.color,
                            }}>
                              {IconComp && <IconComp />}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{
                                fontWeight: 700, fontSize: '14px',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>{r.title}</div>
                              <div style={{ fontSize: '10px', color: typeInfo.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                {typeInfo.label}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                            padding: '4px 12px', borderRadius: '20px',
                            background: `${s.color}10`, border: `1px solid ${s.color}20`,
                          }}>
                            <span style={{ fontSize: '8px', color: s.color }}>{s.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: s.color }}>{s.label}</span>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div style={{ animation: 'fadeIn 0.2s ease' }}>
                            <div style={{
                              fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7,
                              padding: '12px 14px', borderRadius: '10px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              marginBottom: '10px', whiteSpace: 'pre-wrap',
                            }}>{r.description}</div>

                            <div style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              flexWrap: 'wrap', gap: '8px',
                            }}>
                              <div style={{
                                fontSize: '11px', color: s.color, fontWeight: 600, fontStyle: 'italic',
                                display: 'flex', alignItems: 'center', gap: '4px',
                              }}>
                                <span style={{ fontSize: '6px' }}>{s.icon}</span> {s.desc}
                              </div>
                              <div style={{
                                fontSize: '11px', color: 'var(--text3)',
                                display: 'flex', alignItems: 'center', gap: '4px',
                              }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                                {new Date(r.created_at).toLocaleString('id-ID', {
                                  timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short',
                                  year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Collapsed preview */}
                        {!isExpanded && (
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <div style={{
                              fontSize: '12px', color: 'var(--text3)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              maxWidth: '65%',
                            }}>{r.description}</div>
                            <div style={{
                              fontSize: '10px', color: 'var(--text3)',
                              display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0,
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {new Date(r.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short',
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
