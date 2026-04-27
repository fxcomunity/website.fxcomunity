'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Notification from './Notification'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState<{ username: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropOpen, setUserDropOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userDropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    fetch('/api/auth/me')
      .then(res => {
        if (res.status === 503) { router.push('/maintenance'); return }
        return res.json()
      })
      .then(data => {
        if (data?.data) setUser(data.data)
        setLoading(false)
      })
      .catch(() => { setLoading(false) })
  }, [router])

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropRef.current && !userDropRef.current.contains(e.target as Node)) {
        setUserDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/library?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  // ── SVG Icons ──
  const IconHome = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
  const IconLibrary = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
  const IconDashboard = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
  const IconProfile = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
  const IconAdmin = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
  const IconLogout = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
  const IconReport = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )

  const IconPopular = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  )
  const IconFavorites = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )

  const IconMusic = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  )

  const NAV_LINKS = [
    { name: 'Home',      path: '/dashboard', icon: <IconHome /> },
    { name: 'Library',   path: '/library',   icon: <IconLibrary /> },
    { name: 'Music',     path: '/music',     icon: <IconMusic /> },
    { name: 'Popular',   path: '/popular',   icon: <IconPopular /> },
    { name: 'Favorites', path: '/favorites', icon: <IconFavorites /> },
  ]

  const MOBILE_BOTTOM_NAV = [
    { name: 'HOME',          path: '/dashboard', icon: <IconHome /> },
    { name: 'POPULAR',       path: '/popular',   icon: <IconPopular /> },
    { name: 'MUSIC',         path: '/music',     icon: <IconMusic /> },
    { name: 'LAPORAN',       path: '/report',    icon: <IconReport /> },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{ fontSize: '44px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'var(--text2)', fontWeight: 600, fontSize: '14px' }}>Tunggu sebentar...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Header ── */}
      <header style={{
        height: '64px',
        background: 'rgba(8, 11, 20, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0, 229, 255, 0.08)',
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        {/* LEFT: Hamburger + Logo + Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Hamburger (mobile/tablet) */}
          <button
            className="hide-desktop hdr-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: isMenuOpen ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.04)',
              color: '#fff',
              transition: 'background 0.2s ease, transform 0.2s ease',
            }}
          >
            <span style={{ fontSize: '20px' }}>{isMenuOpen ? '✕' : '☰'}</span>
          </button>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img 
              src="/logo.png" 
              alt="FXC Logo" 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
              }}
            />
            <div style={{
              fontWeight: 900, fontSize: '15px', letterSpacing: '1px',
              color: '#fff',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              FXCOMMUNITY
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hide-mobile-tablet" style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px' }}>
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  style={{
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary)' : 'var(--text2)',
                    fontSize: '13px', fontWeight: 600,
                    padding: '6px 12px', borderRadius: '8px',
                    background: isActive ? 'rgba(0,229,255,0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--primary)' : 'var(--text3)' }}>{link.icon}</span>
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* RIGHT: Search + Theme + Notifications + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

          {/* 🔍 Search button */}
          <button
            className="hdr-btn"
            onClick={() => setSearchOpen(v => !v)}
            aria-label="Search"
            title="Cari materi"
            style={{ color: searchOpen ? 'var(--primary)' : 'var(--text2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* 🌙/☀️ Theme toggle */}
          <button
            className="hdr-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark'
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          {/* 🔔 Notifications – always visible when logged in */}
          {user && <Notification />}

          {/* Auth */}
          {user ? (
            <div ref={userDropRef} style={{ position: 'relative', marginLeft: '4px' }}>
              {/* Avatar button */}
              <button
                onClick={() => setUserDropOpen(v => !v)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}
                aria-label="User menu"
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  overflow: 'hidden',
                  border: userDropOpen ? '2px solid var(--primary)' : '2px solid rgba(0,229,255,0.4)',
                  boxShadow: userDropOpen ? '0 0 0 3px rgba(0,229,255,0.15)' : '0 0 8px rgba(0,229,255,0.15)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.username || 'G'}&background=random`}
                    alt="avatar"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                {/* Chevron */}
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: userDropOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {userDropOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: 'rgba(10,14,26,0.98)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(0,229,255,0.12)',
                  borderRadius: '14px',
                  minWidth: '200px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.06)',
                  overflow: 'hidden',
                  zIndex: 300,
                  animation: 'dropIn 0.18s cubic-bezier(0.4,0,0.2,1)',
                }}>
                  {/* Header info */}
                  <div style={{
                    padding: '14px 16px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{user.first_name || user.username || user.email}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{user.role}</div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '8px' }}>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '9px',
                        textDecoration: 'none', color: 'var(--text)',
                        fontSize: '13px', fontWeight: 600,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text3)' }}><IconDashboard /></span>
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '9px',
                        textDecoration: 'none', color: 'var(--text)',
                        fontSize: '13px', fontWeight: 600,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text3)' }}><IconProfile /></span>
                      Profile
                    </Link>

                    {['Owner', 'Admin'].includes(user.role) && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 12px', borderRadius: '9px',
                          textDecoration: 'none',
                          color: 'var(--primary)',
                          fontSize: '13px', fontWeight: 700,
                          transition: 'background 0.15s',
                          background: 'rgba(0,229,255,0.05)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.12)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.05)')}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)' }}><IconAdmin /></span>
                        Panel Admin
                      </Link>
                    )}

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />

                    <button
                      onClick={() => { setUserDropOpen(false); handleLogout() }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        width: '100%', padding: '9px 12px', borderRadius: '9px',
                        background: 'transparent',
                        border: 'none', color: '#F87171',
                        fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}><IconLogout /></span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none', marginLeft: '4px' }}>
              <button style={{
                background: 'transparent',
                color: 'var(--primary)',
                border: '1.5px solid rgba(0,229,255,0.4)',
                padding: '6px 14px', borderRadius: '8px',
                fontWeight: 800, fontSize: '12px',
                cursor: 'pointer', letterSpacing: '0.5px',
              }}>LOGIN</button>
            </Link>
          )}
        </div>
      </header>

      {/* ── Search Dropdown Bar ── */}
      <div style={{
        position: 'sticky',
        top: '64px',
        zIndex: 199,
        overflow: 'hidden',
        maxHeight: searchOpen ? '80px' : '0',
        transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(8,11,20,0.98)',
        backdropFilter: 'blur(24px)',
        borderBottom: searchOpen ? '1px solid rgba(0,229,255,0.12)' : 'none',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              opacity: 0.4, pointerEvents: 'none',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari materi trading... (tekan Enter)"
              style={{
                width: '100%', padding: '10px 14px 10px 40px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(0,229,255,0.2)',
                borderRadius: '10px', color: 'var(--text)',
                fontFamily: 'inherit', fontSize: '14px', outline: 'none',
              }}
              onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
            />
          </div>
          <button type="submit" style={{
            background: 'linear-gradient(135deg, #00B8D4, #00E5FF)',
            border: 'none', color: '#000', padding: '10px 18px',
            borderRadius: '10px', fontWeight: 800, fontSize: '13px',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>Cari</button>
          <button type="button" onClick={() => setSearchOpen(false)} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            color: 'var(--text2)', padding: '10px 12px',
            borderRadius: '10px', cursor: 'pointer', flexShrink: 0, fontSize: '13px',
          }}>✕</button>
        </form>
      </div>

      {/* ── Sidebar Overlay ── */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
            zIndex: 998, backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* ── Sidebar (mobile) ── */}
      <div style={{
        position: 'fixed', top: '64px', left: 0, bottom: 0,
        width: '270px',
        background: 'rgba(8,11,20,0.98)',
        backdropFilter: 'blur(24px)',
        zIndex: 999,
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRight: '1px solid rgba(0,229,255,0.08)',
        padding: '16px 12px',
        overflowY: 'auto',
      }}>
        {/* User info */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '12px',
            background: 'rgba(0,229,255,0.05)',
            borderRadius: '12px', border: '1px solid rgba(0,229,255,0.12)',
          }}>
            <img
              src={`https://ui-avatars.com/api/?name=${user.first_name || user.username || user.email}&background=random`}
              alt="avatar"
              style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(0,229,255,0.4)' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>{user.first_name || user.username || user.email}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{user.role}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.path
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  padding: '11px 13px', borderRadius: '10px',
                  background: isActive ? 'rgba(0,229,255,0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                  fontSize: '14px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--primary)' : 'var(--text3)' }}>{link.icon}</span>
                {link.name}
              </Link>
            )
          })}

          {/* Report links in sidebar */}
          {/* Removed - now in bottom navigator */}

          <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }} />

          {/* Theme toggle in sidebar */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              color: 'var(--text2)', textAlign: 'left',
              padding: '11px 13px', fontSize: '14px',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px',
              cursor: 'pointer', borderRadius: '10px', width: '100%',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text3)' }}>
              {theme === 'dark'
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </span>
            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(220,50,50,0.08)',
                border: '1px solid rgba(220,50,50,0.2)',
                color: '#F87171', textAlign: 'left',
                padding: '11px 13px', fontSize: '14px',
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', borderRadius: '10px', width: '100%',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}><IconLogout /></span>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main style={{ paddingBottom: '80px' }}>
        {children}
      </main>

      {/* ── Bottom Navigation (Mobile & Tablet Only) ── */}
      <div className="mobile-bottom-nav">
        {MOBILE_BOTTOM_NAV.map(link => {
          const isActive = pathname === link.path
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`mnav-item${isActive ? ' mnav-active' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                flex: '1 1 0',
                position: 'relative',
                gap: '4px',
                padding: '6px 0 8px',
                minWidth: 0,
                color: isActive ? '#00E5FF' : 'rgba(255,255,255,0.4)',
                transition: 'color 0.2s',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '30px',
                  height: '2.5px',
                  background: 'linear-gradient(90deg, #00B8D4, #00E5FF)',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 0 8px rgba(0,229,255,0.8)',
                }} />
              )}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                flexShrink: 0,
                transition: 'transform 0.2s, filter 0.2s',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                filter: isActive ? 'drop-shadow(0 0 5px rgba(0,229,255,0.6))' : 'none',
              }}>
                {link.icon && typeof link.icon === 'object' && 'type' in link.icon ? (
                  <link.icon.type {...link.icon.props} width="22" height="22" />
                ) : link.icon}
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: isActive ? 700 : 500,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                {link.name}
              </span>
            </Link>
          )
        })}
      </div>





      <style jsx>{`
        .hdr-btn {
          background: transparent;
          border: none;
          color: var(--text2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
          min-width: 36px;
          height: 36px;
        }
        .hdr-btn:hover {
          background: rgba(255,255,255,0.07);
          color: var(--text);
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }



        /* ── Bottom Nav (Mobile & Tablet) ── */
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 1024px) {
          .mobile-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 62px;
            background: rgba(8, 11, 20, 0.98);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -6px 30px rgba(0, 0, 0, 0.6);
            z-index: 500;
            overflow: hidden;
          }
          .mnav-item {
            flex: 1 1 25%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.4);
            transition: color 0.2s;
            position: relative;
            gap: 4px;
            padding: 6px 0 8px;
            min-width: 0;
          }
          .mnav-item.mnav-active {
            color: #00E5FF;
          }
          /* top indicator bar */
          .mnav-bar {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 2.5px;
            background: linear-gradient(90deg, #00B8D4, #00E5FF);
            border-radius: 0 0 4px 4px;
            box-shadow: 0 0 8px rgba(0,229,255,0.8);
          }
          /* icon */
          .mnav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            transition: transform 0.2s, filter 0.2s;
          }
          .mnav-item.mnav-active .mnav-icon {
            transform: scale(1.1);
            filter: drop-shadow(0 0 5px rgba(0,229,255,0.6));
          }
          /* label */
          .mnav-label {
            font-size: 9px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            line-height: 1;
            white-space: nowrap;
          }
          .mnav-item.mnav-active .mnav-label {
            font-weight: 700;
          }
        }

        /* ── Existing Visibility Classes ── */
        @media (min-width: 1025px) { .hide-desktop { display: none !important; } }
        @media (max-width: 1024px) {
          .hide-tablet { display: none !important; }
          .hide-mobile-tablet { display: none !important; }
        }
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>
    </div>
  )
}
