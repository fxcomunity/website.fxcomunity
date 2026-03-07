import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/reset-password',
  '/api/auth/login', '/api/auth/register', '/api/auth/request-otp', '/api/auth/reset-password', '/api/init',
  '/api/pdfs', '/api/stats', '/api/music', '/api/banners']

async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fxcomunity-dev-secret'
    )
    const { payload } = await jwtVerify(token, secret)
    return payload as { id: number; username: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.some(p => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)) || pathname.startsWith('/api/auth/'))) return NextResponse.next()
  if (pathname.startsWith('/api/') || pathname.startsWith('/library') || pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    const token = req.cookies.get('token')?.value
    if (!token) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const user = await verifyJWT(token)
    if (!user) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const res = NextResponse.redirect(new URL('/login', req.url))
      res.cookies.delete('token')
      return res
    }
    if (pathname.startsWith('/admin') && !['Owner', 'Admin'].includes(user.role)) {
      return NextResponse.redirect(new URL('/library', req.url))
    }
  }
  return NextResponse.next()
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
