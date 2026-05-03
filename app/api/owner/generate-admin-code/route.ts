import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req)
        if (!user || user.role !== 'Owner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { targetTool, expiresInHours } = body

        if (!targetTool) {
            return NextResponse.json({ error: 'Target tool is required' }, { status: 400 })
        }

        // Generate a secure random code
        const code = crypto.randomBytes(16).toString('hex').toUpperCase()
        
        // Expiration time (default 24h)
        const hours = expiresInHours || 24
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)

        const result = await query(
            'INSERT INTO admin_access_codes (code, target_tool, expires_at, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [code, targetTool, expiresAt, user.id]
        )

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        })

    } catch (e) {
        console.error('[GENERATE_ADMIN_CODE] Error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req)
        if (!user || user.role !== 'Owner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const result = await query(
            'SELECT a.*, u.username as creator FROM admin_access_codes a JOIN users u ON a.created_by = u.id ORDER BY a.created_at DESC'
        )

        return NextResponse.json({
            success: true,
            data: result.rows
        })

    } catch (e) {
        console.error('[GET_ADMIN_CODES] Error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
