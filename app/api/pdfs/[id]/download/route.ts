import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    await query('UPDATE pdfs SET downloads=downloads+1 WHERE id=$1', [id])
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    if (user) await query('INSERT INTO user_downloads (user_id,pdf_id) VALUES ($1,$2)', [user.id, id])
    // Also increment view
    await query('UPDATE pdfs SET views=views+1 WHERE id=$1', [id])
    return NextResponse.redirect(new URL(`/api/pdfs/${id}/view`, req.url))
  } catch (e) { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
