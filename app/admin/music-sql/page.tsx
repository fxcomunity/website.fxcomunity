'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../admin.css' // Reuse the existing admin styles

type QueryResult = {
  rows: any[]
  rowCount: number
  fields: { name: string }[]
}

const Ico = ({ d, size = 17 }: { d: string | string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((path, i) => <path key={i} d={path} />)}
  </svg>
)

export default function MusicSQLPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [sql, setSql] = useState("SELECT * FROM songs WHERE status = 'active' ORDER BY uploaded_at DESC LIMIT 5;")
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.data || !['Owner', 'Admin'].includes(d.data.role)) {
        // Redirect non-admins/owners
        router.push('/admin')
      } else {
        setMe(d.data)
        setLoading(false)
      }
    }).catch(() => router.push('/login'))
  }, [router])

  const executeQuery = async () => {
    setExecuting(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/music-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResult(data)
      } else {
        setError(data.error || 'An unknown error occurred.')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to connect to the API.')
    } finally {
      setExecuting(false)
    }
  }

  if (loading || !me) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
          <div>
            <h1 className="grad-text" style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Music SQL Runner</h1>
            <p style={{ color: 'var(--text3)', margin: '0', fontSize: '14px' }}>
              Execute read/write queries on the music database. (<span style={{ color: '#F87171', fontWeight: 'bold' }}>Admin/Owner Access Only</span>)
            </p>
          </div>
          <Link href="/admin" className="btn btn-secondary">
            ← Back to Admin Panel
          </Link>
        </div>

        {/* SQL Input Area */}
        <div className="admin-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <label className="admin-field-label">SQL Query</label>
          <textarea
            className="input"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={6}
            style={{ fontFamily: 'monospace', fontSize: '14px', resize: 'vertical' }}
            placeholder="e.g., SELECT * FROM songs LIMIT 10;"
          />
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text3)', margin: 0 }}>
              Allowed tables: `songs`, `genres`, `song_genres`.
            </p>
            <button className="btn btn-primary" onClick={executeQuery} disabled={executing}>
              {executing ? <><span className="loader-sm" style={{ marginRight: '8px' }}></span> Executing...</> : '▶️ Run Query'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="admin-card" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
            <h3 style={{ color: '#F87171', margin: '0 0 10px 0' }}>Error Executing Query</h3>
            <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', color: '#ffc1c1', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {error}
            </pre>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="admin-card" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--text)', margin: '0 0 15px 0' }}>
              Query Result <span style={{ color: 'var(--text3)', fontWeight: 'normal' }}>({result.rowCount} row{result.rowCount === 1 ? '' : 's'} returned)</span>
            </h3>
            {result.rows.length > 0 ? (
              <div style={{ overflowX: 'auto' }} className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {result.fields.map(field => (
                        <th key={field.name}>{field.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {result.fields.map(field => {
                          const cellData = row[field.name];
                          let displayData: React.ReactNode;

                          if (cellData === null) {
                            displayData = <span style={{ color: 'var(--text3)' }}>NULL</span>;
                          } else if (typeof cellData === 'object') {
                            displayData = JSON.stringify(cellData);
                          } else {
                            displayData = String(cellData);
                          }

                          return (
                            <td key={field.name} title={String(cellData)}>
                              <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {displayData}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty" style={{ padding: '30px' }}>
                <div className="admin-empty-icon" style={{ width: '50px', height: '50px', fontSize: '24px' }}>🔎</div>
                <h4>Query Executed Successfully</h4>
                <p>No rows were returned for this query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
