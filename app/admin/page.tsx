'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import './admin.css'

interface User { id: number; username: string; email: string; role: string; status: string; created_at: string }
interface PDF { id: number; name: string; url: string; category: string; thumbnail: string; views: number; downloads: number; is_active: boolean }
interface Stats { totalPdf: number; activePdf: number; totalUser: number; totalDownload: number; totalViews: number }
interface AdminRequest {
  id: number
  requester_id: number | null
  requester_username: string | null
  username: string
  email: string
  requested_role: string
  status: 'Pending' | 'Approved' | 'Rejected'
  owner_note: string | null
  owner_username: string | null
  created_at: string
  updated_at: string
}

const CATS = ['fx-basic', 'fx-advanced', 'fx-technical', 'fx-psychology']
const THUMBS = ['📊', '📈', '📉', '🧠', '📚', '💰', '⚖️', '🔧', '🌍', '⚠️', '🎯', '💧', '✅', '🔨', '⚡', '📦', '🌊', '🏗️', '🎁', '📍', '🔐', '🕯️', '🎨', '💼', '📖', '🚀', '💎', '📄']

const COLORS = ['#4488ff', '#C720E6', '#28c864', '#FF6B35', '#7aadff', '#e070ff']

// Menu items
const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'pdfs', label: 'Kelola PDF', icon: '📄' },
  { key: 'users', label: 'Kelola User', icon: '👥' },
  { key: 'music', label: 'Kelola Musik', icon: '🎵' },
  { key: 'notifications', label: 'Notifikasi', icon: '🔔' },
  { key: 'reports', label: 'Laporan User', icon: '📬' },
  { key: 'crypto', label: 'Crypto Decoder', icon: '🔓' },
  { key: 'settings', label: 'Pengaturan', icon: '⚙️' },
]

export default function AdminPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editTarget, setEditTarget] = useState<PDF | null>(null)
  const [form, setForm] = useState({ name: '', url: '', category: 'fx-basic', thumbnail: '📄' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [maintenance, setMaintenance] = useState(false)
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' })
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null)
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', user_id: 'all' })
  const [sendingNotif, setSendingNotif] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [reportFilter, setReportFilter] = useState<{ type: string; status: string }>({ type: 'all', status: 'all' })
  const [musicList, setMusicList] = useState<any[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string; slug: string }[]>([])
  const [musicForm, setMusicForm] = useState({ title: '', artist: '', album: '', file_url: '', cover_url: '', genre_id: '' })
  const [addingMusic, setAddingMusic] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.data || !['Owner', 'Admin'].includes(d.data.role)) router.push('/library')
      else { setMe(d.data); loadAll() }
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    const [pRes, uRes, sRes, reqRes, repRes, mRes, gRes] = await Promise.all([
      fetch('/api/pdfs').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
      fetch('/api/admin/admin-requests').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/report').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/music').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/music/genres').then(r => r.json()).catch(() => ({ success: false, data: [] }))
    ])
    if (pRes.success) setPdfs(pRes.data)
    if (uRes.success) setUsers(uRes.data)
    if (sRes.success && sRes.data) setMaintenance(sRes.data.maintenance_mode === 'true')
    if (reqRes.success) setAdminRequests(reqRes.data || [])
    if (repRes.success) setReports(repRes.data || [])
    if (mRes.success) setMusicList(mRes.data || [])
    if (gRes.success) setGenres(gRes.data || [])
    setLoading(false)
  }

  async function updateReportStatus(id: number, status: string) {
    await fetch('/api/report', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    showToast('✅ Status laporan diperbarui')
  }

  async function deleteReport(id: number) {
    try {
      const res = await fetch('/api/report', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        setReports(prev => prev.filter(r => Number(r.id) !== Number(id)))
        showToast('🗑️ Laporan dihapus')
      } else {
        showToast('⚠️ ' + (data.message || 'Gagal hapus laporan'))
      }
    } catch {
      showToast('⚠️ Error koneksi saat hapus')
    }
  }
  async function addMusic() {
    if (!musicForm.title.trim() || !musicForm.file_url.trim()) { showToast('⚠️ Judul dan URL audio wajib diisi'); return }
    setAddingMusic(true)
    try {
      const res = await fetch('/api/music', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...musicForm, genre_id: musicForm.genre_id || null })
      })
      const data = await res.json()
      if (data.success) {
        setMusicList(p => [data.data, ...p])
        setMusicForm({ title: '', artist: '', album: '', file_url: '', cover_url: '', genre_id: genres[0]?.id?.toString() || '' })
        showToast('✅ Lagu berhasil ditambahkan!')
      } else showToast('⚠️ ' + data.error)
    } catch { showToast('⚠️ Error saat menambahkan lagu') }
    finally { setAddingMusic(false) }
  }

  async function deleteMusic(id: number, title: string) {
    if (!confirm(`Hapus musik "${title}"?`)) return
    const res = await fetch(`/api/music/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { setMusicList(p => p.filter(m => m.id !== id)); showToast('🗑️ Musik dihapus') }
    else showToast('⚠️ Gagal hapus musik')
  }

  async function toggleMaintenance() {
    if (!confirm(maintenance ? 'Matikan Mode Maintenance?' : 'Aktifkan Mode Maintenance? Semua user biasa tidak akan bisa akses web.')) return
    const newVal = !maintenance
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'maintenance_mode', value: String(newVal) })
      })
      const data = await res.json()
      if (data.success) {
        setMaintenance(newVal)
        showToast(newVal ? '🚧 Mode Maintenance AKTIF' : '✅ Mode Maintenance MATI')
      } else showToast('⚠️ Gagal ubah maintenance')
    } catch { showToast('⚠️ Error ubah maintenance') }
  }


  function openAdd() { setForm({ name: '', url: '', category: 'fx-basic', thumbnail: '📄' }); setEditTarget(null); setModal('add') }
  function openEdit(p: PDF) { setForm({ name: p.name, url: p.url, category: p.category, thumbnail: p.thumbnail }); setEditTarget(p); setModal('edit') }

  async function savePDF() {
    if (!form.name || !form.url) { showToast('⚠️ Nama dan URL wajib diisi'); return }
    setSaving(true)
    try {
      const res = await fetch(editTarget ? `/api/pdfs/${editTarget.id}` : '/api/pdfs', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) { setModal(null); loadAll(); showToast(editTarget ? '✅ PDF diperbarui' : '✅ PDF ditambahkan') }
      else showToast('⚠️ ' + data.error)
    } finally { setSaving(false) }
  }

  async function toggleActive(p: PDF) {
    await fetch(`/api/pdfs/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !p.is_active }) })
    loadAll(); showToast(`${!p.is_active ? '✅ Diaktifkan' : '🚫 Dinonaktifkan'}`)
  }

  async function deletePDF(p: PDF) {
    if (!confirm(`Hapus "${p.name}"?`)) return
    await fetch(`/api/pdfs/${p.id}`, { method: 'DELETE' })
    loadAll(); showToast('🗑️ PDF dihapus')
  }

  async function toggleUserStatus(u: User) {
    // Admin tidak bisa mengubah status user lain
    if (me?.role === 'Admin') {
      showToast('⚠️ Admin tidak memiliki akses untuk mengubah status user')
      return
    }
    
    const newStatus = u.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
    await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, status: newStatus }) })
    loadAll(); showToast(`User ${newStatus === 'Aktif' ? '✅ diaktifkan' : '🚫 dinonaktifkan'}`)
  }

  async function deleteUser(u: User) {
    if (!confirm(`Hapus user "${u.username}"? Aksi ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id }) })
      const data = await res.json()
      if (data.success) { loadAll(); showToast('🗑️ User dihapus') }
      else showToast('⚠️ ' + data.error)
    } catch { showToast('⚠️ Gagal hapus user') }
  }

  async function createAdminCandidate() {
    if (!adminForm.username || !adminForm.email || !adminForm.password) {
      showToast('⚠️ Username, email, dan password wajib diisi')
      return
    }
    if (adminForm.password.length < 6) {
      showToast('⚠️ Password minimal 6 karakter')
      return
    }
    setCreatingAdmin(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adminForm, role: 'Admin' })
      })
      const data = await res.json()
      if (!data.success) {
        showToast('⚠️ ' + (data.error || 'Gagal tambah admin'))
        return
      }
      setAdminForm({ username: '', email: '', password: '' })
      if (data.mode === 'request') showToast('📝 Permintaan admin dikirim ke Owner')
      else showToast('✅ Admin baru berhasil dibuat')
      loadAll()
    } catch {
      showToast('⚠️ Gagal tambah admin')
    } finally {
      setCreatingAdmin(false)
    }
  }

  async function processAdminRequest(id: number, action: 'approve' | 'reject') {
    const owner_note = action === 'reject' ? (prompt('Alasan penolakan (opsional):') || '') : ''
    setProcessingRequestId(id)
    try {
      const res = await fetch('/api/admin/admin-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, owner_note })
      })
      const data = await res.json()
      if (!data.success) {
        showToast('⚠️ ' + (data.error || 'Gagal memproses request'))
        return
      }
      showToast(action === 'approve' ? '✅ Request disetujui' : '🚫 Request ditolak')
      loadAll()
    } catch {
      showToast('⚠️ Gagal memproses request')
    } finally {
      setProcessingRequestId(null)
    }
  }

async function sendNotification() {
    if (!notifForm.title || !notifForm.message) {
      showToast('⚠️ Judul dan pesan wajib diisi')
      return
    }
    setSendingNotif(true)
    try {
      // FIX: Convert user_id 'all' -> null, string ID -> number
      const payload = {
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
        user_id: notifForm.user_id === 'all' ? null : parseInt(notifForm.user_id as string)
      }
      
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      console.log('API Response:', data) // Debug
      if (data.success) {
        showToast('✅ Notifikasi berhasil dikirim!')
        setNotifForm({ title: '', message: '', type: 'info', user_id: 'all' })
      } else {
        showToast(`⚠️ Gagal: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Send notification error:', error)
      showToast('⚠️ Network/DB error - Cek console')
    } finally {
      setSendingNotif(false)
    }
  }

  const filteredPdfs = pdfs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const filteredAdminRequests = adminRequests.filter(r =>
    r.username.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.requester_username || '').toLowerCase().includes(search.toLowerCase())
  )

  // Stats calculation
  const stats: Stats = {
    totalPdf: pdfs.length,
    activePdf: pdfs.filter(p => p.is_active).length,
    totalUser: users.length,
    totalDownload: pdfs.reduce((a, p) => a + p.downloads, 0),
    totalViews: pdfs.reduce((a, p) => a + p.views, 0)
  }

  // Chart data
  const categoryData = CATS.map(cat => ({
    name: cat.replace('fx-', '').toUpperCase(),
    value: pdfs.filter(p => p.category === cat).length
  })).filter(d => d.value > 0)

  const userRoleData = [
    { name: 'Owner', value: users.filter(u => u.role === 'Owner').length },
    { name: 'Admin', value: users.filter(u => u.role === 'Admin').length },
    { name: 'User', value: users.filter(u => u.role === 'User').length },
  ].filter(d => d.value > 0)

  const monthlyData = [
    { month: 'Jan', users: Math.floor(users.length * 0.1), pdfs: Math.floor(pdfs.length * 0.15) },
    { month: 'Feb', users: Math.floor(users.length * 0.15), pdfs: Math.floor(pdfs.length * 0.2) },
    { month: 'Mar', users: Math.floor(users.length * 0.2), pdfs: Math.floor(pdfs.length * 0.25) },
    { month: 'Apr', users: Math.floor(users.length * 0.25), pdfs: Math.floor(pdfs.length * 0.3) },
    { month: 'May', users: Math.floor(users.length * 0.35), pdfs: Math.floor(pdfs.length * 0.4) },
    { month: 'Jun', users: users.length, pdfs: pdfs.length },
  ]

  if (!me) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '48px' }} className="spin">⚙️</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {toast && <div className="toast success">{toast}</div>}

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ 
        width: sidebarOpen ? '256px' : '72px', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.28s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,229,255,0.25)' }}>
            ⚡
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 900, fontSize: '15px', letterSpacing: '-0.3px' }} className="grad-text">FX ADMIN</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.5px' }}>PANEL MANAGEMENT</div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="admin-avatar" style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0 }}>
              {me.username[0].toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{me.username}</p>
                <span className={`badge ${me.role === 'Owner' ? 'badge-orange' : 'badge-purple'}`} style={{ fontSize: '9px', padding: '2px 7px' }}>{me.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'crypto') router.push('/crypto')
                else setActiveMenu(item.key)
              }}
              className={`admin-nav-item ${activeMenu === item.key ? 'active' : ''}`}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '11px 14px' : '11px 0' }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: '13.5px' }}>{item.label}</span>}
            </button>
          ))}

          {/* Utility Section */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={toggleMaintenance}
              className="admin-nav-item"
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '11px 14px' : '11px 0', color: maintenance ? '#F87171' : '#4ADE80' }}
            >
              <span className="admin-nav-icon" style={{ background: maintenance ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)' }}>
                {maintenance ? '🚧' : '🌐'}
              </span>
              {sidebarOpen && <span>Mode Maintenance {maintenance ? 'ON' : 'OFF'}</span>}
            </button>
            <Link href="/admin/banners-manage" style={{ textDecoration: 'none' }}>
              <div className="admin-nav-item" style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '11px 14px' : '11px 0' }}>
                <span className="admin-nav-icon">🖼️</span>
                {sidebarOpen && <span style={{ fontSize: '13.5px' }}>Banner Manager</span>}
              </div>
            </Link>
          </div>
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/library" style={{ textDecoration: 'none' }}>
            <div className="admin-nav-item" style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 14px' : '10px 0' }}>
              <span className="admin-nav-icon">📚</span>
              {sidebarOpen && <span style={{ fontSize: '13.5px' }}>Ke Library</span>}
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-nav-item"
            style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 14px' : '10px 0', marginTop: '2px' }}
          >
            <span className="admin-nav-icon">{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span style={{ fontSize: '13.5px' }}>Collapse</span>}
          </button>
        </div>
      </aside>


      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: sidebarOpen ? '256px' : '72px',
        transition: 'margin-left 0.28s ease',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <div className="admin-topbar-icon">
              {MENU_ITEMS.find(m => m.key === activeMenu)?.icon ?? '⚙️'}
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }} className="grad-text">
                {MENU_ITEMS.find(m => m.key === activeMenu)?.label ?? 'Admin'}
              </h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Selamat datang</div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>{me.username}</div>
            </div>
            <div className="admin-avatar" style={{ width: '34px', height: '34px', borderRadius: '9px', fontSize: '13px' }}>
              {me.username[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div style={{ padding: '22px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }} className="spin">⚙️</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Memuat data...</p>
            </div>
          ) : activeMenu === 'dashboard' ? (
            /* DASHBOARD VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Page Header */}
              <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2>📊 Overview Dashboard</h2>
                  <p>Ringkasan statistik dan aktivitas platform secara real-time</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{users.length} Users</span>
                  <span className="badge badge-green">{pdfs.filter(p => p.is_active).length} PDF Aktif</span>
                  <span className="badge badge-orange">{musicList.length} Musik</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="admin-stat-grid">
                {[
                  { icon: '📄', label: 'Total PDF', value: stats.totalPdf, color: '#4488ff', grad: 'linear-gradient(135deg,#1a3a8f,#1e2d5e)' },
                  { icon: '✅', label: 'PDF Aktif', value: stats.activePdf, color: '#28c864', grad: 'linear-gradient(135deg,#0f3d20,#0a2415)' },
                  { icon: '👥', label: 'Total User', value: stats.totalUser, color: '#A855F7', grad: 'linear-gradient(135deg,#3b1d7a,#231145)' },
                  { icon: '📥', label: 'Total Download', value: stats.totalDownload, color: '#FF6B35', grad: 'linear-gradient(135deg,#5c2410,#3a1608)' },
                  { icon: '👁', label: 'Total View', value: stats.totalViews, color: '#00E5FF', grad: 'linear-gradient(135deg,#0a3a42,#05222a)' },
                ].map(s => (
                  <div key={s.label} className="admin-stat-card" style={{ background: s.grad, border: `1px solid ${s.color}25` }}>
                    <div className="admin-stat-value" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                    <div className="admin-stat-label" style={{ color: s.color }}>{s.label}</div>
                    <div className="admin-stat-icon">{s.icon}</div>
                    <div className="admin-stat-trend" style={{ color: s.color }}>↗ Live</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
                {/* Category Distribution */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>📊 Distribusi PDF per Kategori</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* User Roles */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>👥 Distribusi User per Role</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                        {userRoleData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>📈 Pertumbuhan Users & PDF</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text3)" />
                    <YAxis stroke="var(--text3)" />
                    <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="users" stroke="#C720E6" strokeWidth={3} dot={{ fill: '#C720E6' }} name="Users" />
                    <Line type="monotone" dataKey="pdfs" stroke="#4488ff" strokeWidth={3} dot={{ fill: '#4488ff' }} name="PDFs" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : activeMenu === 'pdfs' ? (
            /* PDF MANAGEMENT */
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input className="input" placeholder="🔍 Cari PDF..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '300px' }} />
                <button className="btn btn-primary" onClick={openAdd}>➕ Tambah PDF</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredPdfs.map(pdf => (
                  <div key={pdf.id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '40px' }}>{pdf.thumbnail}</span>
                      <div style={{ flex: 1 }}>
                        <a href={pdf.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: '14px', color: '#7aadff', textDecoration: 'none' }}>{pdf.name}</a>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <span className="badge badge-blue">{pdf.category}</span>
                          <span className={`badge ${pdf.is_active ? 'badge-green' : 'badge-red'}`}>{pdf.is_active ? 'Aktif' : 'Nonaktif'}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>👁{pdf.views} 📥{pdf.downloads}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(pdf)}>{pdf.is_active ? '🚫' : '✅'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(pdf)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletePDF(pdf)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeMenu === 'users' ? (
            /* USER MANAGEMENT */
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input className="input" placeholder="🔍 Cari user..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '300px' }} />
              </div>

              <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                  {me?.role === 'Owner' ? '➕ Tambah Admin Baru' : '📝 Ajukan Admin Baru (Butuh Verifikasi Owner)'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px' }}>
                  <input className="input" placeholder="Username admin" value={adminForm.username} onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))} />
                  <input className="input" type="email" placeholder="Email admin" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} />
                  <input className="input" type="password" placeholder="Password admin (min 6)" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <button className="btn btn-primary" onClick={createAdminCandidate} disabled={creatingAdmin} style={{ marginTop: '12px' }}>
                  {creatingAdmin ? <><span className="spin">⚙️</span> Memproses...</> : me?.role === 'Owner' ? 'Tambah Admin Sekarang' : 'Ajukan ke Owner'}
                </button>
              </div>

              {me?.role === 'Admin' && (
                <div style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>ℹ️</span>
                  <span style={{ color: '#ff9970', fontSize: '13px' }}>Sebagai Admin, Anda tidak dapat ubah status user. Untuk admin baru, kirim request ke Owner.</span>
                </div>
              )}

              <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                  {me?.role === 'Owner' ? '✅ Verifikasi Permintaan Admin' : '📨 Status Permintaan Admin Saya'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredAdminRequests.length ? filteredAdminRequests.map(r => (
                    <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', background: 'var(--bg4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '13px' }}>{r.username} · {r.email}</p>
                          <p style={{ color: 'var(--text3)', fontSize: '12px' }}>
                            Requester: {r.requester_username || '-'} · {new Date(r.created_at).toLocaleString('id-ID')}
                          </p>
                          {r.owner_note && <p style={{ color: '#ffb26a', fontSize: '12px', marginTop: '4px' }}>Catatan Owner: {r.owner_note}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`badge ${r.status === 'Approved' ? 'badge-green' : r.status === 'Rejected' ? 'badge-red' : 'badge-blue'}`}>{r.status}</span>
                          {me?.role === 'Owner' && r.status === 'Pending' && (
                            <>
                              <button className="btn btn-sm" disabled={processingRequestId === r.id} onClick={() => processAdminRequest(r.id, 'approve')} style={{ background: 'rgba(40,200,100,0.2)', color: '#60d090' }}>
                                Setujui
                              </button>
                              <button className="btn btn-sm" disabled={processingRequestId === r.id} onClick={() => processAdminRequest(r.id, 'reject')} style={{ background: 'rgba(220,50,50,0.2)', color: '#ff8080' }}>
                                Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Belum ada request admin.</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredUsers.map(u => (
                  <div key={u.id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{u.username}</p>
                        <p style={{ color: 'var(--text3)', fontSize: '12px' }}>{u.email}</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <span className={`badge ${u.role === 'Owner' ? 'badge-orange' : u.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span>
                          <span className={`badge ${u.status === 'Aktif' ? 'badge-green' : 'badge-red'}`}>{u.status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {me?.role === 'Owner' ? (
                          <>
                            <button 
                              onClick={() => toggleUserStatus(u)}
                              className="btn btn-sm" 
                              style={{ background: u.status === 'Aktif' ? 'rgba(220,50,50,0.2)' : 'rgba(40,200,100,0.2)', color: u.status === 'Aktif' ? '#ff8080' : '#60d090' }}
                            >
                              {u.status === 'Aktif' ? '🚫 Nonaktifkan' : '✅ Aktifkan'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)}>🗑️</button>
                          </>
                        ) : me?.role === 'Admin' ? (
                          <span style={{ color: 'var(--text3)', fontSize: '12px' }}>Tidak ada akses</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeMenu === 'notifications' ? (
            /* NOTIFICATION MANAGEMENT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>🔔 Kirim Notifikasi Baru</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>Judul Notifikasi</label>
                    <input className="input" placeholder="Contoh: Update Chapter Baru!" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>Pesan</label>
                    <textarea className="input" rows={3} placeholder="Isi pesan notifikasi..." value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})} style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>Tipe</label>
                      <select className="input" value={notifForm.type} onChange={e => setNotifForm({...notifForm, type: e.target.value})}>
                        <option value="info">Info (Biru)</option>
                        <option value="success">Success (Hijau)</option>
                        <option value="warning">Warning (Kuning)</option>
                        <option value="error">Error (Merah)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>Target User</label>
                      <select className="input" value={notifForm.user_id} onChange={e => setNotifForm({...notifForm, user_id: e.target.value})}>
                        <option value="all">Semua User</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={sendNotification} disabled={sendingNotif} style={{ marginTop: '10px' }}>
                    {sendingNotif ? 'Mengirim...' : '🚀 Kirim Notifikasi'}
                  </button>
                </div>
              </div>
            </div>
          ) : activeMenu === 'music' ? (
            /* MUSIC MANAGEMENT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Add Song Form */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎵</span> Tambah Lagu Baru
                </h3>
                {/* Row 1: title, artist, album, genre */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>JUDUL *</label>
                    <input className="input" placeholder="Nama lagu..." value={musicForm.title}
                      onChange={e => setMusicForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>ARTIS</label>
                    <input className="input" placeholder="Nama artis..." value={musicForm.artist}
                      onChange={e => setMusicForm(f => ({ ...f, artist: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>ALBUM</label>
                    <input className="input" placeholder="Nama album..." value={musicForm.album}
                      onChange={e => setMusicForm(f => ({ ...f, album: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>GENRE</label>
                    <select className="input" value={musicForm.genre_id}
                      onChange={e => setMusicForm(f => ({ ...f, genre_id: e.target.value }))}>
                      <option value="">— Pilih Genre —</option>
                      {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>
                {/* Row 2: file_url */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    URL AUDIO * <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(Google Drive: /uc?export=download&id=XXX · atau URL MP3 publik)</span>
                  </label>
                  <input className="input" placeholder="https://..." value={musicForm.file_url}
                    onChange={e => setMusicForm(f => ({ ...f, file_url: e.target.value }))} />
                </div>
                {/* Row 3: cover_url */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    URL COVER <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(opsional — URL gambar untuk album art)</span>
                  </label>
                  <input className="input" placeholder="https://... (jpg/png/webp)" value={musicForm.cover_url}
                    onChange={e => setMusicForm(f => ({ ...f, cover_url: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={addMusic} disabled={addingMusic}>
                    {addingMusic ? <><span className="spin">⚙️</span> Menambahkan...</> : '🎵 Simpan Lagu'}
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Total: {musicList.length} lagu</span>
                </div>
              </div>

              {/* Song List */}
              {musicList.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎵</div>
                  <p style={{ color: 'var(--text2)' }}>Belum ada lagu. Upload lagu pertama!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {musicList.map((m, i) => {
                    const genreNames = (m.genres || []).map((g: any) => g.name).join(', ')
                    return (
                      <div key={m.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 600, width: '24px', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                        {/* Cover */}
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          {m.cover_url
                            ? <img src={m.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '22px' }}>🎵</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                            {m.artist || 'Unknown'}{m.album ? ` · ${m.album}` : ''}{genreNames ? ` · ${genreNames}` : ''}
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>▶ {m.play_count || 0}x</span>
                        <audio controls src={m.file_url} style={{ height: '32px', maxWidth: '200px', flexShrink: 0 }} />
                        <button onClick={() => deleteMusic(m.id, m.title)}
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '6px 12px', color: '#F87171', cursor: 'pointer', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                          🗑️ Hapus
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          ) : activeMenu === 'reports' ? (
            /* REPORTS MANAGEMENT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="input" value={reportFilter.type} onChange={e => setReportFilter(f => ({ ...f, type: e.target.value }))} style={{ width: 'auto' }}>
                  <option value="all">Semua Jenis</option>
                  <option value="bug">🐛 Bug</option>
                  <option value="saran">💡 Saran</option>
                  <option value="pertanyaan">❓ Pertanyaan</option>
                  <option value="konten">📄 Konten</option>
                  <option value="lainnya">📬 Lainnya</option>
                </select>
                <select className="input" value={reportFilter.status} onChange={e => setReportFilter(f => ({ ...f, status: e.target.value }))} style={{ width: 'auto' }}>
                  <option value="all">Semua Status</option>
                  <option value="open">🔴 Open</option>
                  <option value="resolved">🟡 Resolved</option>
                  <option value="closed">⚫ Closed</option>
                </select>
                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>
                  {reports.filter(r =>
                    (reportFilter.type === 'all' || r.type === reportFilter.type) &&
                    (reportFilter.status === 'all' || r.status === reportFilter.status)
                  ).length} laporan
                </span>
              </div>

              {/* Report List */}
              {reports
                .filter(r =>
                  (reportFilter.type === 'all' || r.type === reportFilter.type) &&
                  (reportFilter.status === 'all' || r.status === reportFilter.status)
                )
                .length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <p style={{ color: 'var(--text2)' }}>Tidak ada laporan ditemukan</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reports
                    .filter(r =>
                      (reportFilter.type === 'all' || r.type === reportFilter.type) &&
                      (reportFilter.status === 'all' || r.status === reportFilter.status)
                    )
                    .map(r => {
                      const typeIcon = r.type === 'bug' ? '🐛' : r.type === 'saran' ? '💡' : r.type === 'pertanyaan' ? '❓' : r.type === 'konten' ? '📄' : '📬'
                      const statusColor = r.status === 'open' ? '#EF4444' : r.status === 'resolved' ? '#F59E0B' : '#6B7280'
                      return (
                        <div key={r.id} className="card" style={{ padding: '18px', borderLeft: `3px solid ${statusColor}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ fontSize: '18px' }}>{typeIcon}</span>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{r.title}</span>
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, fontWeight: 700, textTransform: 'uppercase' }}>
                                  {r.status}
                                </span>
                              </div>
                              <p style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.6, marginBottom: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.description}</p>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text3)', flexWrap: 'wrap' }}>
                                <span>👤 {r.username || 'Tamu'}</span>
                                {r.email && <span>✉️ {r.email}</span>}
                                <span>🕐 {new Date(r.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                              {r.status === 'open' && (
                                <button className="btn btn-sm" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }} onClick={() => updateReportStatus(r.id, 'resolved')}>Resolve</button>
                              )}
                              {r.status !== 'closed' && (
                                <button className="btn btn-sm" style={{ background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }} onClick={() => updateReportStatus(r.id, 'closed')}>Close</button>
                              )}
                              {r.status === 'closed' && (
                                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }} onClick={() => updateReportStatus(r.id, 'open')}>Reopen</button>
                              )}
                              <button
                                className="btn btn-sm"
                                style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}
                                onClick={() => deleteReport(r.id)}
                                title="Hapus laporan"
                              >🗑️ Hapus</button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )}
            </div>
          ) : activeMenu === 'settings' ? (
            /* SETTINGS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>⚙️ Pengaturan Sistem</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg4)', borderRadius: '10px' }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>Mode Maintenance</p>
                      <p style={{ color: 'var(--text3)', fontSize: '12px' }}>Nonaktifkan akses untuk user biasa</p>
                    </div>
                    <button 
                      onClick={toggleMaintenance}
                      style={{
                        padding: '10px 20px',
                        background: maintenance ? 'rgba(255,50,50,0.2)' : 'rgba(50,255,50,0.2)',
                        border: `1px solid ${maintenance ? 'rgba(255,50,50,0.3)' : 'rgba(50,255,50,0.3)'}`,
                        color: maintenance ? '#ff5555' : '#55ff55',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {maintenance ? '🚧 AKTIF' : '🌐 MATI'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>🔗 Quick Links</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-secondary">📊 Dashboard User</button>
                  </Link>
                  <Link href="/library" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-secondary">📚 Library</button>
                  </Link>
                  <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-secondary">👤 Profil</button>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{modal === 'edit' ? '✏️ Edit PDF' : '➕ Tambah PDF'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>NAMA PDF</label>
                <input className="input" placeholder="Nama PDF" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>URL (Google Drive)</label>
                <input className="input" placeholder="https://drive.google.com/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>KATEGORI</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>THUMBNAIL EMOJI</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {THUMBS.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, thumbnail: t }))}
                      style={{ fontSize: '20px', padding: '6px', borderRadius: '8px', border: `2px solid ${form.thumbnail === t ? 'var(--accent)' : 'transparent'}`, background: form.thumbnail === t ? 'rgba(199,32,230,0.2)' : 'var(--bg4)', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>Batal</button>
                <button className="btn btn-primary" onClick={savePDF} disabled={saving} style={{ flex: 2 }}>
                  {saving ? <><span className="spin">⚙️</span> Menyimpan...</> : `💾 ${modal === 'edit' ? 'Simpan Perubahan' : 'Tambahkan PDF'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
