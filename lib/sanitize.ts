/**
 * Input sanitization utilities for FXCommunity API routes.
 * Use these helpers to validate and clean user-supplied data
 * before passing it into any database query.
 */

/** Strip HTML tags and trim whitespace */
export function sanitizeString(value: unknown, maxLen = 2000): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')         // strip HTML
    .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .slice(0, maxLen)
}

/** Validate an integer ID — returns null if invalid */
export function sanitizeId(value: unknown): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255
}

/** Allowed category values */
const ALLOWED_CATEGORIES = ['fx-basic', 'fx-advanced', 'fx-technical', 'fx-psychology', 'publik']
export function sanitizeCategory(cat: unknown): string {
  if (typeof cat !== 'string') return 'fx-basic'
  return ALLOWED_CATEGORIES.includes(cat) ? cat : 'fx-basic'
}

/** Detect SQL injection patterns in a string */
const SQL_PATTERNS = [
  /(\b(select|insert|update|delete|drop|create|alter|truncate|exec|execute|union|cast|convert)\b)/i,
  /(--|\/\*|\*\/|;\s|'\s*(or|and)\s)/i,
  /(\bwaitfor\b|\bsleep\b|\bpg_sleep\b)/i,
  /(0x[0-9a-fA-F]{2,})/,
]
export function hasSQLInjection(value: string): boolean {
  return SQL_PATTERNS.some(p => p.test(value))
}

/** Check all string fields in an object for SQL injection */
export function objectHasSQLInjection(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(
    v => typeof v === 'string' && hasSQLInjection(v)
  )
}
