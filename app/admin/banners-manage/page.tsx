'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Banner = {
  id: number
  title: string
  description?: string
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url?: string
  media_filename?: string
  media_size?: number
  alt_text?: string
  target_url?: string
  target_blank: boolean
  start_date: string
  end_date: string
  priority: number
  is_active: boolean
}

export default function BannerManage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    title: '', description: '',
    alt_text: '', target_url: '', target_blank: true,
    start_date: '', end_date: '', priority: 0, is_active: true
  })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mediaFile) { setMediaPreviewUrl(''); return }
    const url = URL.createObjectURL(mediaFile)
    setMediaPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [mediaFile])

  async function load() {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/admin/banners')
      const d = await r.json()
      if (d.success) setBanners(d.data)
      else setError(d.error || 'Gagal memuat data')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function addBanner() {
    setLoading(true); setError('')
    try {
      if (!mediaFile) { setError('File media wajib diupload'); setLoading(false); return }
      const start = String(form.start_date || '').trim()
      const end = String(form.end_date || '').trim()
      if (!start) { setError('start_date wajib diisi'); setLoading(false); return }
      const computedEnd = end || (() => {
        const d = new Date(start)
        if (Number.isNaN(d.getTime())) return ''
        d.setDate(d.getDate() + 7)
        return d.toISOString()
      })()
      if (!computedEnd) { setError('end_date wajib diisi'); setLoading(false); return }
      const fd = new FormData()
      fd.append('media', mediaFile)
      fd.append('title', String(form.title || '').trim())
      fd.append('description', String(form.description || '').trim())
      fd.append('alt_text', String(form.alt_text || '').trim())
      fd.append('target_url', String(form.target_url || '').trim())
      fd.append('target_blank', form.target_blank ? 'true' : 'false')
      fd.append('start_date', start)
      fd.append('end_date', computedEnd)
      fd.append('priority', String(form.priority ?? 0))
      fd.append('is_active', form.is_active ? 'true' : 'false')
      const r = await fetch('/api/admin/banners', {
        method: 'POST',
        body: fd
      })
      const d = await r.json()
      if (!d.success) { setError(d.error || 'Gagal menambah banner') }
      else {
        setForm({ ...form, title: '', description: '', alt_text: '', target_url: '', target_blank: true, start_date: '', end_date: '', priority: 0, is_active: true })
        setMediaFile(null)
        await load()
      }
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  async function deleteBanner(id: number) {
    if (!confirm('Hapus banner ini?')) return
    setLoading(true); setError('')
    try {
      const r = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      const d = await r.json()
      if (!d.success) { setError(d.error || 'Gagal menghapus banner') }
      else { await load() }
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  const activeCount = banners.filter(b => b.is_active).length

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.18), transparent 45%), var(--bg)' }}>
      <header style={{ background: 'rgba(10,10,26,0.92)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backdropFilter: 'blur(10px)', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🖼️</span>
          <h1 style={{ fontSize: 18, fontWeight: 800 }}>Banner Manager</h1>
        </div>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secondary btn-sm">← Admin</button>
        </Link>
      </header>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div className="card" style={{ padding: 14, border: '1px solid rgba(99,102,241,0.28)', background: 'rgba(99,102,241,0.08)' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Total Banner</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{banners.length}</div>
          </div>
          <div className="card" style={{ padding: 14, border: '1px solid rgba(34,197,94,0.32)', background: 'rgba(34,197,94,0.08)' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Banner Aktif</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{activeCount}</div>
          </div>
          <div className="card" style={{ padding: 14, border: '1px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.08)' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Upload Terpilih</div>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{mediaFile?.name || 'Belum ada file'}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Tambah Banner</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,1fr) minmax(240px,340px)', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              <input value={form.title} onChange={e => setForm((f:any)=>({ ...f, title: e.target.value }))} placeholder="Judul banner" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input type="file" accept="image/*,video/mp4,video/webm" onChange={e => setMediaFile(e.target.files?.[0] || null)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input value={form.target_url} onChange={e => setForm((f:any)=>({ ...f, target_url: e.target.value }))} placeholder="Target URL (opsional)" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input value={form.alt_text} onChange={e => setForm((f:any)=>({ ...f, alt_text: e.target.value }))} placeholder="Alt text (opsional)" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input type="datetime-local" value={form.start_date} onChange={e => setForm((f:any)=>({ ...f, start_date: e.target.value }))} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input type="datetime-local" value={form.end_date} onChange={e => setForm((f:any)=>({ ...f, end_date: e.target.value }))} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <input type="number" value={form.priority} onChange={e => setForm((f:any)=>({ ...f, priority: Number(e.target.value) }))} placeholder="Prioritas (angka)" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }} />
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={form.target_blank} onChange={e => setForm((f:any)=>({ ...f, target_blank: e.target.checked }))} /> tab baru
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm((f:any)=>({ ...f, is_active: e.target.checked }))} /> aktif
                </label>
              </div>
            </div>
            <div className="card" style={{ padding: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Preview</div>
              {mediaPreviewUrl ? (
                mediaFile?.type.startsWith('video/')
                  ? <video src={mediaPreviewUrl} controls style={{ width: '100%', borderRadius: 10, aspectRatio: '16 / 9', objectFit: 'cover', background: '#000' }} />
                  : <img src={mediaPreviewUrl} alt="preview" style={{ width: '100%', borderRadius: 10, aspectRatio: '16 / 9', objectFit: 'cover' }} />
              ) : (
                <div style={{ aspectRatio: '16 / 9', borderRadius: 10, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>Belum ada media dipilih</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={addBanner} disabled={loading}>{loading ? <><span className="spin">⚙️</span> Menyimpan...</> : '💾 Tambah Banner'}</button>
            <button className="btn btn-secondary" onClick={() => { setForm({ title: '', description: '', alt_text: '', target_url: '', target_blank: true, start_date: '', end_date: '', priority: 0, is_active: true }); setMediaFile(null) }}>Bersihkan</button>
          </div>
          {error && <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 13 }}>⚠️ {error}</div>}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Daftar Banner</h2>
          {loading ? (
            <div style={{ padding: 20 }}>⏳ Memuat...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12 }}>
              {banners.map(b => (
                <div key={b.id} className="card" style={{ padding: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 96, height: 62, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#050510' }}>
                      {b.media_type === 'video'
                        ? <video src={b.media_url} muted loop autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <img src={b.media_url} alt={b.alt_text || b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{b.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{b.media_type} • prio {b.priority}</div>
                      <div style={{ marginTop: 4, fontSize: 11, color: b.is_active ? '#4ade80' : '#f87171', fontWeight: 700 }}>{b.is_active ? 'AKTIF' : 'NONAKTIF'}</div>
                      {b.media_filename && <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{b.media_filename} ({Math.round((b.media_size || 0) / 1024)} KB)</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => window.open(b.media_url, '_blank')}>Lihat</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => deleteBanner(b.id)}>🗑️ Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
