'use client'
import { useState, useEffect } from 'react'
import UserLayout from '@/components/UserLayout'
import Link from 'next/link'

const TYPES = [
  { key: 'bug',        label: 'Bug / Error',   icon: '🐛', color: '#EF4444', desc: 'Fitur tidak berfungsi / ada error' },
  { key: 'saran',      label: 'Saran',          icon: '💡', color: '#F59E0B', desc: 'Usulan fitur atau perbaikan' },
  { key: 'pertanyaan', label: 'Pertanyaan',     icon: '❓', color: '#3B82F6', desc: 'Butuh bantuan atau penjelasan' },
  { key: 'konten',     label: 'Konten',          icon: '📄', color: '#8B5CF6', desc: 'Masalah pada materi / PDF' },
  { key: 'lainnya',    label: 'Lainnya',         icon: '📬', color: '#6B7280', desc: 'Hal lain yang ingin dilaporkan' },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  open:     { label: 'Menunggu',  color: '#EF4444', icon: '🔴', desc: 'Belum ditinjau admin' },
  resolved: { label: 'Ditinjau', color: '#F59E0B', icon: '🟡', desc: 'Sedang ditangani admin' },
  closed:   { label: 'Selesai',  color: '#10B981', icon: '🟢', desc: 'Laporan telah diselesaikan' },
}

export default function ReportPage() {
  const [tab, setTab] = useState<'kirim' | 'riwayat'>('kirim')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('tab')
    if (p === 'riwayat') setTab('riwayat')
  }, [])

  const [type, setType] = useState('bug')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  // Auth + History state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null) // null = loading
  const [history, setHistory] = useState<any[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [histError, setHistError] = useState('')

  const selectedType = TYPES.find(t => t.key === type)!

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
        setTitle(''); setDescription(''); setType('bug')
      } else { setStatus('error'); setMsg(data.message || 'Gagal mengirim laporan') }
    } catch { setStatus('error'); setMsg('Terjadi kesalahan koneksi') }
  }

  return (
    <UserLayout>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '50px', padding: '4px 14px', marginBottom: '14px',
            fontSize: '11px', fontWeight: 800, color: '#A78BFA', letterSpacing: '1px',
          }}>📬 LAPORAN & INFORMASI</div>
          <h1 style={{
            fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, marginBottom: '8px',
            background: 'linear-gradient(135deg, #fff 0%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Formulir Laporan</h1>
          <p style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.6 }}>
            Temukan bug, punya saran, atau butuh bantuan? Ceritakan ke kami.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
          padding: '4px', marginBottom: '28px', border: '1px solid var(--border)',
        }}>
          {([
            { key: 'kirim',   label: '📝 Kirim Laporan' },
            { key: 'riwayat', label: '📋 Riwayat Saya' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '10px', borderRadius: '9px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                background: tab === t.key ? 'rgba(124,58,237,0.3)' : 'transparent',
                color: tab === t.key ? '#C4B5FD' : 'var(--text3)',
                transition: 'all 0.2s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── TAB: KIRIM ── */}
        {tab === 'kirim' && (
          <>
            {/* Login gate for guests */}
            {isLoggedIn === false && (
              <div style={{
                background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.25)',
                borderRadius: '18px', padding: '28px 24px', marginBottom: '24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px', color: '#FB923C' }}>
                  Wajib Login / Registrasi
                </h3>
                <p style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', maxWidth: '320px', margin: '0 auto 20px' }}>
                  Untuk mengirim laporan dan melacak statusnya, kamu wajib login terlebih dahulu.
                  Riwayat laporan hanya bisa dilihat setelah login.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ padding: '10px 22px', fontWeight: 800 }}>
                      Masuk Sekarang
                    </button>
                  </Link>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-secondary" style={{ padding: '10px 22px', fontWeight: 800 }}>
                      Daftar Gratis
                    </button>
                  </Link>
                </div>
                <div style={{
                  borderTop: '1px solid rgba(251,146,60,0.15)', paddingTop: '14px',
                  fontSize: '12px', color: 'var(--text3)',
                }}>
                  Tidak ingin daftar?{' '}
                  <a
                    href="https://wa.me/62895404147521?text=Halo%20Admin%20FXCommunity%2C%20saya%20ingin%20menyampaikan%20laporan%3A%20"
                    target="_blank" rel="noreferrer"
                    style={{ color: '#25D366', fontWeight: 700, textDecoration: 'none' }}
                  >
                    💬 Hubungi Admin via WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Loading auth */}
            {isLoggedIn === null && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>
                <span className="spin" style={{ fontSize: '24px' }}>⚙️</span>
              </div>
            )}

            {/* Form — only for logged in users */}
            {isLoggedIn === true && (
              status === 'success' ? (
                <div style={{
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '16px', padding: '28px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
                  <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#4ADE80', marginBottom: '8px' }}>Laporan Terkirim!</h3>
                  <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '20px' }}>{msg}</p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setStatus('idle')} className="btn btn-secondary" style={{ padding: '10px 22px' }}>+ Kirim Lagi</button>
                    <button onClick={() => { setStatus('idle'); setTab('riwayat') }} className="btn btn-primary" style={{ padding: '10px 22px' }}>📋 Lihat Riwayat</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {status === 'error' && msg && (
                    <div style={{
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '12px', padding: '12px 16px', marginBottom: '18px',
                      color: '#F87171', fontSize: '14px', fontWeight: 600,
                    }}>⚠️ {msg}</div>
                  )}

                  {/* Type selector */}
                  <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', color: 'var(--text2)', marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Jenis Laporan *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                      {TYPES.map(t => (
                        <button key={t.key} type="button" onClick={() => setType(t.key)} style={{
                          padding: '10px 8px', borderRadius: '10px',
                          border: `1.5px solid ${type === t.key ? t.color : 'var(--border)'}`,
                          background: type === t.key ? `${t.color}15` : 'var(--glass)',
                          cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                        }}>
                          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: type === t.key ? t.color : 'var(--text2)' }}>{t.label}</div>
                        </button>
                      ))}
                    </div>
                    <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text3)' }}>
                      <span style={{ color: selectedType.color }}>{selectedType.icon}</span> {selectedType.desc}
                    </p>
                  </div>

                  {/* Title */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Judul *</label>
                    <input className="input" placeholder="Ringkasan singkat..." value={title} onChange={e => setTitle(e.target.value)} maxLength={200} style={{ fontSize: '14px' }} />
                    <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>{title.length}/200</div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Deskripsi Detail *</label>
                    <textarea
                      className="input"
                      placeholder={type === 'bug' ? 'Apa yang terjadi? Langkah untuk mereproduksi?' : 'Ceritakan secara detail...'}
                      value={description} onChange={e => setDescription(e.target.value)}
                      rows={7} maxLength={2000}
                      style={{ fontSize: '14px', resize: 'vertical', minHeight: '140px', lineHeight: 1.7 }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>{description.length}/2000</div>
                  </div>

                  <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 800, borderRadius: '12px' }}>
                    {status === 'loading'
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><span className="spin">⚙️</span> Mengirim...</span>
                      : `${selectedType.icon} Kirim Laporan`}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text3)' }}>🔒 Hanya dapat dilihat oleh Admin / Owner</p>
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
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '18px',
              }}>
                <div style={{ fontSize: '52px', marginBottom: '14px' }}>🔒</div>
                <h3 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '8px' }}>Wajib Login</h3>
                <p style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', maxWidth: '280px', margin: '0 auto 20px' }}>
                  Untuk melihat riwayat laporan kamu, silakan login terlebih dahulu.
                </p>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ padding: '11px 28px', fontSize: '14px', fontWeight: 800 }}>Masuk Sekarang →</button>
                </Link>
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Belum punya akun? </span>
                  <Link href="/login" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Daftar gratis</Link>
                </div>
              </div>
            )}

            {/* Loading auth state */}
            {isLoggedIn === null && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                <span className="spin" style={{ fontSize: '28px' }}>⚙️</span>
              </div>
            )}

            {/* Logged in content */}
            {isLoggedIn === true && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600 }}>
                    {histLoading ? 'Memuat...' : `${history.length} laporan terkirim`}
                  </span>
                  <button onClick={loadHistory} disabled={histLoading} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: 'var(--text2)' }}>
                    🔄 Refresh
                  </button>
                </div>

                {histError && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#F87171', fontSize: '13px', marginBottom: '16px' }}>
                    ⚠️ {histError} — <button onClick={loadHistory} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>Coba lagi</button>
                  </div>
                )}

            {!histLoading && !histError && history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px', opacity: 0.5 }}>📭</div>
                <h3 style={{ color: 'var(--text2)', fontWeight: 700, marginBottom: '8px' }}>Belum ada laporan</h3>
                <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '16px' }}>Laporan yang kamu kirim akan muncul di sini</p>
                <button onClick={() => setTab('kirim')} className="btn btn-primary" style={{ padding: '10px 22px' }}>📝 Kirim Laporan Pertama</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map(r => {
                const typeInfo = TYPES.find(t => t.key === r.type) || TYPES[4]
                const s = STATUS_MAP[r.status] || STATUS_MAP.open
                return (
                  <div key={r.id} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                    borderLeft: `3px solid ${s.color}`,
                    borderRadius: '14px', padding: '16px', transition: 'border-color 0.2s',
                  }}>
                    {/* Status badge row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px' }}>{typeInfo.icon}</span>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: typeInfo.color }}>{typeInfo.label}</span>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 12px', borderRadius: '20px',
                        background: `${s.color}15`, border: `1px solid ${s.color}30`,
                      }}>
                        <span style={{ fontSize: '10px' }}>{s.icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: s.color }}>{s.label}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{r.title}</div>

                    {/* Description preview */}
                    <div style={{
                      fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      marginBottom: '10px',
                    }}>{r.description}</div>

                    {/* Status explanation */}
                    <div style={{
                      fontSize: '11px', color: s.color, fontStyle: 'italic',
                      marginBottom: '8px',
                    }}>
                      {s.icon} {s.desc}
                    </div>

                    {/* Metadata */}
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                      🕐 {new Date(r.created_at).toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short',
                        year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {!histLoading && !histError && history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px', opacity: 0.5 }}>📭</div>
                <h3 style={{ color: 'var(--text2)', fontWeight: 700, marginBottom: '8px' }}>Belum ada laporan</h3>
                <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '16px' }}>Laporan yang kamu kirim akan muncul di sini</p>
                <button onClick={() => setTab('kirim')} className="btn btn-primary" style={{ padding: '10px 22px' }}>📝 Kirim Laporan Pertama</button>
              </div>
            )}
            </>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
