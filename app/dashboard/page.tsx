'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserLayout from '@/components/UserLayout'

interface User { id: number; username: string; email: string; role: string; status: string; created_at: string; email_verified: boolean }
interface PDF { id: number; name: string; url: string; category: string; thumbnail: string; views: number; downloads: number; is_active: boolean }

export default function UserDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [pdfs, setPdfs] = useState<PDF[]>([])
    const [favPdfs, setFavPdfs] = useState<PDF[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(d => {
            if (d?.data) {
                setUser(d.data)
                loadData()
                loadNotifications()
            } else router.push('/login')
        }).catch(() => router.push('/login'))
    }, [router])

    async function loadData() {
        try {
            const res = await fetch('/api/pdfs')
            const data = await res.json()
            if (data.success) {
                setPdfs(data.data)
                const favIds: number[] = JSON.parse(localStorage.getItem('fav_pdfs') || '[]')
                setFavPdfs(data.data.filter((p: PDF) => favIds.includes(p.id)))
            }
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    async function loadNotifications() {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.success) setNotifications(data.data)
        } catch {}
    }

    if (loading || !user) return <div style={{ minHeight: '100vh', background: '#0b0c10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat...</div>

    return (
        <UserLayout>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1a1b23', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '3px solid #00e5ff' }}>
                        {user.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Halo, {user.username}!</h1>
                        <p style={{ color: '#888', fontSize: '14px' }}>Selamat datang kembali di FX Comunity.</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <span style={{ background: '#00e5ff', color: '#000', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{user.role}</span>
                            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{user.status}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    
                    {/* Notifications Section */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🔔 Notifikasi Terbaru
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {notifications.length === 0 ? (
                                <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Tidak ada notifikasi baru</p>
                            ) : (
                                notifications.slice(0, 3).map(n => (
                                    <div key={n.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #00e5ff' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{n.title}</div>
                                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{n.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#00e5ff' }}>{pdfs.length}</div>
                            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginTop: '5px' }}>Total Materi</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#00e5ff' }}>{favPdfs.length}</div>
                            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginTop: '5px' }}>Favorit</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#00e5ff' }}>{pdfs.reduce((a, b) => a + b.views, 0)}</div>
                            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginTop: '5px' }}>Total Views</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#00e5ff' }}>{pdfs.reduce((a, b) => a + b.downloads, 0)}</div>
                            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginTop: '5px' }}>Downloads</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>Akses Cepat</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                    {[
                        { name: 'Library', path: '/library', icon: '📖' },
                        { name: 'Favorit', path: '/favorites', icon: '❤️' },
                        { name: 'Profil', path: '/profile', icon: '👤' },
                        { name: 'Settings', path: '/settings', icon: '⚙️' },
                    ].map(link => (
                        <Link key={link.name} href={link.path} style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '20px', background: '#1a1b23', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }} className="action-card">
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{link.icon}</div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{link.name}</div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
            <style jsx>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                }
                .action-card:hover {
                    background: #23242d;
                    border-color: #00e5ff;
                    transform: translateY(-3px);
                }
            `}</style>
        </UserLayout>
    )
}
