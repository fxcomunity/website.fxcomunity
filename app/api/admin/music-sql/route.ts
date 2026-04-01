import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getToken, verifyToken } from '@/lib/auth'

// Security for the Music SQL Runner
// We are more permissive here than for banners, as music management is more complex.

// Allow basic SELECT, INSERT, UPDATE, DELETE statements
const ALLOWED_STARTS = [
  /^select\s+/i,
  /^insert\s+into\s+(songs|song_genres)\s+/i,
  /^update\s+(songs|song_genres)\s+/i,
  /^delete\s+from\s+(songs|song_genres)\s+/i,
]

// Blacklist highly destructive or schema-altering commands
const FORBIDDEN_PATTERNS = /\b(drop|alter|truncate|create\s+(table|view|function|trigger|index)|grant|revoke)\b/i

// Allow queries that mention these tables. This is a simple check.
const ALLOWED_TABLES_REGEX = /\b(songs|genres|song_genres|users)\b/i

function isMusicQueryAllowed(sql: string): boolean {
  const s = sql.trim()

  // Rule 1: Check for forbidden keywords (e.g., DROP, ALTER)
  if (FORBIDDEN_PATTERNS.test(s)) {
    console.warn(`SQL-Runner-Music: Blocked forbidden pattern: ${s}`)
    return false
  }

  // Rule 2: Check if the query starts with an allowed operation (SELECT, INSERT, etc.)
  const isStartAllowed = ALLOWED_STARTS.some(r => r.test(s))
  if (!isStartAllowed) {
    console.warn(`SQL-Runner-Music: Blocked due to invalid start: ${s}`)
    return false
  }

  // Rule 3: Check if it operates on allowed tables.
  // This is a safety net; it's not foolproof but prevents accidental queries on unrelated tables.
  if (!ALLOWED_TABLES_REGEX.test(s)) {
    console.warn(`SQL-Runner-Music: Blocked, no allowed tables found: ${s}`)
    return false
  }

  // If all checks pass
  return true
}

export async function POST(req: NextRequest) {
  try {
    const token = getToken(req)
    const user = token ? await verifyToken(token) : null
    // Only Owner/Admin should have access to this powerful tool.
    if (!user || !['Owner', 'Admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to use the SQL runner.' }, { status: 403 })
    }

    const body = await req.json()
    const sql = String(body.sql || '')

    if (!sql.trim()) {
      return NextResponse.json({ error: 'SQL query cannot be empty.' }, { status: 400 })
    }

    if (!isMusicQueryAllowed(sql)) {
      return NextResponse.json({ error: 'The provided SQL query is not allowed for security reasons.' }, { status: 400 })
    }

    const result = await query(sql)

    // The 'query' function can return different shapes, so we standardize the output
    const rows = result.rows || []
    const rowCount = result.rowCount ?? rows.length
    const fields = result.fields || []

    return NextResponse.json({ success: true, rows, rowCount, fields })

  } catch (e: any) {
    console.error('Music SQL Runner Error:', e)
    // Provide the actual database error message to the admin for debugging
    return NextResponse.json({ error: e.message || 'A server error occurred.' }, { status: 500 })
  }
}
