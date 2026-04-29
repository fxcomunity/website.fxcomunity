'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, Settings, Save, AlertTriangle, Edit, Trash2, Loader2, Link as LinkIcon, CheckCircle, Upload, Plus, X } from 'lucide-react'

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
  const [editId, setEditId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    if (!mediaFile) { 
      if (!editId) setMediaPreviewUrl('')
      return 
    }
    const url = URL.createObjectURL(mediaFile)
    setMediaPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [mediaFile, editId])

  async function load() {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/admin/banners', { cache: 'no-store' })
      const d = await r.json()
      if (d.success) setBanners(d.data)
      else setError(d.error || 'Gagal memuat data')
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function saveBanner() {
    setLoading(true); setError('')
    try {
      if (!editId && !mediaFile) { setError('File media wajib diupload'); setLoading(false); return }
      const start = String(form.start_date || '').trim()
      const end = String(form.end_date || '').trim()
      if (!start) { setError('start_date wajib diisi'); setLoading(false); return }
      
      const startISO = new Date(start).toISOString()
      const endISO = end ? new Date(end).toISOString() : (() => {
        const d = new Date(start)
        if (Number.isNaN(d.getTime())) return ''
        d.setDate(d.getDate() + 7)
        return d.toISOString()
      })()
      if (!endISO) { setError('end_date tidak valid'); setLoading(false); return }

      const fd = new FormData()
      if (mediaFile) fd.append('media', mediaFile)
      fd.append('title', String(form.title || '').trim())
      fd.append('description', String(form.description || '').trim())
      fd.append('alt_text', String(form.alt_text || '').trim())
      fd.append('target_url', String(form.target_url || '').trim())
      fd.append('target_blank', form.target_blank ? 'true' : 'false')
      fd.append('start_date', startISO)
      fd.append('end_date', endISO)
      fd.append('priority', String(form.priority ?? 0))
      fd.append('is_active', form.is_active ? 'true' : 'false')

      if (editId) {
        const r = await fetch(`/api/admin/banners/${editId}`, {
          method: 'PUT',
          body: fd
        })
        const d = await r.json()
        if (!d.success) { setError(d.error || 'Gagal mengupdate banner') }
        else { resetForm(); await load() }
      } else {
        const r = await fetch('/api/admin/banners', {
          method: 'POST',
          body: fd
        })
        const d = await r.json()
        if (!d.success) { setError(d.error || 'Gagal menambah banner') }
        else { resetForm(); await load() }
      }
    } catch { setError('Koneksi gagal') }
    finally { setLoading(false) }
  }

  function resetForm() {
    setForm({ title: '', description: '', alt_text: '', target_url: '', target_blank: true, start_date: '', end_date: '', priority: 0, is_active: true })
    setMediaFile(null)
    setEditId(null)
    setMediaPreviewUrl('')
    setIsFormOpen(false)
  }

  function startEdit(b: Banner) {
    setEditId(b.id)
    setForm({
      title: b.title,
      description: b.description || '',
      alt_text: b.alt_text || '',
      target_url: b.target_url || '',
      target_blank: b.target_blank,
      start_date: b.start_date ? new Date(new Date(b.start_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      end_date: b.end_date ? new Date(new Date(b.end_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      priority: b.priority,
      is_active: b.is_active
    })
    setMediaPreviewUrl(b.media_url)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteBanner(id: number) {
    if (!confirm('Hapus banner ini permanen?')) return
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
    <div style={{ minHeight: '100vh', background: '#030305', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .glass-card {
          background: rgba(20, 20, 30, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card {
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: var(--stat-color, linear-gradient(90deg, #6366f1, #a855f7));
        }
        .glass-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          color: #fff !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
          box-sizing: border-box;
        }
        .glass-input:focus {
          outline: none;
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
        }
        .glass-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
        }
        .glass-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
        }
        .glass-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .glass-btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: none;
        }
        .glass-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: none;
        }
        .glass-btn-danger {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          box-shadow: none;
        }
        .glass-btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .file-drop-zone {
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .file-drop-zone:hover {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }
        .custom-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
        }
        .custom-checkbox input[type="checkbox"] {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          background: rgba(0,0,0,0.3);
          display: grid;
          place-content: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        .custom-checkbox input[type="checkbox"]::before {
          content: "";
          width: 10px;
          height: 10px;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em white;
          background-color: white;
          transform-origin: center;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .custom-checkbox input[type="checkbox"]:checked {
          background: #8b5cf6;
          border-color: #8b5cf6;
        }
        .custom-checkbox input[type="checkbox"]:checked::before {
          transform: scale(1);
        }
        .banner-row {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.2s, background 0.2s;
        }
        .banner-row:hover {
          background: rgba(255,255,255,0.04);
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.3);
        }
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .badge-active { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .badge-inactive { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
      `}</style>

      {/* Premium Header */}
      <header style={{ 
        background: 'rgba(10,10,26,0.8)', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        padding: '16px 32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        position: 'sticky', 
        top: 0, 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 40 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)' }}>
            <ImageIcon size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Banner Manager</h1>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Atur banner promosi website</div>
          </div>
        </div>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <button className="glass-btn glass-btn-secondary" style={{ padding: '8px 16px' }}>← Kembali ke Admin</button>
        </Link>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="glass-card stat-card" style={{ padding: '24px', '--stat-color': 'linear-gradient(90deg, #3b82f6, #60a5fa)' } as any}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Banner</div>
            <div style={{ fontSize: 36, fontWeight: 900, marginTop: '8px', color: '#fff' }}>{banners.length}</div>
          </div>
          <div className="glass-card stat-card" style={{ padding: '24px', '--stat-color': 'linear-gradient(90deg, #10b981, #34d399)' } as any}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Banner Aktif</div>
            <div style={{ fontSize: 36, fontWeight: 900, marginTop: '8px', color: '#4ade80' }}>{activeCount}</div>
          </div>
          <div className="glass-card stat-card" style={{ padding: '24px', '--stat-color': 'linear-gradient(90deg, #ec4899, #f472b6)' } as any}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Media Terpilih</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: '16px', color: mediaFile ? '#f9a8d4' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {mediaFile ? mediaFile.name : 'Belum ada file'}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Daftar Banner</h2>
          <button 
            className="glass-btn" 
            onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
            style={{ background: isFormOpen ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981, #059669)', boxShadow: isFormOpen ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)' }}
          >
            {isFormOpen ? <><X size={18} /> Tutup Form</> : <><Plus size={18} /> Tambah Banner Baru</>}
          </button>
        </div>

        {/* Form Editor (Expandable) */}
        {isFormOpen && (
          <div className="glass-card" style={{ padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editId ? <Edit size={20} color="#8b5cf6" /> : <Plus size={20} color="#10b981" />} 
              {editId ? 'Edit Banner' : 'Buat Banner Baru'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,1.5fr) minmax(280px,1fr)', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>Judul Banner *</label>
                  <input className="glass-input" value={form.title} onChange={e => setForm((f:any)=>({ ...f, title: e.target.value }))} placeholder="Contoh: Promo Lebaran Spesial" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>Target URL (Opsional)</label>
                    <input className="glass-input" value={form.target_url} onChange={e => setForm((f:any)=>({ ...f, target_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>Prioritas (Lebih tinggi = Lebih awal)</label>
                    <input className="glass-input" type="number" value={form.priority} onChange={e => setForm((f:any)=>({ ...f, priority: Number(e.target.value) }))} placeholder="0" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>Waktu Mulai Tayang *</label>
                    <input className="glass-input" type="datetime-local" value={form.start_date} onChange={e => setForm((f:any)=>({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>Waktu Selesai Tayang *</label>
                    <input className="glass-input" type="datetime-local" value={form.end_date} onChange={e => setForm((f:any)=>({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginTop: '8px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={form.target_blank} onChange={e => setForm((f:any)=>({ ...f, target_blank: e.target.checked }))} />
                    Buka link di tab baru
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm((f:any)=>({ ...f, is_active: e.target.checked }))} />
                    Status Aktif
                  </label>
                </div>
              </div>

              {/* Media Upload Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 }}>Media Banner (Gambar / Video)</label>
                  <label className="file-drop-zone">
                    <input type="file" accept="image/*,video/mp4,video/webm" onChange={e => setMediaFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                    <Upload size={32} color="rgba(255,255,255,0.4)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Klik untuk {editId ? 'mengganti' : 'mengunggah'} media</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Format: JPG, PNG, WEBP, MP4. Max 10MB</div>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', aspectRatio: '16 / 9' }}>
                  {mediaPreviewUrl ? (
                    mediaPreviewUrl.includes('video') || (mediaFile?.type.startsWith('video/'))
                      ? <video src={mediaPreviewUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <img src={mediaPreviewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, flexDirection: 'column', gap: 8 }}>
                      <ImageIcon size={32} opacity={0.5} />
                      Belum ada media
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button className="glass-btn" onClick={saveBanner} disabled={loading} style={{ minWidth: '200px' }}>
                {loading ? <><Loader2 size={18} className="spin" /> Menyimpan...</> : <><Save size={18} /> {editId ? 'Simpan Perubahan' : 'Publish Banner'}</>}
              </button>
              <button className="glass-btn glass-btn-secondary" onClick={resetForm} disabled={loading}>Batal</button>
            </div>
            {error && <div style={{ marginTop: 16, color: '#fca5a5', fontSize: 14, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}><AlertTriangle size={18} /> {error}</div>}
          </div>
        )}

        {/* Banner List */}
        {loading && banners.length === 0 ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
            <Loader2 size={40} color="#8b5cf6" className="spin" />
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Memuat data banner...</div>
          </div>
        ) : banners.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <ImageIcon size={64} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Belum Ada Banner</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Banner yang kamu tambahkan akan muncul di sini.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
            {banners.map(b => (
              <div key={b.id} className="banner-row">
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                  {b.media_type === 'video'
                    ? <video src={b.media_url} muted loop autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <img src={b.media_url} alt={b.alt_text || b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
                    <span className={`badge ${b.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {b.is_active ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                    <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                      ★ {b.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</h4>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>{b.media_type.toUpperCase()}</span>
                    {b.media_filename && <span>• {Math.round((b.media_size || 0) / 1024)} KB</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    Tayang: {new Date(b.start_date).toLocaleDateString('id-ID')} - {new Date(b.end_date).toLocaleDateString('id-ID')}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                  <button className="glass-btn glass-btn-secondary" onClick={() => window.open(b.media_url, '_blank')} style={{ padding: '8px', fontSize: 12 }}>
                    <LinkIcon size={14} /> Lihat
                  </button>
                  <button className="glass-btn glass-btn-secondary" onClick={() => startEdit(b)} style={{ padding: '8px', fontSize: 12, color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button className="glass-btn glass-btn-danger" onClick={() => deleteBanner(b.id)} style={{ padding: '8px', fontSize: 12 }}>
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
