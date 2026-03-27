import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getCurrentUser()
  if (!session || !['Owner', 'Admin'].includes(session.role)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { title, message, type, user_id } = await req.json()

  if (!title || !message) {
    return NextResponse.json({ success: false, message: 'Title and message required' }, { status: 400 })
  }

  try {
    if (user_id === 'all' || !user_id) {
      // Global notification – NULL user_id means broadcast to all
      await query(
        'INSERT INTO notifications (title, message, type, user_id) VALUES ($1, $2, $3, NULL)',
        [title, message, type || 'info']
      )
    } else {
      // Personal notification for a specific user
      await query(
        'INSERT INTO notifications (title, message, type, user_id) VALUES ($1, $2, $3, $4)',
        [title, message, type || 'info', parseInt(user_id as string)]
      )
    }

    return NextResponse.json({ success: true, message: 'Notifikasi berhasil dikirim' })
  } catch (error: any) {
    console.error('Notification send error:', error)
    // Return the actual DB error message so we can debug
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
