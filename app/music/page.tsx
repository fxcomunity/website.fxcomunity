'use client'
import { useState, useRef, useEffect } from 'react'
import UserLayout from '@/components/UserLayout'

interface Track {
  id: number
  title: string
  artist: string
  duration: string
  genre: string
  cover: string
  color: string
}

const TRACKS: Track[] = [
  { id: 1, title: 'Morning Market Open', artist: 'FX Lofi', duration: '3:42', genre: 'Lo-Fi', cover: '📈', color: '#00E5FF' },
  { id: 2, title: 'Candlestick Rain', artist: 'Chart Beats', duration: '4:15', genre: 'Ambient', cover: '🕯️', color: '#A855F7' },
  { id: 3, title: 'Bull Run Vibes', artist: 'TraderWave', duration: '2:58', genre: 'Chill', cover: '🐂', color: '#10B981' },
  { id: 4, title: 'Deep Focus Trading', artist: 'FX Lofi', duration: '5:30', genre: 'Focus', cover: '🎯', color: '#F59E0B' },
  { id: 5, title: 'London Session', artist: 'Session Beats', duration: '3:20', genre: 'Jazz', cover: '🌆', color: '#EC4899' },
  { id: 6, title: 'Risk Management', artist: 'Chart Beats', duration: '4:05', genre: 'Ambient', cover: '⚖️', color: '#06B6D4' },
  { id: 7, title: 'NY Closing Bell', artist: 'TraderWave', duration: '3:48', genre: 'Lo-Fi', cover: '🔔', color: '#8B5CF6' },
  { id: 8, title: 'Asian Session Drift', artist: 'FX Lofi', duration: '6:12', genre: 'Focus', cover: '🌙', color: '#00E5FF' },
]

function formatBar(pct: number) {
  return `${Math.round(pct)}%`
}

export default function MusicPage() {
  const [currentId, setCurrentId] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [liked, setLiked] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const current = TRACKS.find(t => t.id === currentId)!

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            handleNext()
            return 0
          }
          return p + 0.2
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, currentId])

  const handlePlay = (id?: number) => {
    if (id && id !== currentId) {
      setCurrentId(id)
      setProgress(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(p => !p)
    }
  }

  const handleNext = () => {
    const idx = TRACKS.findIndex(t => t.id === currentId)
    const next = isShuffled
      ? TRACKS[Math.floor(Math.random() * TRACKS.length)]
      : TRACKS[(idx + 1) % TRACKS.length]
    setCurrentId(next.id)
    setProgress(0)
  }

  const handlePrev = () => {
    if (progress > 10) { setProgress(0); return }
    const idx = TRACKS.findIndex(t => t.id === currentId)
    const prev = TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length]
    setCurrentId(prev.id)
    setProgress(0)
  }

  const toggleLike = (id: number) => {
    setLiked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const genreColors: Record<string, string> = {
    'Lo-Fi': '#00E5FF', 'Ambient': '#A855F7', 'Chill': '#10B981',
    'Focus': '#F59E0B', 'Jazz': '#EC4899',
  }

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', paddingBottom: '120px' }}>

        {/* Page Header */}
        <div style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.07) 0%, transparent 65%)',
          padding: '32px 20px 0',
          borderBottom: '1px solid rgba(0,229,255,0.06)',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #00B8D4, #00E5FF)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Music</h1>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Musik untuk trading focus — UI Testing</p>
              </div>
              <span style={{
                marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                fontSize: '11px', fontWeight: 700, color: '#F87171', letterSpacing: '0.5px',
              }}>BETA</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '20px' }}>

            {/* Track List */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                Daftar Lagu — {TRACKS.length} tracks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {TRACKS.map((track, i) => {
                  const isActive = track.id === currentId
                  const isLiked = liked.includes(track.id)
                  return (
                    <div
                      key={track.id}
                      onClick={() => handlePlay(track.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '12px 16px', borderRadius: '12px',
                        background: isActive ? `rgba(0,229,255,0.06)` : 'rgba(255,255,255,0.02)',
                        border: isActive ? '1px solid rgba(0,229,255,0.18)' : '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                    >
                      {/* Active glow bar */}
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                          background: 'linear-gradient(180deg, #00E5FF, #00B8D4)',
                          borderRadius: '3px 0 0 3px',
                        }} />
                      )}

                      {/* Track number / playing indicator */}
                      <div style={{ width: '28px', textAlign: 'center', flexShrink: 0 }}>
                        {isActive && isPlaying
                          ? (
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', justifyContent: 'center', height: '16px' }}>
                              {[1, 2, 3].map(b => (
                                <div key={b} style={{
                                  width: '3px', background: '#00E5FF', borderRadius: '2px',
                                  animation: `musicBar${b} 0.7s ease-in-out infinite`,
                                  height: `${8 + b * 3}px`,
                                }} />
                              ))}
                            </div>
                          )
                          : <span style={{ fontSize: '12px', color: isActive ? '#00E5FF' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{i + 1}</span>
                        }
                      </div>

                      {/* Cover */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${track.color}22, ${track.color}44)`,
                        border: `1px solid ${track.color}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: isActive ? `0 0 16px ${track.color}30` : 'none',
                        transition: 'box-shadow 0.3s',
                      }}>
                        {track.cover}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: '13.5px',
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
                          marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{track.title}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{track.artist}</div>
                      </div>

                      {/* Genre */}
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px',
                        background: `${genreColors[track.genre] || '#6B7280'}15`,
                        color: genreColors[track.genre] || '#6B7280',
                        border: `1px solid ${genreColors[track.genre] || '#6B7280'}25`,
                        flexShrink: 0,
                      }}>{track.genre}</span>

                      {/* Like */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleLike(track.id) }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: isLiked ? '#F87171' : 'rgba(255,255,255,0.2)',
                          padding: '4px', transition: 'color 0.2s', flexShrink: 0,
                          fontSize: '14px',
                        }}
                      >
                        {isLiked ? '❤️' : '♡'}
                      </button>

                      {/* Duration */}
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, flexShrink: 0 }}>
                        {track.duration}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Now Playing Card */}
            <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${current.color}25`,
                borderRadius: '20px',
                padding: '28px 24px',
                boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${current.color}15`,
                transition: 'border-color 0.4s, box-shadow 0.4s',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* Ambient glow */}
                <div style={{
                  position: 'absolute', top: '-50px', right: '-50px',
                  width: '200px', height: '200px', borderRadius: '50%',
                  background: `${current.color}08`, filter: 'blur(60px)',
                  transition: 'background 0.4s', pointerEvents: 'none',
                }} />

                {/* Album Art */}
                <div style={{
                  width: '100%', aspectRatio: '1',
                  borderRadius: '16px', marginBottom: '24px',
                  background: `linear-gradient(135deg, ${current.color}18, ${current.color}38)`,
                  border: `1px solid ${current.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '72px',
                  boxShadow: `0 12px 40px ${current.color}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.4s',
                  animation: isPlaying ? 'albumFloat 3s ease-in-out infinite' : 'none',
                }}>
                  {current.cover}
                  {/* Vinyl ring effect */}
                  {isPlaying && (
                    <div style={{
                      position: 'absolute', inset: '30%',
                      borderRadius: '50%',
                      border: `2px solid ${current.color}20`,
                      animation: 'spin 4s linear infinite',
                    }} />
                  )}
                </div>

                {/* Track Info */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>{current.title}</h3>
                    <button
                      onClick={() => toggleLike(current.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '2px' }}
                    >
                      {liked.includes(current.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{current.artist}</div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div
                    onClick={e => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      setProgress(((e.clientX - rect.left) / rect.width) * 100)
                    }}
                    style={{
                      height: '4px', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.08)',
                      cursor: 'pointer', position: 'relative', marginBottom: '8px',
                    }}
                  >
                    <div style={{
                      height: '100%', width: `${progress}%`, borderRadius: '4px',
                      background: `linear-gradient(90deg, ${current.color}bb, ${current.color})`,
                      transition: 'width 0.1s linear',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', right: '-5px', top: '-4px',
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: current.color,
                        boxShadow: `0 0 8px ${current.color}80`,
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                    <span>0:{String(Math.floor(progress * 0.6)).padStart(2, '0')}</span>
                    <span>{current.duration}</span>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
                  {/* Shuffle */}
                  <button
                    onClick={() => setIsShuffled(p => !p)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isShuffled ? current.color : 'rgba(255,255,255,0.3)',
                      padding: '6px', transition: 'color 0.2s',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                      <line x1="4" y1="4" x2="9" y2="9"/>
                    </svg>
                  </button>

                  {/* Prev */}
                  <button
                    onClick={handlePrev}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '50%', width: '40px', height: '40px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={() => handlePlay()}
                    style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${current.color}cc, ${current.color})`,
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 6px 24px ${current.color}50`,
                      transition: 'all 0.2s', color: '#000',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                  >
                    {isPlaying
                      ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    }
                  </button>

                  {/* Next */}
                  <button
                    onClick={handleNext}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '50%', width: '40px', height: '40px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                  </button>

                  {/* Repeat */}
                  <button
                    onClick={() => setIsRepeating(p => !p)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isRepeating ? current.color : 'rgba(255,255,255,0.3)',
                      padding: '6px', transition: 'color 0.2s',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                      <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                  </button>
                </div>

                {/* Volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setIsMuted(p => !p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: '2px' }}
                  >
                    {isMuted || volume === 0
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                    }
                  </button>
                  <input
                    type="range" min="0" max="100" value={isMuted ? 0 : volume}
                    onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false) }}
                    style={{ flex: 1, accentColor: current.color, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', width: '28px', textAlign: 'right' }}>
                    {isMuted ? 0 : volume}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <div style={{ flex: 1, padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#00E5FF' }}>{TRACKS.length}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: '2px' }}>TRACKS</div>
                </div>
                <div style={{ flex: 1, padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#F87171' }}>{liked.length}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: '2px' }}>LIKED</div>
                </div>
                <div style={{ flex: 1, padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#A855F7' }}>{formatBar(progress)}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: '2px' }}>PROGRESS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes musicBar1 { 0%,100%{height:6px} 50%{height:14px} }
        @keyframes musicBar2 { 0%,100%{height:10px} 50%{height:4px} }
        @keyframes musicBar3 { 0%,100%{height:14px} 50%{height:8px} }
        @keyframes albumFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 720px) {
          .music-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </UserLayout>
  )
}
