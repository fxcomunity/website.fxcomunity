import { NextRequest, NextResponse } from 'next/server'
import { getToken, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    
    if (!user || user.role !== 'Owner') {
      return NextResponse.json({ error: 'Owner only access' }, { status: 403 })
    }

    const { text, method } = await req.json()

    let result = ''

    switch (method) {
      case 'base64':
        try {
          result = atob(text)
        } catch {
          return NextResponse.json({ error: 'Invalid Base64' }, { status: 400 })
        }
        break

      case 'hex':
        try {
          const bytes = new Uint8Array(text.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
          result = new TextDecoder().decode(bytes)
        } catch {
          return NextResponse.json({ error: 'Invalid Hex' }, { status: 400 })
        }
        break

      case 'jwt':
        try {
          // Simple JWT payload extract (base64 decode)
          const payload = text.split('.')[1]
          if (!payload) throw new Error()
          result = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        } catch {
          return NextResponse.json({ error: 'Invalid JWT' }, { status: 400 })
        }
        break

      case 'url':
        result = decodeURIComponent(text)
        break

      case 'html':
        result = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        break

      default:
        return NextResponse.json({ error: 'Unknown method' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('Crypto decode error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
