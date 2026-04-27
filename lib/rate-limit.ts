import { query } from './db';

// Rate Limiter untuk proteksi DDOS
// Menggunakan in-memory store (untuk production gunakan Redis)

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Konfigurasi rate limit
const CONFIG = {
  // Limit untuk login
  login: {
    maxAttempts: 5,        // Maksimum 5 percobaan
    windowMs: 15 * 60 * 1000, // Dalam 15 menit
    blockDurationMs: 30 * 60 * 1000, // Blokir 30 menit jika melebihi limit
  },
  // Limit untuk register
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 jam
    blockDurationMs: 60 * 60 * 1000, // Blokir 1 jam
  },
  // Limit untuk OTP request
  otp: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 jam
    blockDurationMs: 30 * 60 * 1000,
  },
  // Limit umum
  general: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 menit
    blockDurationMs: 5 * 60 * 1000,
  }
};

export type RateLimitType = 'login' | 'register' | 'otp' | 'general';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  blockedUntil?: number;
  message?: string;
  isPermanent?: boolean;
}

/**
 * Cek apakah IP sedang diblokir di database (untuk login)
 */
export async function checkIPBan(ip: string): Promise<RateLimitResult | null> {
  try {
    const result = await query(
      'SELECT failed_attempts, banned_until, is_permanent FROM banned_ips WHERE ip_address = $1',
      [ip]
    );

    if (result.rows.length === 0) return null;

    const { failed_attempts, banned_until, is_permanent } = result.rows[0];

    if (is_permanent) {
      return {
        success: false,
        remaining: 0,
        resetAt: 0,
        isPermanent: true,
        message: 'IP Anda telah diblokir secara permanen karena terlalu banyak percobaan login yang gagal.'
      };
    }

    if (banned_until && new Date() < new Date(banned_until)) {
      return {
        success: false,
        remaining: 0,
        resetAt: new Date(banned_until).getTime(),
        blockedUntil: new Date(banned_until).getTime(),
        message: `Terlalu banyak percobaan. IP diblokir hingga ${new Date(banned_until).toLocaleString('id-ID')}.`
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking IP ban:', error);
    return null;
  }
}

/**
 * Update percobaan gagal di database
 */
export async function incrementFailedAttempts(ip: string): Promise<void> {
  try {
    // Cari status IP saat ini
    const result = await query(
      'SELECT failed_attempts FROM banned_ips WHERE ip_address = $1',
      [ip]
    );

    let attempts = 1;
    if (result.rows.length > 0) {
      attempts = result.rows[0].failed_attempts + 1;
    }

    let bannedUntil = null;
    let isPermanent = false;

    // Aturan Banning:
    // 5 kali salah -> Ban 1 hari
    // 10 kali salah (5 kali lagi setelah ban 1 hari berakhir) -> Ban Permanen
    if (attempts >= 10) {
      isPermanent = true;
    } else if (attempts === 5) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      bannedUntil = tomorrow;
    }

    await query(
      `INSERT INTO banned_ips (ip_address, failed_attempts, banned_until, is_permanent, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (ip_address) DO UPDATE SET
       failed_attempts = $2,
       banned_until = $3,
       is_permanent = $4,
       updated_at = NOW()`,
      [ip, attempts, bannedUntil, isPermanent]
    );
  } catch (error) {
    console.error('Error incrementing failed attempts:', error);
  }
}

/**
 * Reset percobaan gagal setelah login berhasil
 */
export async function resetIPBan(ip: string): Promise<void> {
  try {
    await query('DELETE FROM banned_ips WHERE ip_address = $1 AND is_permanent = FALSE', [ip]);
  } catch (error) {
    console.error('Error resetting IP ban:', error);
  }
}

/**
 * Cek apakah request diizinkan berdasarkan rate limiting (in-memory)
 */
export function checkRateLimit(identifier: string, type: RateLimitType = 'general'): RateLimitResult {
  const now = Date.now();
  const config = CONFIG[type];
  const key = `${type}:${identifier}`;
  
  let entry = rateLimitStore.get(key);
  
  // Jika tidak ada entry atau sudah expired, buat baru
  if (!entry || now - entry.firstRequest > config.windowMs) {
    entry = {
      count: 0,
      firstRequest: now
    };
    rateLimitStore.delete(key);
  }
  
  // Cek jika sedang diblokir
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
      message: `Terlalu banyak percobaan. Coba lagi setelah ${Math.ceil((entry.blockedUntil - now) / 1000)} detik.`
    };
  }
  
  // Increment counter
  entry.count++;
  
  // Cek apakah melebihi limit
  if (entry.count > config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(key, entry);
    
    return {
      success: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
      message: `Limit tercapai. Akun/IP diblokir sementara selama ${config.blockDurationMs / 60000} menit.`
    };
  }
  
  // Simpan dan return hasil
  rateLimitStore.set(key, entry);
  
  const remaining = Math.max(0, config.maxAttempts - entry.count);
  const resetAt = entry.firstRequest + config.windowMs;
  
  return {
    success: true,
    remaining,
    resetAt
  };
}

/**
 * Reset rate limit untuk identifier tertentu
 */
export function resetRateLimit(identifier: string, type: RateLimitType = 'general'): void {
  const key = `${type}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status tanpa mengupdate counter
 */
export function getRateLimitStatus(identifier: string, type: RateLimitType = 'general'): RateLimitResult {
  const now = Date.now();
  const config = CONFIG[type];
  const key = `${type}:${identifier}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return {
      success: true,
      remaining: config.maxAttempts,
      resetAt: now + config.windowMs
    };
  }
  
  // Jika diblokir
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
      message: `Diblokir hingga ${new Date(entry.blockedUntil).toLocaleTimeString()}`
    };
  }
  
  // Jika sudah expired
  if (now - entry.firstRequest > config.windowMs) {
    return {
      success: true,
      remaining: config.maxAttempts,
      resetAt: now + config.windowMs
    };
  }
  
  return {
    success: true,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetAt: entry.firstRequest + config.windowMs
  };
}

// Cleanup - hapus entries yang expired setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > CONFIG.general.windowMs * 10) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export default { checkRateLimit, resetRateLimit, getRateLimitStatus, checkIPBan, incrementFailedAttempts, resetIPBan };
