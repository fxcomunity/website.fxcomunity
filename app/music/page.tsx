'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import UserLayout from '@/components/UserLayout'

interface Genre { id: number; name: string; slug: string }
interface Track {
  id: number
  title: string
  artist: string | null
  album: string | null
  file_url: string
  cover_url: string | null
  duration_sec: number
  play_count: number
  genres: Genre[]
}

const GENRE_COLORS: Record<string, string> = {
  'Lo-Fi': '#00E5FF', 'Ambient': '#A855F7', 'Chill': '#10B981',
  'Focus': '#F59E0B', 'Jazz': '#EC4899', 'Electronic': '#6366F1',
  'Acoustic': '#F97316', 'Pop': '#FB7185', 'Indie': '#34D399',
  'Rock': '#EF4444', 'Hip-Hop': '#A78BFA', 'Classical': '#FBBF24',
}

function getColor(track: Track) {
  const g = track.genres?.[0]?.name
  return (g && GENRE_COLORS[g]) ? GENRE_COLORS[g] : '#00E5FF'
}

function fmt(s: number) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [activeGenre, setActiveGenre] = useState<string>('all')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/music', { next: { revalidate: 0 } })
      .then(r => r.json())
      .then(d => { if (d.success) setTracks(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const current = tracks.find(t => t.id === currentId) ?? null

  // Audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setProgress(audio.currentTime)
    const onDur  = () => setDuration(audio.duration || 0)
    const onEnded = () => { if (isRepeating) audio.play(); else handleNext() }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDur)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDur)
      audio.removeEventListener('ended', onEnded)
    }
  }, [isRepeating, currentId]) // eslint-disable-line

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const playTrack = useCallback((id: number) => {
    const audio = audioRef.current
    if (id === currentId) {
      if (!audio) return
      if (isPlaying) { audio.pause(); setIsPlaying(false) }
      else { audio.play(); setIsPlaying(true) }
    } else {
      setCurrentId(id)
      setProgress(0)
      setDuration(0)
      setIsPlaying(true)
      fetch(`/api/music/${id}`, { method: 'PATCH' }).catch(() => {})
    }
  }, [currentId, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentId) return
    audio.load()
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [currentId])

  const handleNext = useCallback(() => {
    const list = activeGenre === 'all' ? tracks : tracks.filter(t => t.genres?.some(g => g.name === activeGenre))
    if (!list.length) return
    const idx = list.findIndex(t => t.id === currentId)
    const next = isShuffled ? list[Math.floor(Math.random() * list.length)] : list[(idx + 1) % list.length]
    playTrack(next.id)
  }, [tracks, currentId, isShuffled, playTrack, activeGenre])

  function handlePrev() {
    const list = activeGenre === 'all' ? tracks : tracks.filter(t => t.genres?.some(g => g.name === activeGenre))
    if (!list.length) return
    const audio = audioRef.current
    if (audio && progress > 3) { audio.currentTime = 0; return }
    const idx = list.findIndex(t => t.id === currentId)
    playTrack(list[(idx - 1 + list.length) % list.length].id)
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !current) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play(); setIsPlaying(true) }
  }

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const audio = audioRef.current
    if (audio && duration) audio.currentTime = pct * duration
  }

  const progressPct = duration ? (progress / duration) * 100 : 0
  const color = current ? getColor(current) : '#00E5FF'

  // Extract unique genres from all tracks
  const allGenres = Array.from(new Set(tracks.flatMap(t => t.genres?.map(g => g.name) ?? [])))

  const filteredTracks = activeGenre === 'all'
    ? tracks
    : tracks.filter(t => t.genres?.some(g => g.name === activeGenre))

  return (
    <UserLayout>
      <audio
        ref={audioRef}
        src={current?.file_url ?? undefined}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      <div className="sv-root">

        {/* ═══ HERO HEADER ═══ */}
        <div className="sv-hero">
          <div className="sv-hero-bg" style={{ background: `radial-gradient(ellipse 60% 80% at 20% 50%, ${color}18 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 80% 20%, rgba(168,85,247,0.12) 0%, transparent 60%)` }} />
          <div className="sv-hero-inner">
            <div className="sv-hero-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div>
              <h1 className="sv-hero-title">SoundVault</h1>
              <p className="sv-hero-sub">{tracks.length} lagu · Komunitas FX Community</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="sv-empty">
            <div className="sv-spinner" />
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>Memuat koleksi musik...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="sv-empty">
            <div className="sv-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <h3 style={{ color: '#fff', margin: '14px 0 6px', fontWeight: 700 }}>Belum Ada Musik</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>Admin belum menambahkan musik. Hubungi admin!</p>
          </div>
        ) : (
          <div className="sv-layout">

            {/* ═══ LEFT — track list ═══ */}
            <div className="sv-list-col">

              {/* Genre Filter */}
              <div className="sv-genre-bar">
                <button
                  className={`sv-genre-pill ${activeGenre === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveGenre('all')}
                >All</button>
                {allGenres.map(g => (
                  <button
                    key={g}
                    className={`sv-genre-pill ${activeGenre === g ? 'active' : ''}`}
                    style={activeGenre === g ? { background: `${GENRE_COLORS[g] ?? '#00E5FF'}22`, color: GENRE_COLORS[g] ?? '#00E5FF', borderColor: `${GENRE_COLORS[g] ?? '#00E5FF'}44` } : {}}
                    onClick={() => setActiveGenre(g)}
                  >{g}</button>
                ))}
              </div>

              {/* Track count */}
              <div className="sv-track-count">
                {filteredTracks.length} lagu{activeGenre !== 'all' ? ` · ${activeGenre}` : ''}
              </div>

              {/* Track rows */}
              <div className="sv-track-list">
                {filteredTracks.map((track, i) => {
                  const isActive = track.id === currentId
                  const isHovered = track.id === hoveredId
                  const tColor = getColor(track)
                  return (
                    <div
                      key={track.id}
                      className={`sv-track-row ${isActive ? 'active' : ''}`}
                      style={isActive ? { borderColor: `${tColor}30`, background: `${tColor}08` } : {}}
                      onClick={() => playTrack(track.id)}
                      onMouseEnter={() => setHoveredId(track.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Left accent bar */}
                      {isActive && <div className="sv-track-bar" style={{ background: tColor }} />}

                      {/* Number / eq bars */}
                      <div className="sv-track-num">
                        {isActive && isPlaying ? (
                          <div className="sv-eq">
                            {[6, 12, 8].map((h, b) => (
                              <span key={b} className="sv-eq-bar" style={{ animationName: `svBar${b + 1}`, background: tColor }} />
                            ))}
                          </div>
                        ) : (isHovered && !isActive) ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        ) : (
                          <span style={{ color: isActive ? tColor : 'rgba(255,255,255,0.25)' }}>{i + 1}</span>
                        )}
                      </div>

                      {/* Cover art */}
                      <div className="sv-track-cover" style={{ boxShadow: isActive ? `0 4px 18px ${tColor}30` : 'none' }}>
                        {track.cover_url
                          ? <img src={track.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div className="sv-track-cover-fallback" style={{ background: `linear-gradient(135deg, ${tColor}20, ${tColor}08)` }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={`${tColor}60`} strokeWidth="1.5" strokeLinecap="round">
                                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                              </svg>
                            </div>}
                      </div>

                      {/* Info */}
                      <div className="sv-track-info">
                        <div className="sv-track-title" style={{ color: isActive ? '#fff' : undefined }}>{track.title}</div>
                        <div className="sv-track-artist">{track.artist || 'Unknown Artist'}</div>
                      </div>

                      {/* Genre pill */}
                      {track.genres?.[0] && (
                        <span className="sv-track-genre" style={{ color: tColor, background: `${tColor}10`, borderColor: `${tColor}22` }}>
                          {track.genres[0].name}
                        </span>
                      )}

                      {/* Duration */}
                      <span className="sv-track-dur">
                        {track.duration_sec > 0 ? fmt(track.duration_sec) : '--:--'}
                      </span>

                      {/* Plays */}
                      <div className="sv-track-plays">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        {(track.play_count || 0).toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ═══ RIGHT — Now Playing ═══ */}
            <div className="sv-player-col">
              {!current ? (
                <div className="sv-np-idle">
                  <div className="sv-np-idle-icon">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.2" strokeLinecap="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <p className="sv-np-idle-text">Pilih lagu untuk diputar</p>
                </div>
              ) : (
                <div className="sv-player" style={{ borderColor: `${color}20`, boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${color}10, inset 0 1px 0 rgba(255,255,255,0.04)` }}>
                  {/* Ambient glow */}
                  <div className="sv-player-glow" style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />

                  {/* Album art */}
                  <div className="sv-album-art" style={{ boxShadow: `0 20px 60px ${color}30, 0 0 0 1px ${color}18`, animation: isPlaying ? 'svFloat 4s ease-in-out infinite' : 'none' }}>
                    {current.cover_url
                      ? <img src={current.cover_url} alt={current.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                      : <div className="sv-album-fallback" style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}>
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={`${color}70`} strokeWidth="1" strokeLinecap="round">
                            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                          </svg>
                        </div>}
                  </div>

                  {/* Track info */}
                  <div className="sv-player-info">
                    <div className="sv-player-title">{current.title}</div>
                    <div className="sv-player-sub">
                      {current.artist || 'Unknown Artist'}
                      {current.album ? <> · <span style={{ opacity: 0.6 }}>{current.album}</span></> : ''}
                    </div>
                    {current.genres?.[0] && (
                      <span className="sv-player-genre" style={{ color, borderColor: `${color}30`, background: `${color}10` }}>
                        {current.genres[0].name}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="sv-progress-wrap">
                    <div className="sv-progress-bar" onClick={seekTo}>
                      <div className="sv-progress-track" />
                      <div className="sv-progress-fill" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}>
                        <div className="sv-progress-thumb" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                      </div>
                    </div>
                    <div className="sv-progress-times">
                      <span>{fmt(progress)}</span>
                      <span>{fmt(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="sv-controls">
                    <button
                      className={`sv-ctrl-icon ${isShuffled ? 'active' : ''}`}
                      style={isShuffled ? { color } : {}}
                      onClick={() => setIsShuffled(p => !p)}
                      title="Shuffle"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                        <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
                      </svg>
                      {isShuffled && <span className="sv-ctrl-dot" style={{ background: color }} />}
                    </button>

                    <button className="sv-ctrl-round" onClick={handlePrev} title="Previous">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                      </svg>
                    </button>

                    <button
                      className="sv-ctrl-play"
                      style={{ background: `linear-gradient(135deg, ${color}dd, ${color})`, boxShadow: `0 8px 28px ${color}50` }}
                      onClick={togglePlay}
                    >
                      {isPlaying
                        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#000"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="#000" style={{ marginLeft: '3px' }}><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                    </button>

                    <button className="sv-ctrl-round" onClick={handleNext} title="Next">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                      </svg>
                    </button>

                    <button
                      className={`sv-ctrl-icon ${isRepeating ? 'active' : ''}`}
                      style={isRepeating ? { color } : {}}
                      onClick={() => setIsRepeating(p => !p)}
                      title="Repeat"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                      </svg>
                      {isRepeating && <span className="sv-ctrl-dot" style={{ background: color }} />}
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="sv-volume">
                    <button className="sv-vol-icon" onClick={() => setIsMuted(p => !p)}>
                      {isMuted || volume === 0
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                        : volume < 0.5
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
                    </button>
                    <div className="sv-vol-slider-wrap">
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false) }}
                        className="sv-vol-slider"
                        style={{ '--accent': color } as React.CSSProperties}
                      />
                    </div>
                    <span className="sv-vol-pct">{Math.round((isMuted ? 0 : volume) * 100)}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <style>{`
        /* ── SoundVault Root ── */
        .sv-root { min-height: 100vh; padding-bottom: 60px; }

        /* ── Hero ── */
        .sv-hero {
          position: relative; overflow: hidden;
          padding: 28px 24px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 0;
        }
        .sv-hero-bg { position: absolute; inset: 0; transition: background 0.6s ease; pointer-events: none; }
        .sv-hero-inner {
          position: relative; max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; gap: 14px;
        }
        .sv-hero-icon {
          width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg, #00B8D4, #00E5FF);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(0,229,255,0.35);
        }
        .sv-hero-title { font-size: 24px; font-weight: 900; color: #fff; margin: 0; letter-spacing: -0.5px; }
        .sv-hero-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin: 3px 0 0; }
        .sv-badge-beta {
          margin-left: auto; padding: 4px 12px; border-radius: 20px;
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
          font-size: 10px; font-weight: 800; color: #F87171; letter-spacing: 1px;
        }

        /* ── Layout ── */
        .sv-layout {
          max-width: 1100px; margin: 0 auto; padding: 24px 20px;
          display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 24px;
        }

        /* ── Genre bar ── */
        .sv-genre-bar {
          display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .sv-genre-pill {
          padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.45);
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
        }
        .sv-genre-pill:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
        .sv-genre-pill.active {
          background: rgba(0,229,255,0.1); color: #00E5FF;
          border-color: rgba(0,229,255,0.3);
        }

        /* ── Track count ── */
        .sv-track-count {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.25);
          letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 8px;
        }

        /* ── Track list ── */
        .sv-track-list { display: flex; flex-direction: column; gap: 3px; }

        .sv-track-row {
          display: grid;
          grid-template-columns: 28px 44px 1fr 90px 46px 54px;
          align-items: center; gap: 12px;
          padding: 9px 12px; border-radius: 12px; cursor: pointer;
          border: 1px solid transparent;
          background: rgba(255,255,255,0.015);
          transition: all 0.18s; position: relative; overflow: hidden;
        }
        .sv-track-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.06); }
        .sv-track-row.active { }

        .sv-track-bar {
          position: absolute; left: 0; top: 15%; bottom: 15%;
          width: 3px; border-radius: 0 3px 3px 0;
        }

        .sv-track-num {
          width: 28px; display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: rgba(255,255,255,0.25); font-weight: 600; flex-shrink: 0;
        }

        /* EQ animation */
        .sv-eq { display: flex; gap: 2px; align-items: flex-end; height: 16px; }
        .sv-eq-bar {
          display: block; width: 3px; border-radius: 2px; animation-duration: 0.6s;
          animation-iteration-count: infinite; animation-direction: alternate; animation-timing-function: ease-in-out;
        }
        @keyframes svBar1 { 0%{height:4px} 100%{height:14px} }
        @keyframes svBar2 { 0%{height:12px} 100%{height:4px} }
        @keyframes svBar3 { 0%{height:7px} 100%{height:13px} }

        .sv-track-cover {
          width: 44px; height: 44px; border-radius: 10px; overflow: hidden;
          flex-shrink: 0; transition: box-shadow 0.3s;
        }
        .sv-track-cover-fallback {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
        }

        .sv-track-info { min-width: 0; }
        .sv-track-title {
          font-size: 13.5px; font-weight: 700; color: rgba(255,255,255,0.85);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.2s;
        }
        .sv-track-artist { font-size: 11.5px; color: rgba(255,255,255,0.35); margin-top: 2px; }

        .sv-track-genre {
          font-size: 9px; font-weight: 800; padding: 3px 9px; border-radius: 20px;
          border: 1px solid; white-space: nowrap; letter-spacing: 0.4px;
        }

        .sv-track-dur {
          font-size: 12px; color: rgba(255,255,255,0.25); font-weight: 600;
          text-align: right; font-variant-numeric: tabular-nums;
        }

        .sv-track-plays {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 600;
        }

        /* ── Right column ── */
        .sv-player-col { position: sticky; top: 80px; align-self: start; }

        /* Idle state */
        .sv-np-idle {
          padding: 60px 24px; text-align: center;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
        }
        .sv-np-idle-icon {
          width: 80px; height: 80px; border-radius: 24px; margin: 0 auto 16px;
          background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
        }
        .sv-np-idle-text { color: rgba(255,255,255,0.3); font-size: 13px; margin: 0; }

        /* Player card */
        .sv-player {
          background: rgba(10,14,28,0.85); border: 1px solid; border-radius: 24px;
          padding: 24px; backdrop-filter: blur(20px); position: relative; overflow: hidden;
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .sv-player-glow {
          position: absolute; inset: -60px; pointer-events: none;
          transition: background 0.5s; opacity: 0.6;
        }

        /* Album art */
        .sv-album-art {
          position: relative; width: 100%; aspect-ratio: 1; border-radius: 16px;
          margin-bottom: 20px; overflow: hidden;
          transition: box-shadow 0.4s, transform 0.3s;
        }
        .sv-album-art:hover { transform: scale(1.02); }
        @keyframes svFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .sv-album-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }

        /* Player info */
        .sv-player-info { margin-bottom: 18px; }
        .sv-player-title {
          font-size: 17px; font-weight: 800; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: -0.2px; margin-bottom: 4px;
        }
        .sv-player-sub { font-size: 12.5px; color: rgba(255,255,255,0.4); }
        .sv-player-genre {
          display: inline-block; margin-top: 8px;
          font-size: 9px; font-weight: 800; letter-spacing: 0.8px; padding: 3px 10px;
          border-radius: 20px; border: 1px solid; text-transform: uppercase;
        }

        /* Progress */
        .sv-progress-wrap { margin-bottom: 20px; }
        .sv-progress-bar {
          height: 5px; border-radius: 5px; cursor: pointer;
          position: relative; margin-bottom: 8px; overflow: visible;
        }
        .sv-progress-track {
          position: absolute; inset: 0; border-radius: 5px;
          background: rgba(255,255,255,0.07);
        }
        .sv-progress-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          border-radius: 5px; transition: width 0.1s linear;
        }
        .sv-progress-thumb {
          position: absolute; right: -6px; top: 50%; transform: translateY(-50%);
          width: 13px; height: 13px; border-radius: 50%;
        }
        .sv-progress-times {
          display: flex; justify-content: space-between;
          font-size: 11px; color: rgba(255,255,255,0.25); font-variant-numeric: tabular-nums;
        }

        /* Controls */
        .sv-controls {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-bottom: 18px;
        }
        .sv-ctrl-icon {
          position: relative; background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.28); padding: 8px; border-radius: 8px;
          transition: all 0.18s; display: flex; align-items: center; justify-content: center;
        }
        .sv-ctrl-icon:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); }
        .sv-ctrl-icon.active { }
        .sv-ctrl-dot {
          position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
        }
        .sv-ctrl-round {
          width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); transition: all 0.18s;
        }
        .sv-ctrl-round:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2); transform: scale(1.06); }
        .sv-ctrl-play {
          width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s; flex-shrink: 0;
        }
        .sv-ctrl-play:hover { transform: scale(1.08); }
        .sv-ctrl-play:active { transform: scale(0.96); }

        /* Volume */
        .sv-volume { display: flex; align-items: center; gap: 8px; }
        .sv-vol-icon {
          background: none; border: none; cursor: pointer; flex-shrink: 0;
          color: rgba(255,255,255,0.35); display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .sv-vol-icon:hover { color: rgba(255,255,255,0.7); }
        .sv-vol-slider-wrap { flex: 1; }
        .sv-vol-slider {
          width: 100%; height: 3px; border-radius: 3px;
          -webkit-appearance: none; appearance: none;
          background: rgba(255,255,255,0.1); cursor: pointer; outline: none;
        }
        .sv-vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%;
          background: var(--accent, #00E5FF); cursor: pointer;
          box-shadow: 0 0 6px var(--accent, #00E5FF);
          transition: transform 0.15s;
        }
        .sv-vol-slider::-webkit-slider-thumb:hover { transform: scale(1.3); }
        .sv-vol-pct {
          font-size: 11px; color: rgba(255,255,255,0.2); width: 26px;
          text-align: right; font-variant-numeric: tabular-nums;
        }

        /* Loading / empty */
        .sv-empty { display: flex; flex-direction: column; align-items: center; padding: 100px 20px; text-align: center; }
        .sv-empty-icon {
          width: 80px; height: 80px; border-radius: 24px; margin-bottom: 16px;
          background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
        }
        .sv-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid rgba(0,229,255,0.1); border-top-color: #00E5FF;
          animation: svSpin 0.9s linear infinite;
        }
        @keyframes svSpin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .sv-layout { grid-template-columns: 1fr; }
          .sv-player-col { position: static; }
          .sv-player { max-width: 400px; margin: 0 auto; }
        }
        @media (max-width: 600px) {
          .sv-track-row { grid-template-columns: 28px 40px 1fr 42px; }
          .sv-track-genre, .sv-track-plays { display: none; }
          .sv-hero { padding: 20px 16px 18px; }
          .sv-layout { padding: 16px; gap: 20px; }
        }
      `}</style>
    </UserLayout>
  )
}
