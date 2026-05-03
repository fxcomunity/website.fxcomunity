import { NextRequest, NextResponse } from 'next/server'
import { query, logActivity } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
    try {
        const currentUser = await verifyAuth(req)
        if (!currentUser || currentUser.role !== 'Owner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { userId, newRole } = body

        if (!userId || !newRole) {
            return NextResponse.json({ error: 'User ID and New Role are required' }, { status: 400 })
        }

        if (!['Admin', 'User'].includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        // Get target user current role
        const targetUser = await query('SELECT role, username FROM users WHERE id = $1', [userId])
        if (targetUser.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const oldRole = targetUser.rows[0].role
        const username = targetUser.rows[0].username

        // Update role
        await query('UPDATE users SET role = $1 WHERE id = $2', [newRole, userId])

        // Add notification if promoted to Admin
        if (newRole === 'Admin' && oldRole === 'User') {
            await query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
                [userId, 'Promosi Jabatan', 'Selamat! Anda telah dipromosikan menjadi Admin oleh Owner.', 'success']
            )
        }

        // Log activity
        await logActivity(
            currentUser.id,
            'CHANGE_USER_ROLE',
            'User',
            userId,
            `Changed role of ${username} from ${oldRole} to ${newRole}`,
            req
        )

        return NextResponse.json({
            success: true,
            message: `Role ${username} berhasil diubah menjadi ${newRole}`
        })

    } catch (e) {
        console.error('[CHANGE_USER_ROLE] Error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
