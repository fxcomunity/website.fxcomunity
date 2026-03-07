'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Row = Record<string, any>

const EXAMPLES = [
  { label: 'Tampilkan banner aktif', sql: 'SELECT * FROM vw_active_banners ORDER BY priority DESC' },
  { label: 'Nonaktifkan banner id=1', sql: 'UPDATE event_banners SET is_active=false WHERE id=1' },
  { label: 'Ubah prioritas id=1', sql: 'UPDATE event_banners SET priority=50 WHERE id=1' },
  { label: 'Hapus banner id=1', sql: 'DELETE FROM event_banners WHERE id=1' },
]

export default function BannerSqlEditor() {
  const [sql, setSql] = useState(EXAMPLES[0].sql)
  const [rows, setRows] = useState<Row[]>([])
  const [rowCount, setRowCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Gagal menjalankan SQL')
        setRows([])
        setRowCount(0)
      } else {
        setRows(data.rows || [])
        setRowCount(data.rowCount || 0)
      }
    } catch {
      setError('Koneksi gagal')
      setRows([])
      setRowCount(0)
    } finally {
      setLoading(false)
    }
  }

  const headers = rows.length ? Object.keys(rows[0]) : []

  return (
    <div>
      <header style={{ background: 'rgba(10,10,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛠️</span>
          <h1 style={{ fontSize: 18, fontWeight: 800 }}>SQL Editor — Banners</h1>
        </div>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secondary btn-sm">← Admin</button>
        </Link>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <select value={sql} onChange={e => setSql(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
              {EXAMPLES.map((ex, i) => (
                <option key={i} value={ex.sql}>{ex.label}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => setSql(EXAMPLES[0].sql)}>Reset</button>
          </div>
          <textarea
            value={sql}
            onChange={e => setSql(e.target.value)}
            placeholder="Tulis perintah SQL untuk event_banners / vw_active_banners"
            style={{ width: '100%', minHeight: 140, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: 12, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={run} disabled={loading}>{loading ? <><span className="spin">⚙️</span> Menjalankan...</> : '▶ Jalankan'}</button>
            <button className="btn btn-secondary" onClick={() => { setRows([]); setRowCount(0); setError('') }}>Bersihkan</button>
          </div>
          {error && (
            <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 13 }}>⚠️ {error}</div>
          )}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>Hasil ({rowCount})</h2>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Tabel: event_banners / vw_active_banners</span>
          </div>
          {rows.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Tidak ada hasil</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {headers.map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.12)', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {headers.map(h => (
                        <td key={h} style={{ padding: '8px 10px', fontSize: 13 }}>{String(r[h] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
