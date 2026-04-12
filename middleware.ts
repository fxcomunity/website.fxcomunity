import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// ─── Rate limiting store (in-memory, per IP) ───────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT   = 80   // max requests per window
const RATE_WINDOW  = 60_000 // 1 minute
const BURST_LIMIT  = 20   // max requests per 5 second burst
const BURST_WINDOW = 5_000

const burstMap = new Map<string, { count: number; resetAt: number }>()

// Simple cleanup to avoid memory leaks on long-running servers
let lastCleanup = Date.now()
function maybeCleanup() {
  if (Date.now() - lastCleanup < 120_000) return
  lastCleanup = Date.now()
  const now = Date.now()
  for (const [k, v] of rateMap)  { if (v.resetAt < now) rateMap.delete(k) }
  for (const [k, v] of burstMap) { if (v.resetAt < now) burstMap.delete(k) }
}

function isRateLimited(ip: string): boolean {
  maybeCleanup()
  const now = Date.now()

  // Per-minute window
  let entry = rateMap.get(ip)
  if (!entry || entry.resetAt < now) { entry = { count: 0, resetAt: now + RATE_WINDOW }; rateMap.set(ip, entry) }
  entry.count++
  if (entry.count > RATE_LIMIT) return true

  // Per-5s burst window
  let burst = burstMap.get(ip)
  if (!burst || burst.resetAt < now) { burst = { count: 0, resetAt: now + BURST_WINDOW }; burstMap.set(ip, burst) }
  burst.count++
  if (burst.count > BURST_LIMIT) return true

  return false
}

// ─── SQL injection pattern detector ────────────────────────────────────────
const SQL_PATTERNS = [
  /(\b(select|insert|update|delete|drop|create|alter|truncate|exec|execute|union|cast|convert)\b)/i,
  /(--|\/\*|\*\/|;|\bxp_|\bsp_)/i,
  /('\s*(or|and)\s*'?\d+'?\s*=\s*'?\d+'?)/i,
  /('\s*(or|and)\s+\d+\s*=\s*\d+)/i,
  /(0x[0-9a-fA-F]+)/,
  /(\bwaitfor\b|\bsleep\b|\bpg_sleep\b)/i,
]

function hasSQLInjection(value: string): boolean {
  return SQL_PATTERNS.some(p => p.test(value))
}

function checkRequestForInjection(req: NextRequest): boolean {
  // Check query params
  for (const [, val] of req.nextUrl.searchParams.entries()) {
    if (hasSQLInjection(val)) return true
  }
  // Check URL path
  if (hasSQLInjection(decodeURIComponent(req.nextUrl.pathname))) return true
  return false
}

// ─── Security response headers ──────────────────────────────────────────────
function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
}

// ─── JWT verify ─────────────────────────────────────────────────────────────
const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/reset-password',
  '/api/auth/login', '/api/auth/register', '/api/auth/request-otp', '/api/auth/reset-password',
  '/api/pdfs', '/api/stats', '/api/music', '/api/banners', '/api/init']

async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fxcomunity-dev-secret')
    const { payload } = await jwtVerify(token, secret)
    return payload as { id: number; username: string; email: string; role: string }
  } catch { return null }
}

// ─── Main middleware ─────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
         || req.headers.get('x-real-ip')
         || '127.0.0.1'

  // 1. DDoS / Rate limiting — only on API routes
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Terlalu banyak permintaan. Coba lagi sebentar.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT),
          }
        }
      )
    }
  }

  // 2. SQL Injection guard — block obviously malicious URLs/params
  if (checkRequestForInjection(req)) {
    const isApi = pathname.startsWith('/api/')
    if (isApi) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Permintaan tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 3. Auth guard
  if (PUBLIC.some(p => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)) || pathname.startsWith('/api/auth/'))) {
    return addSecurityHeaders(NextResponse.next())
  }

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

  return addSecurityHeaders(NextResponse.next())
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
