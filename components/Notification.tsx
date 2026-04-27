'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

/** Format timestamp relative */
function useRelativeTime() {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  return useCallback((isoStr: string): { relative: string; absolute: string } => {
    const now = new Date()
    const date = new Date(isoStr)
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60_000)
    const diffHr  = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    let relative: string
    if (diffMin < 1)       relative = 'Baru saja'
    else if (diffMin < 60) relative = `${diffMin}m lalu`
    else if (diffHr < 24)  relative = `${diffHr}j lalu`
    else if (diffDay < 7)  relative = `${diffDay}h lalu`
    else                   relative = `${Math.floor(diffDay / 7)}mg lalu`

    const absolute = date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    return { relative, absolute }
  }, [tick])
}

interface Notif {
  id: number
  user_id: number | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: JSX.Element }> = {
  success: {
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.25)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )
  },
  warning: {
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  },
  error: {
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.25)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    )
  },
  info: {
    color: '#00E5FF',
    bg: 'rgba(0,229,255,0.08)',
    border: 'rgba(0,229,255,0.2)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  }
}

export default function Notification() {
  const [notifs, setNotifs]             = useState<Notif[]>([])
  const [unread, setUnread]             = useState(0)
  const [open, setOpen]                 = useState(false)
  const [loading, setLoading]           = useState(true)
  const [markingAll, setMarkingAll]     = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const formatTime = useRelativeTime()

  // Close on outside click
  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (res.ok) {
        const d = await res.json()
        if (d.success) {
          setNotifs(d.data || [])
          setUnread((d.data || []).filter((n: Notif) => !n.is_read).length)
        }
      }
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(id)
  }, [fetchNotifs])

  async function markRead(id: number) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  async function markAllRead() {
    setMarkingAll(true)
    await Promise.all(notifs.filter(n => !n.is_read).map(n => markRead(n.id)))
    setMarkingAll(false)
  }

  const cfg = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG.info

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>

      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: open ? 'rgba(0,229,255,0.1)' : 'transparent',
          border: open ? '1px solid rgba(0,229,255,0.25)' : '1px solid transparent',
          cursor: 'pointer', padding: '8px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s ease', color: open ? '#00E5FF' : 'rgba(255,255,255,0.7)',
          width: '40px', height: '40px',
        }}
        title="Notifikasi"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '5px', right: '5px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white', borderRadius: '50%',
            width: '17px', height: '17px',
            fontSize: '10px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px #0a0a14',
            animation: 'notifPulse 2s infinite',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '48px', right: '0',
          width: '360px', maxHeight: '520px',
          background: 'rgba(10,10,22,0.97)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,229,255,0.12)',
          borderRadius: '18px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.05)',
          overflow: 'hidden', zIndex: 1000,
          animation: 'notifSlideDown 0.2s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 18px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '9px',
                background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E5FF',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Notifikasi</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                  {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
                </div>
              </div>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                style={{
                  background: 'rgba(0,229,255,0.1)', color: '#00E5FF',
                  border: '1px solid rgba(0,229,255,0.2)',
                  padding: '6px 12px', borderRadius: '8px',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                }}
              >
                {markingAll ? '...' : 'Tandai semua'}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,229,255,0.2)', borderTopColor: '#00E5FF', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Memuat...</div>
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', color: 'rgba(0,229,255,0.4)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Tidak ada notifikasi</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Notifikasi baru akan muncul di sini</div>
              </div>
            ) : (
              notifs.slice(0, 15).map((n) => {
                const c = cfg(n.type)
                const { relative, absolute } = formatTime(n.created_at)
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    style={{
                      padding: '13px 18px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: n.is_read ? 'default' : 'pointer',
                      transition: 'background 0.15s ease',
                      background: n.is_read ? 'transparent' : 'rgba(0,229,255,0.04)',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}
                    onMouseEnter={e => { if (!n.is_read) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,229,255,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.is_read ? 'transparent' : 'rgba(0,229,255,0.04)' }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                      background: c.bg, border: `1px solid ${c.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: c.color,
                    }}>
                      {c.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '3px' }}>
                        <div style={{
                          fontSize: '13px', fontWeight: n.is_read ? 500 : 700,
                          color: n.is_read ? 'rgba(255,255,255,0.6)' : '#fff',
                          lineHeight: '1.3',
                        }}>
                          {n.title}
                        </div>
                        {!n.is_read && (
                          <div style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: '#00E5FF', flexShrink: 0, marginTop: '3px',
                            boxShadow: '0 0 6px rgba(0,229,255,0.6)',
                          }} />
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5', marginBottom: '6px' }}>
                        {n.message}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                          padding: '2px 7px', borderRadius: '5px',
                          background: 'rgba(255,255,255,0.05)',
                        }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span title={absolute}>{relative}</span>
                        </div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '10px', color: c.color,
                          padding: '2px 7px', borderRadius: '5px',
                          background: c.bg, border: `1px solid ${c.border}`,
                          textTransform: 'capitalize',
                        }}>
                          {n.type}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                {notifs.length} notifikasi
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)', padding: '5px 12px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes notifSlideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notifPulse {
          0%, 100% { box-shadow: 0 0 0 2px #0a0a14; }
          50% { box-shadow: 0 0 0 2px #0a0a14, 0 0 0 4px rgba(239,68,68,0.3); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
