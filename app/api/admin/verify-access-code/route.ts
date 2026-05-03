import { NextRequest, NextResponse } from 'next/server'
import { query, logActivity } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { code, targetTool } = body

        if (!code || !targetTool) {
            return NextResponse.json({ error: 'Code and target tool are required' }, { status: 400 })
        }

        // Check if code exists, matches tool, is not used, and not expired
        const result = await query(
            `SELECT * FROM admin_access_codes 
             WHERE code = $1 
             AND target_tool = $2 
             AND is_used = FALSE 
             AND expires_at > NOW()`,
            [code, targetTool]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Kode tidak valid, sudah digunakan, atau telah kedaluwarsa' }, { status: 400 })
        }

        const accessCode = result.rows[0]

        // Mark code as used
        await query(
            'UPDATE admin_access_codes SET is_used = TRUE, used_by = $1 WHERE id = $2',
            [user.id, accessCode.id]
        )

        await logActivity(
            user.id,
            'USE_ACCESS_CODE',
            'AdminTool',
            targetTool,
            `User ${user.username} used access code for ${targetTool}`,
            req
        )

        return NextResponse.json({
            success: true,
            message: 'Akses diberikan'
        })

    } catch (e) {
        console.error('[VERIFY_ACCESS_CODE] Error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
