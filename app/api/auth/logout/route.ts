import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', req.url))
  res.cookies.delete('token')
  return res
}
