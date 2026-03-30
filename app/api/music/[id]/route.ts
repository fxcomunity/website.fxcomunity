import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

// DELETE — hapus lagu (admin/owner only)
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = getToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await verifyToken(token)
  if (!user || !['Owner', 'Admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await context.params
  try {
    await query('DELETE FROM songs WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH — increment play count
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    await query('UPDATE songs SET play_count = play_count + 1 WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ success: false }) }
}
