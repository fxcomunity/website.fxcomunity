'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

/** Format timestamp as relative WIB time ("Baru saja", "5 menit lalu", dll) */
function useRelativeTime() {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  return useCallback((isoStr: string): { relative: string; absolute: string } => {
    const WIB_OFFSET = 7 * 60 // minutes
    const now = new Date()
    const date = new Date(isoStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60_000)
    const diffHr  = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr  / 24)

    let relative: string
    if (diffMin < 1)       relative = 'Baru saja'
    else if (diffMin < 60) relative = `${diffMin} menit lalu`
    else if (diffHr < 24)  relative = `${diffHr} jam lalu`
    else if (diffDay < 7)  relative = `${diffDay} hari lalu`
    else                   relative = `${Math.floor(diffDay / 7)} minggu lalu`

    const absolute = date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    return { relative, absolute }
  }, [tick])
}

interface Notification {
  id: number
  user_id: number | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const formatTime = useRelativeTime()

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setNotifications(data.data || [])
          setUnreadCount(data.data.filter((n: Notification) => !n.is_read).length)
        }
      }
    } catch (error) {
      console.error('Fetch notifications error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        fetchNotifications() // Refresh list
      }
    } catch (error) {
      console.error('Mark read error:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#3b82f6'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="notification-container" style={{ position: 'relative' }}>
      {/* Bell Icon with Badge */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="notification-bell"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Notifikasi"
      >
        <span style={{ fontSize: '24px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="notification-dropdown" style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '360px',
          maxHeight: '500px',
          background: 'rgba(15, 15, 25, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          zIndex: 1000,
          animation: 'slideDown 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Notifikasi</h3>
              <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                {unreadCount} baru dari {notifications.length} total
              </span>
            </div>
            <button 
              onClick={() => notifications.forEach(n => markAsRead(n.id))}
              disabled={unreadCount === 0}
              style={{
                background: unreadCount === 0 ? '#333' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: unreadCount === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Tandai semua
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
                Memuat...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.slice(0, 15).map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: notification.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.1)'
                  }}
                  className={notification.is_read ? '' : 'unread-notification'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: getTypeColor(notification.type),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: notification.is_read ? 500 : 700, 
                        marginBottom: '4px',
                        color: notification.is_read ? '#e4e4e7' : 'white'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#a1a1aa', 
                        lineHeight: '1.4',
                        marginBottom: '8px'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#71717a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {(() => {
                          const { relative, absolute } = formatTime(notification.created_at)
                          return (
                            <span title={absolute} style={{ cursor: 'default' }}>
                              🕐 {relative}
                            </span>
                          )
                        })()}
                        {!notification.is_read && (
                          <span style={{ 
                            width: '8px', height: '8px', 
                            background: '#3b82f6', 
                            borderRadius: '50%' 
                          }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <button 
              onClick={() => setShowDropdown(false)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#a1a1aa',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notification-container {
          position: relative;
        }
        .notification-bell:hover {
          background: rgba(255,255,255,0.1);
        }
        .notification-dropdown {
          animation: slideDown 0.2s ease-out;
        }
        .unread-notification:hover {
          background: rgba(59,130,246,0.2) !important;
        }
      `}</style>
    </div>
  )
}
