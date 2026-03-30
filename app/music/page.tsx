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

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch('/api/music')
      .then(r => r.json())
      .then(d => { if (d.success) setTracks(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const current = tracks.find(t => t.id === currentId) ?? null

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setProgress(audio.currentTime)
    const onDur = () => setDuration(audio.duration || 0)
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

  // Sync volume to audio element
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

  // When currentId changes, load + play
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentId) return
    audio.load()
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [currentId])

  const handleNext = useCallback(() => {
    if (!tracks.length) return
    const idx = tracks.findIndex(t => t.id === currentId)
    const next = isShuffled
      ? tracks[Math.floor(Math.random() * tracks.length)]
      : tracks[(idx + 1) % tracks.length]
    playTrack(next.id)
  }, [tracks, currentId, isShuffled, playTrack])

  function handlePrev() {
    if (!tracks.length) return
    const audio = audioRef.current
    if (audio && progress > 3) { audio.currentTime = 0; return }
    const idx = tracks.findIndex(t => t.id === currentId)
    playTrack(tracks[(idx - 1 + tracks.length) % tracks.length].id)
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !current) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play(); setIsPlaying(true) }
  }

  function seekTo(pct: number) {
    const audio = audioRef.current
    if (audio && duration) { audio.currentTime = (pct / 100) * duration }
  }

  function fmt(s: number) {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  const progressPct = duration ? (progress / duration) * 100 : 0
  const color = current ? getColor(current) : '#00E5FF'

  return (
    <UserLayout>
      {/* Hidden audio element — always mounted, src changes with currentId */}
      <audio
        ref={audioRef}
        src={current?.file_url ?? undefined}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>

        {/* Header */}
        <div style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.07) 0%, transparent 65%)', padding: '32px 20px 24px', borderBottom: '1px solid rgba(0,229,255,0.06)', marginBottom: '24px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #00B8D4, #00E5FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>Music</h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                {tracks.length} lagu tersedia · Focus while you trade
              </p>
            </div>
            <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', fontSize: '11px', fontWeight: 700, color: '#F87171' }}>BETA</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Memuat musik...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎵</div>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>Belum Ada Musik</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Admin belum menambahkan musik. Hubungi admin!</p>
          </div>
        ) : (
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 296px', gap: '20px' }}>

              {/* ── Track List ── */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {tracks.length} Lagu
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {tracks.map((track, i) => {
                    const isActive = track.id === currentId
                    const tColor = getColor(track)
                    const genreName = track.genres?.[0]?.name || '—'
                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '11px 14px', borderRadius: '12px', cursor: 'pointer',
                          background: isActive ? 'rgba(0,229,255,0.06)' : 'rgba(255,255,255,0.02)',
                          border: isActive ? '1px solid rgba(0,229,255,0.18)' : '1px solid rgba(255,255,255,0.04)',
                          transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                      >
                        {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#00E5FF', borderRadius: '3px 0 0 3px' }} />}

                        {/* Number / EQ Bars */}
                        <div style={{ width: '26px', textAlign: 'center', flexShrink: 0 }}>
                          {isActive && isPlaying ? (
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', justifyContent: 'center', height: '16px' }}>
                              {[6, 12, 8].map((h, b) => (
                                <div key={b} style={{ width: '3px', borderRadius: '2px', background: '#00E5FF', height: `${h}px`, animation: `musicBar${b + 1} 0.6s ease-in-out infinite` }} />
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: isActive ? '#00E5FF' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{i + 1}</span>
                          )}
                        </div>

                        {/* Cover */}
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0, background: `${tColor}14`, border: `1px solid ${tColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: isActive ? `0 0 12px ${tColor}22` : 'none' }}>
                          {track.cover_url
                            ? <img src={track.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '20px' }}>🎵</span>}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: isActive ? '#fff' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{track.artist || 'Unknown Artist'}</div>
                        </div>

                        {/* Genre tag */}
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '7px', background: `${tColor}12`, color: tColor, border: `1px solid ${tColor}22`, flexShrink: 0 }}>
                          {genreName}
                        </span>

                        {/* Play count */}
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0, minWidth: '36px', textAlign: 'right' }}>▶ {track.play_count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── Now Playing ── */}
              <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
                {!current ? (
                  <div style={{ padding: '40px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎵</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Pilih lagu untuk diputar</p>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}25`, borderRadius: '20px', padding: '24px', boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${color}10`, position: 'relative', overflow: 'hidden', transition: 'all 0.4s' }}>
                    {/* Ambient glow */}
                    <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: `${color}06`, filter: 'blur(60px)', pointerEvents: 'none', transition: 'background 0.4s' }} />

                    {/* Album art */}
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', marginBottom: '20px', background: `linear-gradient(135deg, ${color}18, ${color}30)`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: `0 12px 40px ${color}15`, animation: isPlaying ? 'albumFloat 3s ease-in-out infinite' : 'none', transition: 'all 0.4s' }}>
                      {current.cover_url
                        ? <img src={current.cover_url} alt={current.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '72px' }}>🎵</span>}
                    </div>

                    {/* Track info */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{current.title}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                        {current.artist || 'Unknown'}{current.album ? ` · ${current.album}` : ''}
                        {current.genres?.[0] ? ` · ${current.genres[0].name}` : ''}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div
                        onClick={e => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * 100) }}
                        style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: '6px', position: 'relative' }}
                      >
                        <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: '4px', background: `linear-gradient(90deg, ${color}bb, ${color})`, position: 'relative', transition: 'width 0.1s linear' }}>
                          <div style={{ position: 'absolute', right: '-5px', top: '-4px', width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80` }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                        <span>{fmt(progress)}</span>
                        <span>{fmt(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                      {/* Shuffle */}
                      <button onClick={() => setIsShuffled(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffled ? color : 'rgba(255,255,255,0.3)', padding: '6px', transition: 'color 0.2s' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                      </button>
                      {/* Prev */}
                      <button onClick={handlePrev} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'background 0.2s' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
                      </button>
                      {/* Play/Pause */}
                      <button onClick={togglePlay} style={{ width: '52px', height: '52px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}cc, ${color})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 24px ${color}45`, color: '#000', transition: 'transform 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.07)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                      >
                        {isPlaying
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                      </button>
                      {/* Next */}
                      <button onClick={handleNext} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', transition: 'background 0.2s' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                      </button>
                      {/* Repeat */}
                      <button onClick={() => setIsRepeating(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isRepeating ? color : 'rgba(255,255,255,0.3)', padding: '6px', transition: 'color 0.2s' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                      </button>
                    </div>

                    {/* Volume */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setIsMuted(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: '2px', flexShrink: 0 }}>
                        {isMuted
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
                      </button>
                      <input
                        type="range" min="0" max="1" step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false) }}
                        style={{ flex: 1, accentColor: color, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', width: '30px', textAlign: 'right' }}>
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes musicBar1 { 0%,100%{height:5px} 50%{height:14px} }
        @keyframes musicBar2 { 0%,100%{height:12px} 50%{height:4px} }
        @keyframes musicBar3 { 0%,100%{height:8px} 50%{height:14px} }
        @keyframes albumFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media(max-width:720px){
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important }
        }
      `}</style>
    </UserLayout>
  )
}
