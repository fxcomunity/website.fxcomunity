import { query } from '@/lib/db'

async function pickExistingColumn<T extends string>(candidates: T[]): Promise<T | null> {
  for (const c of candidates) {
    try {
      await query(`SELECT "${c}" FROM otp_resets LIMIT 1`)
      return c
    } catch {}
  }
  return null
}

export async function getOtpContactColumn(): Promise<'email' | 'contact'> {
  const c = await pickExistingColumn(['email', 'contact'])
  return (c || 'email') as 'email' | 'contact'
}

export async function getOtpTypeColumn(): Promise<'otp_type' | 'type' | null> {
  const c = await pickExistingColumn(['otp_type', 'type'])
  return c as 'otp_type' | 'type' | null
}

export async function getOtpAttemptColumn(): Promise<'attempt' | 'attempt_count' | null> {
  const c = await pickExistingColumn(['attempt', 'attempt_count'])
  return c as 'attempt' | 'attempt_count' | null
}

export function quoteColumn(column: 'email' | 'contact' | 'otp_type' | 'type' | 'attempt' | 'attempt_count') {
  return `"${column}"`
}
