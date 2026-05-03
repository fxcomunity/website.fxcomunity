'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User { role: string }

export default function CryptoDecryptPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [method, setMethod] = useState('base64')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dbData, setDbData] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', text: '', method: 'base64' })

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d?.data && (d.data.role === 'Owner' || d.data.role === 'Admin')) {
        setUser(d.data)
        if (d.data.role === 'Owner') {
          setIsVerified(true)
          loadDbData()
        }
      } else {
        router.push('/dashboard')
      }
    }).catch(() => router.push('/login'))
  }, [router])

  const handleVerifyCode = async () => {
    if (!accessCode) return
    setVerifying(true)
    setVerifyError('')
    try {
      const res = await fetch('/api/admin/verify-access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode, targetTool: 'Decoder Kripto' })
      })
      const data = await res.json()
      if (data.success) {
        setIsVerified(true)
        loadDbData()
      } else {
        setVerifyError(data.error || 'Kode salah atau kedaluwarsa')
      }
    } catch {
      setVerifyError('Terjadi kesalahan koneksi')
    }
    setVerifying(false)
  }

  const loadDbData = async () => {
    try {
      const res = await fetch('/api/crypto/list')
      const data = await res.json()
      if (data.success) setDbData(data.data)
    } catch {}
  }

  const addData = async () => {
    if (!newItem.title || !newItem.text) return
    setLoading(true)
    try {
      const res = await fetch('/api/crypto/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newItem.title, encrypted_text: newItem.text, method: newItem.method })
      })
      const data = await res.json()
      if (data.success) {
        setNewItem({ title: '', text: '', method: 'base64' })
        setIsAdding(false)
        loadDbData()
      }
    } catch {}
    setLoading(false)
  }

  const decode = async (textToDecode?: string, methodOverride?: string) => {
    const textValue = textToDecode || input.trim()
    const methodValue = methodOverride || method
    
    if (!textValue) {
      setError('Masukkan teks yang ingin didecode')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/crypto/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textValue, method: methodValue })
      })
      const data = await res.json()
      if (data.success) {
        setOutput(data.result)
        if (!textToDecode) setInput(textValue)
      } else {
        setError(data.error || 'Gagal melakukan decode')
      }
    } catch (e: any) {
      setError('Error koneksi: ' + e.message)
    }
    setLoading(false)
  }

  if (!isVerified) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="admin-card" style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>Akses Terbatas</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>
            Alat ini memerlukan kode akses dari <strong>Owner</strong> untuk digunakan oleh Admin.
          </p>
          <input 
            className="input" 
            type="text" 
            placeholder="Masukkan Kode Akses..." 
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px', fontWeight: 700, marginBottom: '16px' }}
          />
          {verifyError && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>{verifyError}</p>}
          <button 
            className="btn btn-primary" 
            onClick={handleVerifyCode}
            disabled={verifying || !accessCode}
            style={{ width: '100%', height: '50px' }}
          >
            {verifying ? 'Memverifikasi...' : 'Buka Akses'}
          </button>
          <Link href="/admin" style={{ display: 'block', marginTop: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Kembali ke Panel Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header / Info Section */}
        <div className="admin-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(0,229,255,0.15)', filter: 'blur(50px)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,229,255,0.25)', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,229,255,0.2)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: '#fff', letterSpacing: '-0.5px' }}>Crypto Decoder</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
                Tool eksklusif tingkat dewa untuk <strong>Owner</strong>. Digunakan untuk mendekripsi <em>(decode)</em> token keamanan, payload API, atau teks yang disandikan. Berguna untuk <em>debugging</em> otentikasi JWT, membaca data Hex, atau menganalisis ancaman injeksi script <em>(XSS)</em>.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '10px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', fontWeight: 800, letterSpacing: '0.5px' }}>OWNER PRIVILEGE</span>
                <span style={{ fontSize: '10px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(168,85,247,0.1)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.2)', fontWeight: 800, letterSpacing: '0.5px' }}>TOOLS KEAMANAN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decoder Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          {/* Input Area */}
          <div className="admin-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Teks Enkripsi / Cipher
              </div>
              
              {/* Method Selector & Button */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                  <select 
                    className="input" 
                    value={method} 
                    onChange={e => setMethod(e.target.value)}
                    style={{ height: '36px', background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', padding: '0 30px 0 16px', outline: 'none' }}
                  >
                    <option value="base64">Base64 Decode</option>
                    <option value="hex">Hex Decode</option>
                    <option value="jwt">JWT Decode (Header & Payload)</option>
                    <option value="url">URL Decode (%20)</option>
                    <option value="html">HTML Entity Decode (&amp;lt;)</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => decode()}
                  disabled={loading || !input.trim()}
                  style={{ padding: '0 24px', height: '46px', borderRadius: '12px', fontSize: '13px', background: 'linear-gradient(135deg, #00B8D4, #00E5FF)', color: '#000', boxShadow: '0 6px 16px rgba(0,229,255,0.25)' }}
                >
                  {loading ? <span className="spin" style={{ marginRight: '6px' }}>⚙️</span> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: '6px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  DECODE SEKARANG
                </button>
              </div>
            </div>

            <textarea 
              className="input" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tempel teks sandi, token JWT, payload hex, atau kode enkripsi di sini..."
              rows={5}
              style={{ fontFamily: '"Fira Code", monospace', fontSize: '13px', resize: 'vertical', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', lineHeight: 1.5, color: '#00E5FF' }}
              spellCheck={false}
            />
            
            {error && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#F87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
          </div>

          {/* Output Area */}
          {output && (
            <div className="admin-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Hasil Dekripsi (Plain Text)
                </div>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => navigator.clipboard.writeText(output)}
                  style={{ gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Salin Hasil
                </button>
              </div>
              <pre style={{ 
                background: 'rgba(0,0,0,0.4)', 
                padding: '20px', 
                borderRadius: '12px', 
                fontSize: '13px', 
                whiteSpace: 'pre-wrap', 
                fontFamily: '"Fira Code", monospace',
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid rgba(16,185,129,0.2)',
                color: '#fff',
                lineHeight: 1.6
              }}>
                {output}
              </pre>
            </div>
          )}

        </div>

        {/* Saved Tokens Database */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              Brankas Token & Kunci
            </div>
            <button className={`btn btn-sm ${isAdding ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setIsAdding(!isAdding)} style={{ borderRadius: '10px' }}>
              {isAdding ? 'Batal Tambah' : '+ Simpan Kunci Baru'}
            </button>
          </div>

          {isAdding && (
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(168,85,247,0.3)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#C084FC', fontWeight: 700 }}>Simpan Teks Enkripsi ke Database</h4>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase' }}>Nama / Deskripsi</label>
                <input className="input" placeholder="Contoh: Token API Midtrans Prod" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} style={{ height: '40px', background: 'rgba(0,0,0,0.2)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase' }}>Cipher Text / Token</label>
                <textarea className="input" placeholder="eyJhbGciOiJIUzI1NiIsInR..." value={newItem.text} onChange={e => setNewItem({...newItem, text: e.target.value})} rows={3} style={{ background: 'rgba(0,0,0,0.2)' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase' }}>Algoritma</label>
                  <select className="input" value={newItem.method} onChange={e => setNewItem({...newItem, method: e.target.value})} style={{ height: '40px', background: 'rgba(0,0,0,0.2)' }}>
                    <option value="base64">Base64</option>
                    <option value="hex">Hexadecimal</option>
                    <option value="jwt">JSON Web Token (JWT)</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={addData} disabled={loading || !newItem.title || !newItem.text} style={{ height: '40px', background: '#A855F7' }}>
                  Simpan Kunci
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: '12px' }}>
            {dbData.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '32px', opacity: 0.5, marginBottom: '10px' }}>🗄️</div>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Brankas kosong. Belum ada data sandi tersimpan.</p>
              </div>
            ) : dbData.map(item => (
              <div key={item.id} style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, letterSpacing: '0.5px' }}>{item.method.toUpperCase()}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => { setInput(item.encrypted_text); setMethod(item.method); decode(item.encrypted_text, item.method); }}
                  style={{ gap: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Load & Decode
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '10px' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Kembali ke Panel Admin
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
