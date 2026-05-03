import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ hasAccess: false })
    }

    // Owner selalu punya akses
    if (auth.role === 'Owner') {
      return NextResponse.json({ hasAccess: true, isOwner: true })
    }

    // Ambil tool dari query params
    const { searchParams } = new URL(req.url)
    const tool = searchParams.get('tool')
    
    if (!tool) {
      return NextResponse.json({ hasAccess: false })
    }

    // Cek cookie
    const cookieName = `access_${tool}`
    const hasCookie = req.cookies.has(cookieName)

    return NextResponse.json({ hasAccess: hasCookie, isOwner: false })
  } catch (error) {
    return NextResponse.json({ hasAccess: false })
  }
}
