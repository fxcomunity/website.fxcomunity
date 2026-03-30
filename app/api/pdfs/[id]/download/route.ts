import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

// GET: actual file download (auto-download)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const res = await query('SELECT name, url FROM pdfs WHERE id=$1 AND is_active=true', [id])
    if (res.rows.length === 0) return NextResponse.json({ error: 'PDF not found' }, { status: 404 })
    const { url } = res.rows[0]
    await query('UPDATE pdfs SET downloads=downloads+1, views=views+1 WHERE id=$1', [id])
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (user) {
      try { await query('INSERT INTO user_downloads (user_id,pdf_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [user.id, id]) } catch { }
    }
    // Convert Google Drive view URL → direct download URL
    let downloadUrl = url
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`
    return NextResponse.redirect(downloadUrl)
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

// POST: legacy — just increment counter
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    await query('UPDATE pdfs SET downloads=downloads+1 WHERE id=$1', [id])
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (user) await query('INSERT INTO user_downloads (user_id,pdf_id) VALUES ($1,$2)', [user.id, id])
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

