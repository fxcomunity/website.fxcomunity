'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User { id: number; username: string; email: string; phone_number?: string; role: string; status: string; created_at: string; email_verified: boolean }
interface PDF { id: number; name: string; url: string; category: string; thumbnail: string; views: number; downloads: number; is_active: boolean }

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [favPdfs, setFavPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', phone_number: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.status === 503) { router.push('/maintenance'); return }
      return r.json()
    }).then(d => {
      if (d?.data) {
        setUser(d.data)
        setForm({ username: d.data.username, email: d.data.email, phone_number: d.data.phone_number || '' })
        loadFavorites()
      } else router.push('/login')
    }).catch(() => router.push('/login'))
  }, [router])

  async function loadFavorites() {
    try {
      const res = await fetch('/api/pdfs')
      const data = await res.json()
      if (data.success) {
        const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
        const myFavs = data.data.filter((p: PDF) => favIds.includes(p.id))
        setFavPdfs(myFavs)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function saveProfile() {
    if (!form.username || !form.email) { showToast('⚠️ Username dan email wajib diisi'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, phone_number: form.phone_number })
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
        setEditMode(false)
        showToast('✅ Profil berhasil diperbarui')
      } else showToast('⚠️ ' + (data.error || 'Gagal update profil'))
    } catch (e) { showToast('⚠️ Error update profil') }
    finally { setSaving(false) }
  }

  async function handleDownload(pdf: PDF) {
    try {
      await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
      setFavPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
    } catch {}
    window.open(pdf.url, '_blank')
  }

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <p style={{ color: 'var(--text2)' }}>Memuat Profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {toast && <div className="toast success">{toast}</div>}

      {/* Header */}
      <header style={{ background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>👤</span>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }} className="grad-text">PROFIL</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn btn-ghost btn-sm">← Kembali ke Dashboard</button>
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Profile Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 900, boxShadow: 'var(--shadow)' }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{user.username}</h1>
              <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '10px' }}>{user.email}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${user.role === 'Owner' || user.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
                <span className={`badge ${user.status === 'Aktif' ? 'badge-green' : 'badge-red'}`}>{user.status}</span>
                {user.email_verified && <span className="badge badge-green">✅ Email Terverifikasi</span>}
                <span style={{ color: 'var(--text3)', fontSize: '12px' }}>Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setEditMode(!editMode)}>
              {editMode ? '✕ Batal' : '✏️ Edit Profil'}
            </button>
          </div>

          {editMode && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>USERNAME</label>
                  <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>EMAIL</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>NOMOR WHATSAPP</label>
                  <input className="input" type="tel" placeholder="081234567890" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
                  <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Untuk menerima OTP via WhatsApp</small>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost" onClick={() => setEditMode(false)} style={{ flex: 1 }}>Batal</button>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ flex: 1 }}>
                    {saving ? <><span className="spin">⚙️</span> Menyimpan...</> : '💾 Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>❤️</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#f87171' }}>{favPdfs.length}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Materi Favorit</div>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎓</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8' }}>{user.status}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Status Member</div>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fbbf24' }}>Aktif</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Status Akun</div>
          </div>
        </div>

        {/* Favorites Section */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>❤️</span> Materi Favorit Anda
        </h2>

        {favPdfs.length === 0 ? (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'grayscale(1)' }}>📄</div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text)' }}>Belum ada favorit</h3>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '20px' }}>Tambahkan materi ke favorit di halaman Library untuk melihatnya di sini.</p>
            <Link href="/library" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary">📚 Jelajahi Library</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {favPdfs.map(pdf => (
              <div key={pdf.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{pdf.thumbnail}</div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pdf.name}</h4>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text)', marginBottom: '12px', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <img src="https://img.icons8.com/ios-glyphs/30/ffffff/visible.png" alt="Views" style={{ width: 16, height: 16 }} />
                    {pdf.views}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <img src="https://img.icons8.com/ios-glyphs/30/ffffff/download--v1.png" alt="Downloads" style={{ width: 16, height: 16 }} />
                    {pdf.downloads}
                  </span>
                </div>
                <button onClick={() => handleDownload(pdf)} className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <img src="https://cdn.pixabay.com/photo/2016/12/18/13/45/download-1915753_640.png" alt="Download" style={{ width: 14, height: 14 }} />
                  Buka
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ marginTop: '40px', padding: '24px', background: 'var(--bg3)', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>⚡ Aksi Cepat</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/library" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary btn-sm">📚 Library</button>
            </Link>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary btn-sm">🚀 Dashboard</button>
            </Link>
            {['Owner', 'Admin'].includes(user.role) && (
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                <button className="btn btn-secondary btn-sm">⚙️ Admin Panel</button>
              </Link>
            )}
            <Link href="/settings" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary btn-sm">🔧 Settings</button>
            </Link>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
              }}
              style={{ cursor: 'pointer' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
