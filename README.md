# 📚 FX Comunity — WebsiteBaru (Full Stack)

Clone lengkap dari WebsiteBaru dengan sistem auth database penuh.

## Tech Stack
- Next.js 14 App Router + TypeScript
- PostgreSQL (Neon/Supabase)
- bcryptjs + JWT cookies
- Nodemailer (Gmail OTP)

## Setup

```bash
npm install
cp .env.example .env.local
# Isi semua ENV variables
npm run dev
```

## ENV Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=secret-panjang-min-32-karakter
GMAIL_USER=email@gmail.com
GMAIL_PASS=app-password-gmail
NEXT_PUBLIC_BASE_URL=https://domain-kamu.vercel.app
```

## Init Database (jalankan 1x setelah deploy)
```
GET /api/init
```
Ini akan:
- Buat semua tabel (users, pdfs, otp_resets, dll)
- Seed 38 PDF data
- Buat akun owner default: owner@fxcomunity.com / owner123

## Contoh .env.local (lokal)

Salin ` .env.example ` ke `.env.local` lalu sesuaikan nilai-nilainya. Contoh minimal:

```bash
cp .env.example .env.local
# lalu edit .env.local dan isi DATABASE_URL
```

Contoh isi (singkat):

```env
DATABASE_URL=postgresql://user:password@db-host:5432/dbname
DATABASE_SSL=true
JWT_SECRET=isi_rahasia_panjang
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Cara inisialisasi database secara lokal

1. Jalankan dev server:

```bash
npm install
npm run dev
```

2. Buka di browser atau gunakan `curl` untuk panggil endpoint init:

```bash
# di terminal
curl -i http://localhost:3000/api/init
```

Jika semua berhasil, tabel akan dibuat dan data PDF ter-seed.

## Halaman
- `/login` - Login
- `/register` - Daftar akun
- `/forgot-password` - Minta OTP
- `/reset-password` - Reset password dengan OTP
- `/library` - Halaman utama (butuh login)
- `/admin` - Admin panel (Owner/Admin only)

## Deploy ke Vercel
1. Push ke GitHub
2. Import repo di Vercel
3. Set semua ENV variables
4. Deploy
5. Buka `https://domain.vercel.app/api/init`
