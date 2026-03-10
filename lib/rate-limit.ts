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
}

/**
 * Cek apakah request diizinkan berdasarkan rate limiting
 * @param identifier - Identifier unik (biasanya IP address)
 * @param type - Tipe rate limit (login, register, otp, general)
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

export default { checkRateLimit, resetRateLimit, getRateLimitStatus };

