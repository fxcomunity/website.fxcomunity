'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserLayout from '@/components/UserLayout'

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
    <UserLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Profile Card */}
        <div className="card glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
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
                {user.email_verified && <span className="badge badge-green">✅ Verified</span>}
                <span style={{ color: 'var(--text3)', fontSize: '12px' }}>Joined: {new Date(user.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setEditMode(!editMode)}>
              {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
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
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>WHATSAPP NUMBER</label>
                  <input className="input" type="tel" placeholder="081234567890" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
                  <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Used for OTP verification</small>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost" onClick={() => setEditMode(false)} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ flex: 1 }}>
                    {saving ? <><span className="spin">⚙️</span> Saving...</> : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card glass-panel" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #f87171' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>❤️</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#f87171' }}>{favPdfs.length}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Favorite PDFs</div>
          </div>
          <div className="card glass-panel" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #38bdf8' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎓</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8' }}>{user.status}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Membership</div>
          </div>
          <div className="card glass-panel" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #00E5FF' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#00E5FF' }}>Active</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Account Status</div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
