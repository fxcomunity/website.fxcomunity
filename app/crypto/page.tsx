'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User { role: string }

export default function CryptoDecryptPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
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
      if (d?.data && d.data.role === 'Owner') {
        setUser(d.data)
        loadDbData()
      } else {
        router.push('/dashboard')
      }
    }).catch(() => router.push('/login'))
  }, [router])

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
      setError('Masukkan teks yang mau di decode')
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
        setError(data.error || 'Gagal decode')
      }
    } catch (e: any) {
      setError('Error: ' + e.message)
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spin" style={{ fontSize: '48px' }}>🔓</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: 'rgba(10,10,26,0.95)', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid var(--border)', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔓</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Crypto Decoder</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Tool decode Base64, Hex, JWT untuk Owner</p>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text3)' }}>
            Owner only: <strong>{user.role}</strong>
          </div>
        </div>

        {/* Input */}
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px' }}>
                Method Decode
              </label>
              <select 
                className="input" 
                value={method} 
                onChange={e => setMethod(e.target.value)}
                style={{ padding: '12px 16px' }}
              >
                <option value="base64">Base64 Decode</option>
                <option value="hex">Hex Decode</option>
                <option value="jwt">JWT Decode</option>
                <option value="url">URL Decode</option>
                <option value="html">HTML Decode</option>
              </select>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => decode()}
              disabled={loading || !input.trim()}
              style={{ whiteSpace: 'nowrap', padding: '12px 24px' }}
            >
              {loading ? <span className="spin">🔄</span> : '🔓 DECODE'}
            </button>
          </div>
          
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>
            Encrypted Text / Token
          </label>
          <textarea 
            className="input" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste crypt/base64/JWT/token di sini..."
            rows={4}
            style={{ fontFamily: 'monospace', resize: 'vertical' }}
          />
          
          {error && (
            <div style={{ 
              padding: '12px', 
              background: 'rgba(255,70,80,0.15)', 
              border: '1px solid rgba(255,70,80,0.3)', 
              borderRadius: '8px', 
              color: '#f87171', 
              fontSize: '13px', 
              marginTop: '12px' 
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Database List */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Data dari Neontech</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? '✖ Tutup' : '➕ Tambah Data'}
            </button>
          </div>

          {isAdding && (
            <div className="card" style={{ padding: '20px', marginBottom: '20px', border: '1px solid var(--primary)' }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <input 
                  className="input" 
                  placeholder="Judul Data (contoh: Token API)" 
                  value={newItem.title} 
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                />
                <textarea 
                  className="input" 
                  placeholder="Encrypted Text" 
                  value={newItem.text} 
                  onChange={e => setNewItem({...newItem, text: e.target.value})}
                  rows={3}
                />
                <select className="input" value={newItem.method} onChange={e => setNewItem({...newItem, method: e.target.value})}>
                  <option value="base64">Base64</option>
                  <option value="hex">Hex</option>
                  <option value="jwt">JWT</option>
                </select>
                <button className="btn btn-primary" onClick={addData} disabled={loading}>Simpan ke Database</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: '12px' }}>
            {dbData.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                Belum ada data di database
              </div>
            ) : dbData.map(item => (
              <div key={item.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.method.toUpperCase()} • {new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setInput(item.encrypted_text); setMethod(item.method); decode(item.encrypted_text, item.method); }}>
                  🔓 Decode
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        {output && (
          <div className="card" style={{ padding: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>
              Decoded Result
            </label>
            <pre style={{ 
              background: 'var(--bg3)', 
              padding: '20px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'monospace',
              maxHeight: '400px',
              overflow: 'auto',
              border: '1px solid var(--border2)'
            }}>
              {output}
            </pre>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => navigator.clipboard.writeText(output)}
              >
                📋 Copy Result
              </button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          marginTop: '32px',
          padding: '20px',
          background: 'var(--bg3)',
          borderRadius: '12px'
        }}>
          <a href="/dashboard" className="btn btn-ghost btn-sm">📊 Dashboard</a>
          <a href="/library" className="btn btn-ghost btn-sm">📚 Library</a>
          <a href="/profile" className="btn btn-ghost btn-sm">👤 Profile</a>
          {user.role === 'Owner' && (
            <>
              <a href="/admin" className="btn btn-ghost btn-sm">⚙️ Admin</a>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
