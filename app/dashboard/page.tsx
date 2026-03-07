'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

interface User { id: number; username: string; email: string; role: string; status: string; created_at: string; email_verified: boolean }
interface PDF { id: number; name: string; url: string; category: string; thumbnail: string; views: number; downloads: number; is_active: boolean }

const COLORS = ['#4488ff', '#C720E6', '#28c864', '#FF6B35', '#7aadff', '#e070ff']

export default function UserDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [allPdfs, setAllPdfs] = useState<PDF[]>([])
    const [favPdfs, setFavPdfs] = useState<PDF[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState('')

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    useEffect(() => {
        fetch('/api/auth/me').then(r => {
            if (r.status === 503) { router.push('/maintenance'); return }
            return r.json()
        }).then(d => {
            if (d?.data) {
                setUser(d.data)
                loadData()
            } else if (d) router.push('/login')
        }).catch(() => router.push('/login'))
    }, [router])

    async function loadData() {
        setLoading(true)
        try {
            const res = await fetch('/api/pdfs')
            const data = await res.json()
            if (data.success) {
                setAllPdfs(data.data)
                const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
                const myFavs = data.data.filter((p: PDF) => favIds.includes(p.id))
                setFavPdfs(myFavs)
            }
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    async function handleDownload(pdf: PDF) {
        try {
            await fetch(`/api/pdfs/${pdf.id}/download`, { method: 'POST' })
            setAllPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
            setFavPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads: (p.downloads || 0) + 1, views: (p.views || 0) + 1 } : p))
        } catch {}
        window.open(pdf.url, '_blank')
        showToast('📥 Membuka PDF...')
    }

    // Stats calculation
    const stats = {
        totalPdf: allPdfs.filter(p => p.is_active).length,
        myDownloads: favPdfs.length,
        myFavorites: favPdfs.length,
        totalViews: allPdfs.reduce((a, p) => a + p.views, 0)
    }

    // Category distribution for chart
    const categoryData = [
        { name: 'Basic', value: allPdfs.filter(p => p.category === 'fx-basic').length },
        { name: 'Advanced', value: allPdfs.filter(p => p.category === 'fx-advanced').length },
        { name: 'Technical', value: allPdfs.filter(p => p.category === 'fx-technical').length },
        { name: 'Psychology', value: allPdfs.filter(p => p.category === 'fx-psychology').length },
    ].filter(d => d.value > 0)

    // Recent activity mock
    const recentActivity = [
        { icon: '📚', text: 'Menjelajahi Library', time: 'Baru saja' },
        { icon: '❤️', text: `Menambahkan ${favPdfs.length} materi ke favorit`, time: 'Hari ini' },
        { icon: '📥', text: 'Mengakses materi trading', time: 'Kemarin' },
    ]

    if (loading || !user) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spin" style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                    <p style={{ color: 'var(--text2)' }}>Memuat Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {toast && <div className="toast success">{toast}</div>}

            {/* Header */}
            <header style={{ background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>📊</span>
                        <div>
                            <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }} className="grad-text">MY DASHBOARD</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link href="/profile" style={{ textDecoration: 'none' }}>
                            <button className="btn btn-ghost btn-sm">👤 Profil</button>
                        </Link>
                        <Link href="/settings" style={{ textDecoration: 'none' }}>
                            <button className="btn btn-ghost btn-sm hide-mobile">⚙️ Settings</button>
                        </Link>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

                {/* Welcome Section */}
                <div className="card" style={{ 
                    padding: '32px', 
                    marginBottom: '24px', 
                    textAlign: 'center', 
                    background: 'linear-gradient(135deg, rgba(31,71,136,0.2) 0%, rgba(199,32,230,0.2) 100%)',
                    border: '1px solid var(--border2)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>👋</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                        Selamat Datang, <span className="grad-text">{user.username}</span>!
                    </h1>
                    <p style={{ color: 'var(--text2)', fontSize: '16px', marginBottom: '20px' }}>
                        Siap belajar trading hari ini? Mari jelajahi materi-materi premium kami.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge ${user.role === 'Owner' || user.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
                        <span className={`badge ${user.status === 'Aktif' ? 'badge-green' : 'badge-red'}`}>{user.status}</span>
                        {user.email_verified && <span className="badge badge-green">✅ Email Terverifikasi</span>}
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { icon: '📚', label: 'Total Materi', value: stats.totalPdf, color: '#4488ff', bg: 'rgba(68,136,255,0.15)' },
                        { icon: '❤️', label: 'Favorit Saya', value: stats.myFavorites, color: '#C720E6', bg: 'rgba(199,32,230,0.15)' },
                        { icon: '📥', label: 'Di Akses', value: stats.myDownloads, color: '#28c864', bg: 'rgba(40,200,100,0.15)' },
                        { icon: '👁', label: 'Total Views', value: stats.totalViews, color: '#FF6B35', bg: 'rgba(255,107,53,0.15)' },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ padding: '20px', background: s.bg, border: `1px solid ${s.color}33` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: s.color }}>{s.value.toLocaleString()}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>{s.label}</div>
                                </div>
                                <div style={{ fontSize: '40px', opacity: 0.9 }}>{s.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    
                    {/* Quick Actions */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>⚡</span> Menu Utama
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <Link href="/" style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.3)' }}>
                                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>📚</div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Library</h3>
                                    <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '4px' }}>Semua Materi</p>
                                </div>
                            </Link>
                            <Link href="/profile" style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(199,32,230,0.1)', border: '1px solid rgba(199,32,230,0.3)' }}>
                                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>👤</div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Profil</h3>
                                    <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '4px' }}>Kelola Akun</p>
                                </div>
                            </Link>
                            <Link href="/settings" style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(40,200,100,0.1)', border: '1px solid rgba(40,200,100,0.3)' }}>
                                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚙️</div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Settings</h3>
                                    <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '4px' }}>Pengaturan</p>
                                </div>
                            </Link>
                            {['Owner', 'Admin'].includes(user.role) && (
                                <Link href="/admin" style={{ textDecoration: 'none' }}>
                                    <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)' }}>
                                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🛠️</div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Admin</h3>
                                        <p style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '4px' }}>Panel Admin</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Category Distribution Chart */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📊</span> Kategori Materi
                        </h2>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                                <p>Belum ada materi</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {categoryData.map((cat, i) => (
                                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i] }} />
                                    <span style={{ color: 'var(--text2)' }}>{cat.name}: {cat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📝</span> Aktivitas Terkini
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentActivity.map((act, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: 'var(--bg4)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '24px' }}>{act.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', fontWeight: 500 }}>{act.text}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Favorites */}
                {favPdfs.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>❤️</span> Materi Favorit Saya
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {favPdfs.slice(0, 6).map(pdf => (
                                <div key={pdf.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{pdf.thumbnail}</div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pdf.name}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px', fontSize: '11px', color: 'var(--text3)' }}>
                                        <span>👁 {pdf.views}</span>
                                        <span>📥 {pdf.downloads}</span>
                                    </div>
                                    <button onClick={() => handleDownload(pdf)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>📖 Baca Sekarang</button>
                                </div>
                            ))}
                        </div>
                        {favPdfs.length > 6 && (
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Link href="/" style={{ textDecoration: 'none' }}>
                                    <button className="btn btn-secondary">📚 Lihat Semua di Library →</button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}

