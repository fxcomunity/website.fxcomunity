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
interface Music {
  id: number
  title: string
  artist: string
  album: string
  file_url: string
  cover_url: string
  genres: { id: number; name: string }[]
}


const CATS = ['fx-basic', 'fx-advanced', 'fx-technical', 'fx-psychology']
const THUMBS = ['📊', '📈', '📉', '📈', '📚', '💰', '⚖️', '🔧', '🌍', '⚠️', '🎯', '💧', '✅', '🔨', '⚡', '📦', '🌊', '🏗️', '🎁', '📍', '🔐', '🕯️', '🎨', '💼', '📖', '🚀', '💎', '📄']

const COLORS = ['#4488ff', '#C720E6', '#28c864', '#FF6B35', '#7aadff', '#e070ff']

// SVG icon helpers
const Ico = ({ d, size = 17 }: { d: string | string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((path, i) => <path key={i} d={path} />)}
  </svg>
)
const IcoCircle = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="1.8" />
)

// Menu items
const MENU_ITEMS = [
  {
    key: 'dashboard', label: 'Dashboard',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  },
  {
    key: 'pdfs', label: 'Kelola PDF',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
  },
  {
    key: 'users', label: 'Kelola User',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    key: 'music', label: 'Kelola Musik',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  },
  {
    key: 'music-sql', label: 'Music SQL Runner',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7v10M9 7v10M14 7v10M19 7v10M5 12h14"/><path d="M12 19l-2 2-2-2M12 5l-2-2-2 2"/></svg>
  },
  {
    key: 'notifications', label: 'Notifikasi',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  },
  {
    key: 'reports', label: 'Laporan User',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  },
  {
    key: 'crypto', label: 'Crypto Decoder',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  },
  {
    key: 'settings', label: 'Pengaturan',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
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
  const [musicList, setMusicList] = useState<Music[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string; slug: string }[]>([])
  const [musicForm, setMusicForm] = useState({ id: 0, title: '', artist: '', album: '', file_url: '', cover_url: '', genre_ids: [] as number[] })
  const [musicModal, setMusicModal] = useState<null | 'add' | 'edit'>(null)
  const [editingMusic, setEditingMusic] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)


  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.data || !['Owner', 'Admin'].includes(d.data.role)) router.push('/library')
      else { setMe(d.data); loadAll() }
    })
  }, [])

  // Re-load data when switching tabs to ensure freshness
  useEffect(() => {
    if (me) loadAll()
  }, [activeMenu])

  async function loadAll() {
    setLoading(true)
    const [pRes, uRes, sRes, reqRes, repRes, mRes, gRes] = await Promise.all([
      fetch('/api/pdfs', { next: { revalidate: 0 } }).then(r => r.json()),
      fetch('/api/users', { next: { revalidate: 0 } }).then(r => r.json()),
      fetch('/api/admin/settings', { next: { revalidate: 0 } }).then(r => r.json()),
      fetch('/api/admin/admin-requests', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/report', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/music', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/music/genres', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] }))
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
  async function saveMusic() {
    const isEdit = musicModal === 'edit'
    setEditingMusic(true)

    try {
      let res: Response
      if (isEdit) {
        // --- EDIT MODE ---
        if (!musicForm.title.trim() || !musicForm.file_url.trim()) {
          showToast('⚠️ Judul dan URL audio wajib diisi')
          setEditingMusic(false)
          return
        }
        res = await fetch(`/api/music/${musicForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(musicForm)
        })
      } else {
        // --- ADD MODE (FILE UPLOAD) ---
        if (!uploadFile) {
          showToast('⚠️ Silakan pilih file audio untuk diunggah')
          setEditingMusic(false)
          return
        }
        const formData = new FormData()
        formData.append('audioFile', uploadFile)
        musicForm.genre_ids.forEach(id => formData.append('genre_ids[]', String(id)))
        
        res = await fetch('/api/music', {
          method: 'POST',
          body: formData,
        })
      }

      const data = await res.json()
      if (data.success) {
        if (isEdit) {
          setMusicList(p => p.map(m => m.id === musicForm.id ? data.data : m))
          showToast('✅ Lagu berhasil diperbarui!')
        } else {
          setMusicList(p => [data.data, ...p])
          showToast('✅ Lagu berhasil diunggah & diproses!')
        }
        setMusicModal(null)
        // Refresh loadAll after success to ensure everything is synced
        loadAll()
      } else {
        showToast(`⚠️ ${data.error || 'Terjadi kesalahan'}`)
      }
    } catch (err) {
      showToast('⚠️ Error saat menyimpan lagu')
    } finally {
      setEditingMusic(false)
    }
  }

  async function deleteMusic(id: number, title: string) {
    if (!confirm(`Hapus musik "${title}"?`)) return
    const res = await fetch(`/api/music/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { setMusicList(p => p.filter(m => m.id !== id)); showToast('🗑️ Musik dihapus') }
    else showToast('⚠️ Gagal hapus musik')
  }

  function openMusicAdd() {
    setMusicForm({ id: 0, title: '', artist: '', album: '', file_url: '', cover_url: '', genre_ids: [] })
    setUploadFile(null)
    setMusicModal('add')
  }

  function openMusicEdit(song: Music) {
    setMusicForm({
      id: song.id,
      title: song.title,
      artist: song.artist || '',
      album: song.album || '',
      file_url: song.file_url,
      cover_url: song.cover_url || '',
      genre_ids: song.genres?.map(g => g.id) || []
    })
    setMusicModal('edit')
  }

  function handleGenreChange(genreId: number) {
    setMusicForm(f => {
      const newGenreIds = f.genre_ids.includes(genreId)
        ? f.genre_ids.filter(id => id !== genreId)
        : [...f.genre_ids, genreId];
      return { ...f, genre_ids: newGenreIds };
    });
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
      <div className="loader"></div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {toast && <div className="toast success">{toast}</div>}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${mobileOpen ? 'mobile-open' : ''}`} style={{ 
        width: sidebarOpen ? '256px' : '72px', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.28s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 200,
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,229,255,0.25)', color: '#000' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
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
                else if (item.key === 'music-sql') router.push('/admin/music-sql')
                else setActiveMenu(item.key)
                setMobileOpen(false)
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
                {maintenance
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
              </span>
              {sidebarOpen && <span style={{ fontSize: '13px' }}>Maintenance {maintenance ? 'ON' : 'OFF'}</span>}
            </button>
            <Link href="/admin/banners-manage" style={{ textDecoration: 'none' }}>
              <div className="admin-nav-item" style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '11px 14px' : '11px 0' }}>
                <span className="admin-nav-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </span>
                {sidebarOpen && <span style={{ fontSize: '13px' }}>Banner Manager</span>}
              </div>
            </Link>
          </div>
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/library" style={{ textDecoration: 'none' }}>
            <div className="admin-nav-item" style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 14px' : '10px 0' }}>
              <span className="admin-nav-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </span>
              {sidebarOpen && <span style={{ fontSize: '13px' }}>Ke Library</span>}
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-nav-item"
            style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 14px' : '10px 0', marginTop: '2px' }}
          >
            <span className="admin-nav-icon">
              {sidebarOpen
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
            </span>
            {sidebarOpen && <span style={{ fontSize: '13px' }}>Collapse</span>}
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
          {/* Hamburger — mobile only */}
          <button
            className="admin-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle Menu"
          >
            <span /><span /><span />
          </button>
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
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'Total PDF', value: stats.totalPdf, color: '#4488ff', grad: 'linear-gradient(135deg,#1a3a8f,#1e2d5e)' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, label: 'PDF Aktif', value: stats.activePdf, color: '#28c864', grad: 'linear-gradient(135deg,#0f3d20,#0a2415)' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Total User', value: stats.totalUser, color: '#A855F7', grad: 'linear-gradient(135deg,#3b1d7a,#231145)' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, label: 'Total Download', value: stats.totalDownload, color: '#FF6B35', grad: 'linear-gradient(135deg,#5c2410,#3a1608)' },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, label: 'Total View', value: stats.totalViews, color: '#00E5FF', grad: 'linear-gradient(135deg,#0a3a42,#05222a)' },
                ].map(s => (
                  <div key={s.label} className="admin-stat-card" style={{ background: s.grad, border: `1px solid ${s.color}25` }}>
                    <div className="admin-stat-value" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                    <div className="admin-stat-label" style={{ color: s.color }}>{s.label}</div>
                    <div className="admin-stat-icon" style={{ color: s.color, fontSize: 'inherit' }}>{s.icon}</div>
                    <div className="admin-stat-trend" style={{ color: s.color }}>&#8599; Live</div>
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
                    {sendingNotif ? 'Mengirim...' : '🔔 Kirim Notifikasi'}
                  </button>
                </div>
              </div>
            </div>
          ) : activeMenu === 'music' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2 style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>🎵 Kelola Musik</h2>
                  <p>Upload dan kelola koleksi lagu di SoundVault.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={loadAll} style={{ padding: '11px 18px', borderRadius: '12px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    Refresh
                  </button>
                  <button className="btn btn-primary" onClick={openMusicAdd} style={{ padding: '11px 22px', borderRadius: '12px', gap: '8px', display: 'flex', alignItems: 'center', boxShadow: '0 6px 20px rgba(0,229,255,0.22)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Upload Lagu
                  </button>
                </div>
              </div>

              {/* Stats ribbon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Lagu', val: musicList.length, icon: '🎵', c: '#00E5FF', bg: 'rgba(0,229,255,0.06)' },
                  { label: 'Total Plays', val: musicList.reduce((a: number, m: any) => a + (m.play_count || 0), 0), icon: '▶️', c: '#A855F7', bg: 'rgba(168,85,247,0.06)' },
                  { label: 'Genre', val: genres.length, icon: '🏷️', c: '#10B981', bg: 'rgba(16,185,129,0.06)' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.c}18`, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '26px' }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.val.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px', fontWeight: 600, letterSpacing: '0.5px' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Song list */}
              {musicList.length === 0 ? (
                <div className="admin-empty" style={{ padding: '80px 20px' }}>
                  <div className="admin-empty-icon" style={{ width: '80px', height: '80px', borderRadius: '24px' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </div>
                  <h3>Belum Ada Lagu</h3>
                  <p>Klik tombol Upload Lagu untuk mulai mengisi library SoundVault Anda.</p>
                  <button className="btn btn-primary" onClick={openMusicAdd} style={{ marginTop: '16px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Upload Sekarang
                  </button>
                </div>
              ) : (
                <div className="admin-card" style={{ overflow: 'hidden' }}>
                  {/* Table Header */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                      Menampilkan <span style={{ color: '#00E5FF' }}>{musicList.filter((m: any) => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.artist?.toLowerCase().includes(search.toLowerCase())).length}</span> lagu
                    </span>
                    <div className="admin-search-wrap" style={{ width: '240px' }}>
                      <span className="admin-search-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </span>
                      <input type="text" placeholder="Cari judul atau artis..." className="admin-search" style={{ height: '38px', borderRadius: '10px', fontSize: '12px' }}
                        value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>

                  {/* Song rows */}
                  <div style={{ overflowX: 'auto' }}>
                    {musicList
                      .filter((m: any) => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.artist?.toLowerCase().includes(search.toLowerCase()))
                      .map((m: any, i: number) => {
                        const genreNames: string[] = (m.genres || []).map((g: any) => g.name)
                        const dur = m.duration_sec || 0
                        const durStr = dur > 0 ? `${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')}` : '--:--'
                        return (
                          <div key={m.id} className="music-row-item">
                            {/* Number */}
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.15)', fontWeight: 800, minWidth: '28px', textAlign: 'center' }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>

                            {/* Cover */}
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0, overflow: 'hidden', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                              {m.cover_url
                                ? <img src={m.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a2744,#0d1424)' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                  </div>}
                            </div>

                            {/* Title + Artist */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>{m.title}</div>
                              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                {m.artist || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Unknown Artist</span>}
                              </div>
                            </div>

                            {/* Genres */}
                            <div className="music-genre-pills" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '160px' }}>
                              {(m.genres && m.genres.length > 0) ? m.genres.map((g: any) => (
                                <span key={g.id || g.name} style={{ fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', background: 'rgba(168,85,247,0.1)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.18)', letterSpacing: '0.5px' }}>{g.name}</span>
                              )) : <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>—</span>}
                            </div>

                            {/* Duration */}
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, minWidth: '42px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{durStr}</span>

                            {/* Play count */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.28)', fontSize: '12px', minWidth: '50px' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              {(m.play_count || 0).toLocaleString()}
                            </div>

                            {/* Audio mini player */}
                            <div className="music-mini-audio">
                              <audio controls src={m.file_url} style={{ height: '30px', width: '100%', opacity: 0.65 }} />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexShrink: 0 }}>
                              <button onClick={() => openMusicEdit(m)} className="admin-btn-icon" title="Edit" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => deleteMusic(m.id, m.title)} className="admin-btn-icon danger" title="Hapus" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="admin-page-header">
                <h2>Pengaturan Sistem</h2>
                <p>Kontrol konfigurasi platform, maintenance mode, statistik, dan info sistem</p>
              </div>
              <div className="admin-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: maintenance ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', border: `1px solid ${maintenance ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: maintenance ? '#F87171' : '#4ADE80' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Mode Maintenance</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Nonaktifkan akses user biasa ke seluruh platform</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: maintenance ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', color: maintenance ? '#F87171' : '#4ADE80', border: `1px solid ${maintenance ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}` }}>{maintenance ? 'AKTIF' : 'MATI'}</span>
                  <button onClick={toggleMaintenance} className={`btn btn-sm ${maintenance ? 'btn-danger' : 'btn-secondary'}`}>{maintenance ? 'Matikan' : 'Aktifkan'}</button>
                </div>
                {maintenance && (
                  <div style={{ marginTop: '12px', padding: '11px 14px', borderRadius: '10px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', fontSize: '13px', color: '#F87171', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Maintenance aktif — semua user biasa tidak dapat mengakses platform
                  </div>
                )}
              </div>
              <div className="admin-card" style={{ padding: '22px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Statistik Platform
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {[
                    { label: 'Total PDF', val: pdfs.length, sub: `${pdfs.filter(p => p.is_active).length} aktif` },
                    { label: 'Total User', val: users.length, sub: `${users.filter(u => u.role === 'Admin' || u.role === 'Owner').length} admin/owner` },
                    { label: 'Total Musik', val: musicList.length, sub: `${musicList.reduce((a: number, m: any) => a + (m.play_count || 0), 0)} plays` },
                    { label: 'Total Download', val: pdfs.reduce((a, p) => a + p.downloads, 0), sub: 'semua waktu' },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#00E5FF', marginBottom: '2px' }}>{s.val.toLocaleString()}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card" style={{ padding: '22px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>Navigasi Cepat</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[{ href: '/dashboard', label: 'Dashboard User' }, { href: '/library', label: 'Library' }, { href: '/music', label: 'Music Player' }, { href: '/profile', label: 'Profil' }, { href: '/admin/banners-manage', label: 'Banner Manager' }].map(l => (
                    <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }}>{l.label}</button>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="admin-card" style={{ padding: '22px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Info Sistem
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {[{ k: 'Platform', v: 'FX Community' }, { k: 'Framework', v: 'Next.js App Router' }, { k: 'Database', v: 'PostgreSQL (Neon)' }, { k: 'Music Schema', v: 'SoundVault v1' }, { k: 'Role Anda', v: me?.role || '-' }, { k: 'Username', v: me?.username || '-' }].map(r => (
                    <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '12px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{r.k}</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{r.v}</span>
                    </div>
                  ))}
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

      {/* Add/Edit Music Modal */}
      {musicModal && (
        <div className="modal-overlay" onClick={() => setMusicModal(null)} style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.65)' }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '0', maxWidth: '560px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,rgba(0,229,255,0.04),transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.3px', margin: 0 }}>{musicModal === 'edit' ? 'Edit Lagu' : 'Upload Lagu Baru'}</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{musicModal === 'edit' ? 'Perbarui informasi lagu' : 'Tambah ke koleksi SoundVault'}</p>
                </div>
              </div>
              <button className="admin-btn-icon" onClick={() => setMusicModal(null)} style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '75vh', overflowY: 'auto' }}>

              {/* Quick Save Button at Top (for Edit mode) */}
              {musicModal === 'edit' && (
                <div style={{ padding: '12px', background: 'rgba(0,229,255,0.05)', borderRadius: '14px', border: '1px solid rgba(0,229,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Cepat simpan perubahan:</span>
                  <button className="btn btn-primary" onClick={saveMusic} disabled={editingMusic} style={{ padding: '6px 16px', fontSize: '12px', height: 'auto', borderRadius: '8px' }}>
                    {editingMusic ? '...' : '💾 Simpan Sekarang'}
                  </button>
                </div>
              )}

              {/* File upload zone (add mode) */}
              {musicModal === 'add' && (
                <div>
                  <label className="admin-field-label" style={{ marginBottom: '10px', display: 'block' }}>File Audio <span style={{ color: '#F87171' }}>*</span></label>
                  <label
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '12px', padding: '28px 20px', borderRadius: '16px', cursor: 'pointer',
                      border: uploadFile ? '2px solid rgba(0,229,255,0.4)' : '2px dashed rgba(255,255,255,0.1)',
                      background: uploadFile ? 'rgba(0,229,255,0.04)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {uploadFile ? (
                      <>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadFile.name}</div>
                          <div style={{ fontSize: '11px', color: '#00E5FF', marginTop: '4px', fontWeight: 600 }}>{(uploadFile.size / (1024*1024)).toFixed(2)} MB · {uploadFile.type.split('/')[1]?.toUpperCase()}</div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>Klik untuk ganti file</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Klik untuk pilih file audio</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>MP3, WAV, FLAC · Maks 50MB</div>
                        </div>
                      </>
                    )}
                    <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              )}

              {/* Edit mode: metadata fields */}
              {musicModal === 'edit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="admin-field-label">Judul Lagu <span style={{ color: '#F87171' }}>*</span></label>
                    <input className="input" placeholder="Judul lagu" value={musicForm.title} onChange={e => setMusicForm(f => ({ ...f, title: e.target.value }))} style={{ height: '42px', marginTop: '6px' }}/>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="admin-field-label">Artis</label>
                      <input className="input" placeholder="Nama artis" value={musicForm.artist} onChange={e => setMusicForm(f => ({ ...f, artist: e.target.value }))} style={{ height: '42px', marginTop: '6px' }}/>
                    </div>
                    <div>
                      <label className="admin-field-label">Album</label>
                      <input className="input" placeholder="Nama album" value={musicForm.album} onChange={e => setMusicForm(f => ({ ...f, album: e.target.value }))} style={{ height: '42px', marginTop: '6px' }}/>
                    </div>
                  </div>
                  <div>
                    <label className="admin-field-label">URL Cover</label>
                    <input className="input" placeholder="https://..." value={musicForm.cover_url} onChange={e => setMusicForm(f => ({ ...f, cover_url: e.target.value }))} style={{ height: '42px', marginTop: '6px' }}/>
                  </div>
                </div>
              )}

              {/* Genres */}
              <div>
                <label className="admin-field-label" style={{ marginBottom: '10px', display: 'block' }}>Genre</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {genres.map(g => {
                    const isSelected = musicForm.genre_ids.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGenreChange(g.id)}
                        style={{
                          padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                          background: isSelected ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                          color: isSelected ? '#C084FC' : 'rgba(255,255,255,0.4)',
                          boxShadow: isSelected ? '0 0 0 1px rgba(168,85,247,0.4)' : '0 0 0 1px rgba(255,255,255,0.07)',
                        }}
                      >
                        {isSelected && '✓ '}{g.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 28px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setMusicModal(null)} style={{ flex: 1, height: '44px', borderRadius: '12px' }}>Batal</button>
              <button
                className="btn btn-primary"
                onClick={saveMusic}
                disabled={editingMusic || (musicModal === 'add' && !uploadFile)}
                style={{ flex: 2, height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {editingMusic
                  ? <><span className="loader-sm"></span> Memproses...</>
                  : musicModal === 'edit'
                    ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Simpan Perubahan</>
                    : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload Sekarang</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
