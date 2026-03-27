import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const session = await getCurrentUser()
  if (!session) {
    return NextResponse.json({ success: false, data: [] })
  }

  try {
    // Get notifications for this user (both specific and global)
    const res = await query(
      'SELECT * FROM notifications WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC LIMIT 50',
      [session.id]
    )
    return NextResponse.json({ success: true, data: res.rows })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: 'DB Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getCurrentUser()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 })

  try {
    // Mark as read (ensure user only marks their own OR global)
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)',
      [id, session.id]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, message: 'DB Error' }, { status: 500 })
  }
}
