'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserLayout from '@/components/UserLayout'

interface User { id: number; username: string; email: string; role: string; status: string; created_at: string; email_verified: boolean }
interface PDF { id: number; name: string; category: string; thumbnail: string; views: number; downloads: number }

// ── SVG Icon components ──────────────────────────────────────────────────────
const IconBook    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconHeart   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconEye     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconDl      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconMail    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconUser    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconBell    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconClip    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconCalendar= () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconSend    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconCheck   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconSpinner = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>

export default function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [favPdfs, setFavPdfs] = useState<PDF[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d?.data) { setUser(d.data); loadData(); loadNotifications(); loadReports() }
      else router.push('/login')
    }).catch(() => router.push('/login'))
  }, [router])

  async function loadData() {
    try {
      const res = await fetch('/api/pdfs')
      const data = await res.json()
      if (data.success) {
        setPdfs(data.data)
        const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
        setFavPdfs(data.data.filter((p: PDF) => favIds.includes(p.id)))
      }
    } catch {}
    setLoading(false)
  }
  async function loadNotifications() {
    try { const d = await (await fetch('/api/notifications')).json(); if (d.success) setNotifications(d.data.slice(0, 5)) } catch {}
  }
  async function loadReports() {
    try { const d = await (await fetch('/api/report?mine=1')).json(); if (d.success) setReports(d.data.slice(0, 3)) } catch {}
  }

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', background: '#080B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <IconSpinner />
        <p style={{ color: '#888', fontSize: '13px', fontWeight: 600, marginTop: '14px' }}>Memuat dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const joinedDate = new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalViews = pdfs.reduce((a, b) => a + b.views, 0)
  const totalDownloads = pdfs.reduce((a, b) => a + b.downloads, 0)
  const unreadNotifs = notifications.filter(n => !n.is_read).length

  const STATS = [
    { label: 'Total Materi', value: pdfs.length,      Icon: IconBook,  color: '#00E5FF' },
    { label: 'Favorit',      value: favPdfs.length,   Icon: IconHeart, color: '#F43F5E' },
    { label: 'Total Views',  value: totalViews,       Icon: IconEye,   color: '#A855F7' },
    { label: 'Downloads',    value: totalDownloads,   Icon: IconDl,    color: '#F59E0B' },
  ]
  const QUICK_LINKS = [
    { name: 'Library',       path: '/library',    Icon: IconBook,  desc: 'Baca materi', color: '#00E5FF' },
    { name: 'Favorit',       path: '/favorites',  Icon: IconHeart, desc: `${favPdfs.length} tersimpan`, color: '#F43F5E' },
    { name: 'Kirim Laporan', path: '/report',     Icon: IconSend,  desc: 'Bug & saran', color: '#A855F7' },
    { name: 'Profil',        path: '/profile',    Icon: IconUser,  desc: 'Edit akun',   color: '#F59E0B' },
  ]
  const STATUS_COLOR: Record<string, string> = {
    Menunggu: '#F59E0B', Ditinjau: '#00E5FF', Selesai: '#10B981',
    open: '#00E5FF', in_progress: '#F59E0B', resolved: '#10B981', closed: '#6B7280',
  }

  return (
    <UserLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 40px' }} className="dash-wrap">

        {/* ── Profile Hero ── */}
        <div className="profile-hero" style={{
          background: 'linear-gradient(135deg, rgba(0,184,212,0.07), rgba(168,85,247,0.07))',
          border: '1px solid rgba(0,229,255,0.12)',
          borderRadius: '20px', padding: '24px',
          display: 'flex', alignItems: 'center', gap: '20px',
          flexWrap: 'wrap', marginBottom: '24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,229,255,0.05)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          {/* Avatar */}
          <div className="profile-avatar" style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={`https://ui-avatars.com/api/?name=${user.username}&background=random&size=80&bold=true`}
              alt="avatar"
              style={{ width: '78px', height: '78px', borderRadius: '50%', border: '3px solid rgba(0,229,255,0.45)', boxShadow: '0 0 20px rgba(0,229,255,0.18)', display: 'block' }}
            />
            {user.email_verified && (
              <div title="Email terverifikasi" style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '22px', height: '22px', borderRadius: '50%',
                background: '#10B981', border: '2px solid #080B14',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}>
                <IconCheck />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="profile-info" style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
              Halo, {user.username}!
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ background: 'rgba(0,229,255,0.1)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.22)', padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{user.role}</span>
              <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{user.status}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.04)', color: 'var(--text3)', border: '1px solid rgba(255,255,255,0.07)', padding: '3px 11px', borderRadius: '20px', fontSize: '11px' }}>
                <IconCalendar /> {joinedDate}
              </span>
            </div>
          </div>

          <Link href="/profile" className="edit-profil-btn" style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text2)', padding: '8px 15px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600, flexShrink: 0, transition: 'all 0.2s',
          }}>
            <IconEdit /> Edit Profil
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px 14px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: s.color, opacity: 0.9 }}>
                <s.Icon />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Links ── */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Akses Cepat</h2>
          <div className="quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {QUICK_LINKS.map(q => (
              <Link key={q.name} href={q.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '18px 12px', textAlign: 'center',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = q.color + '40'; el.style.background = q.color + '10'; el.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.03)'; el.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: q.color }}>
                    <q.Icon />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{q.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>{q.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bottom: Notifications + Reports ── */}
        <div className="bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Notifications */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                <span style={{ color: 'var(--text2)' }}><IconBell /></span> Notifikasi
                {unreadNotifs > 0 && <span style={{ background: '#F43F5E', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '1px 7px', borderRadius: '20px' }}>{unreadNotifs}</span>}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', opacity: 0.3 }}><IconBell /></div>
                  Tidak ada notifikasi
                </div>
              ) : notifications.map(n => (
                <div key={n.id} style={{
                  padding: '11px 12px', borderRadius: '10px',
                  background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(0,229,255,0.05)',
                  border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(0,229,255,0.15)'}`,
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: n.is_read ? 'var(--text2)' : 'var(--text)' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{n.message}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reports */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                <span style={{ color: 'var(--text2)' }}><IconClip /></span> Laporan Saya
              </h3>
              <Link href="/report?tab=riwayat" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Lihat semua →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--text3)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', opacity: 0.3 }}><IconClip /></div>
                  Belum ada laporan
                </div>
              ) : reports.map((r: any) => (
                <div key={r.id} style={{ padding: '11px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.title || r.type}</div>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', flexShrink: 0,
                      background: (STATUS_COLOR[r.status] || '#6B7280') + '20',
                      color: STATUS_COLOR[r.status] || '#6B7280',
                      border: `1px solid ${(STATUS_COLOR[r.status] || '#6B7280')}40`,
                    }}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconCalendar /> {new Date(r.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        /* ── Tablet (max 768px) ── */
        @media (max-width: 768px) {
          .dash-wrap { padding: 16px 12px 32px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Mobile (max 480px) ── */
        @media (max-width: 480px) {
          .dash-wrap { padding: 12px 10px 28px !important; }

          /* Profile hero: stack vertically, center everything */
          .profile-hero {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 20px 16px !important;
            gap: 14px !important;
          }
          .profile-info {
            width: 100% !important;
            min-width: 0 !important;
          }
          .profile-info h1 { font-size: 18px !important; }
          .profile-info p  { white-space: normal !important; text-align: center !important; }
          .profile-info > div { justify-content: center !important; }
          .edit-profil-btn {
            width: 100% !important;
            justify-content: center !important;
          }

          /* Stats: 2x2 */
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }

          /* Quick links: 2x2 */
          .quick-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }

          /* Bottom: single column */
          .bottom-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>
    </UserLayout>
  )
}
