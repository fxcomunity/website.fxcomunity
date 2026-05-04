# FX Community — Platform Edukasi Trading

Platform edukasi trading berbasis web dengan sistem auth lengkap, library PDF, musik, dan komunitas.

## Fitur Terbaru

### UI & UX
- **Optimistic Like (Live Technique)**: Klik favorit → UI langsung update, lalu sync ke storage secara non-blocking
- **QR Code Share**: Modal share PDF kini menampilkan QR Code yang bisa di-scan langsung
- **Mobile Layout**: Grid PDF card 3-tombol aksi yang sinkron di semua ukuran layar
- **Navigasi Bersih**: Menu tanpa item redundan (Favorites & Hubungi Kami dipindah ke modal)

### Keamanan & Admin
- **Role-Based Access**: Owner dapat mengubah jabatan user (Admin/User) + notifikasi otomatis
- **Admin Access Code**: Fitur "Decoder Kripto" memerlukan kode akses dari Owner (dengan waktu kedaluwarsa)
- **IP Ban & Approval**: Blokir IP mencurigakan saat registrasi; Owner dapat approve unban
- **Log Aktivitas**: Pantau semua tindakan sensitif di platform

### Auth & Email
- **OTP Verifikasi Email** + Reset Password
- **Email Template Premium**: Desain glassmorphic profesional
- **JWT Cookie Auth**: Secure HttpOnly cookie

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | PostgreSQL (Neon Serverless) |
| Auth | bcryptjs + JWT (jose) |
| Email | Nodemailer (Gmail OTP) |
| UI | Vanilla CSS + Lucide Icons + qrcode.react |

## Setup Lokal

```bash
npm install
cp .env.example .env.local
# Edit .env.local dengan credentials kamu
npm run dev
```

## ENV Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=secret-panjang-min-32-karakter
GMAIL_USER=email@gmail.com
GMAIL_PASS=app-password-gmail
NEXT_PUBLIC_BASE_URL=https://domain-kamu.vercel.app
```

## Init Database (1x setelah deploy)

```
GET /api/init
```

Membuat semua tabel + seed owner default: `owner@fxcomunity.com` / `owner123`

## Halaman

| Path | Deskripsi |
|---|---|
| `/login` | Login & Portal Auth |
| `/register` | Daftar akun baru |
| `/verify-email` | Verifikasi OTP |
| `/forgot-password` | Reset password via OTP |
| `/library` | Perpustakaan PDF (butuh login) |
| `/music` | Player musik komunitas |
| `/popular` | PDF paling populer |
| `/dashboard` | Dashboard user |
| `/profile` | Edit profil |
| `/report` | Kirim laporan/bug |
| `/admin` | Panel Admin & Owner |
| `/crypto` | Decoder Kripto (eksklusif) |

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di Vercel
3. Set semua ENV variables
4. Deploy
5. Buka `https://domain.vercel.app/api/init`
