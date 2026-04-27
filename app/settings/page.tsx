'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserLayout from '@/components/UserLayout'

interface User { id: number; username?: string; first_name?: string; last_name?: string; email: string; role: string; status: string; created_at: string; email_verified: boolean }

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('password')
  const [toast, setToast] = useState('')

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_updates: true,
    new_content: true,
    weekly_digest: false
  })
  const [savingNotifications, setSavingNotifications] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.status === 503) { router.push('/maintenance'); return }
      return r.json()
    }).then(d => {
      if (d?.data) {
        setUser(d.data)
        // Load user settings (could be from API in future)
        loadSettings()
      } else router.push('/login')
    }).catch(() => router.push('/login'))
  }, [router])

  async function loadSettings() {
    // For now, load from localStorage, but this could be from API
    const saved = localStorage.getItem('user_settings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setNotifications(settings.notifications || notifications)
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
    setLoading(false)
  }

  async function changePassword() {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      showToast('⚠️ Semua field password wajib diisi')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('⚠️ Password baru tidak cocok')
      return
    }
    if (passwordForm.new.length < 6) {
      showToast('⚠️ Password minimal 6 karakter')
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current,
          new_password: passwordForm.new
        })
      })
      const data = await res.json()
      if (data.success) {
        setPasswordForm({ current: '', new: '', confirm: '' })
        showToast('✅ Password berhasil diubah')
      } else {
        showToast('⚠️ ' + (data.error || 'Gagal ubah password'))
      }
    } catch (e) {
      showToast('⚠️ Error ubah password')
    } finally {
      setChangingPassword(false)
    }
  }

  async function saveNotifications() {
    setSavingNotifications(true)
    try {
      // Save to localStorage for now, but this could be API call
      const settings = { notifications }
      localStorage.setItem('user_settings', JSON.stringify(settings))
      showToast('✅ Pengaturan notifikasi disimpan')
    } catch (e) {
      showToast('⚠️ Gagal simpan pengaturan')
    } finally {
      setSavingNotifications(false)
    }
  }

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <p style={{ color: 'var(--text2)' }}>Memuat Pengaturan...</p>
        </div>
      </div>
    )
  }

  return (
    <UserLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'password', label: '🔑 Password', icon: '🔑' },
            { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
            { id: 'account', label: '👤 Account', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--gradient)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text2)',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card glass-panel" style={{ padding: '32px' }}>

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔑</span> Change Password
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>CURRENT PASSWORD</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.current}
                    onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>NEW PASSWORD</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Min 6 characters"
                    value={passwordForm.new}
                    onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>CONFIRM NEW PASSWORD</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Repeat new password"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={changePassword}
                  disabled={changingPassword}
                  style={{ marginTop: '8px' }}
                >
                  {changingPassword ? <><span className="spin">⚙️</span> Changing...</> : '🔑 Change Password'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔔</span> Notification Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                {[
                  { key: 'email_updates', label: 'Email Updates', desc: 'Receive emails about app updates' },
                  { key: 'new_content', label: 'New Content', desc: 'Notify when new materials drop' },
                  { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Email summary of weekly activity' }
                ].map(setting => (
                  <div key={setting.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border2)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{setting.label}</div>
                      <div style={{ color: 'var(--text2)', fontSize: '13px' }}>{setting.desc}</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={(notifications as any)[setting.key]}
                        onChange={e => setNotifications(n => ({ ...n, [setting.key]: e.target.checked }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
                <button
                  className="btn btn-primary"
                  onClick={saveNotifications}
                  disabled={savingNotifications}
                  style={{ marginTop: '8px', alignSelf: 'flex-start' }}
                >
                  {savingNotifications ? <><span className="spin">⚙️</span> Saving...</> : '💾 Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👤</span> Account Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                <div style={{ padding: '20px', background: 'var(--bg3)', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Account Info</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text2)' }}>Username:</span>
                    <span style={{ fontWeight: 600 }}>{user.first_name || user.username || user.email}</span>
                    <span style={{ color: 'var(--text2)' }}>Email:</span>
                    <span style={{ fontWeight: 600 }}>{user.email}</span>
                    <span style={{ color: 'var(--text2)' }}>Role:</span>
                    <span style={{ fontWeight: 600 }}>{user.role}</span>
                    <span style={{ color: 'var(--text2)' }}>Status:</span>
                    <span style={{ fontWeight: 600 }}>{user.status}</span>
                    <span style={{ color: 'var(--text2)' }}>Joined:</span>
                    <span style={{ fontWeight: 600 }}>{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div style={{ padding: '20px', background: 'var(--bg3)', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Account Actions</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link href="/profile" style={{ textDecoration: 'none' }}>
                      <button className="btn btn-secondary btn-sm">✏️ Edit Profile</button>
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                          showToast('⚠️ Delete account feature not implemented yet')
                        }
                      }}
                    >
                      🗑️ Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </UserLayout>
  )
}
