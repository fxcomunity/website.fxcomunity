import { NextRequest, NextResponse } from 'next/server'
import { query, logActivity } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { resetIPBan } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
    try {
        const currentUser = await verifyAuth(req)
        if (!currentUser || currentUser.role !== 'Owner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { userId, whitelistIP } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Get user details
        const userResult = await query('SELECT username, status FROM users WHERE id = $1', [userId])
        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const user = userResult.rows[0]
        
        // Update status to Aktif
        await query('UPDATE users SET status = \'Aktif\' WHERE id = $1', [userId])

        // If whitelistIP is true, find the IP from activity logs or otp_resets and reset it
        if (whitelistIP) {
            const ipResult = await query(
                'SELECT ip_address FROM otp_resets WHERE email = (SELECT email FROM users WHERE id = $1) ORDER BY created_at DESC LIMIT 1',
                [userId]
            )
            if (ipResult.rows.length > 0) {
                const ip = ipResult.rows[0].ip_address
                await resetIPBan(ip)
                console.log(`[APPROVE_USER] IP ${ip} whitelisted for user ${user.username}`)
            }
        }

        await logActivity(
            currentUser.id,
            'APPROVE_BANNED_USER',
            'User',
            userId,
            `Approved banned user ${user.username}`,
            req
        )

        return NextResponse.json({
            success: true,
            message: `Akun ${user.username} berhasil diaktifkan.`
        })

    } catch (e) {
        console.error('[APPROVE_USER] Error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
