import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, getToken } from '@/lib/auth'

export async function GET() {
    try {
        const res = await query('SELECT * FROM settings')
        const settings = res.rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {})
        return NextResponse.json({ success: true, data: settings })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed fetching settings' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = getToken(req)
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const user = await verifyToken(token)
        if (!user || !['Owner', 'Admin'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { key, value } = await req.json()
        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 })
        }

        await query(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES ($1, $2, NOW()) 
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, value.toString()])

        return NextResponse.json({ success: true, message: 'Settings updated' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
