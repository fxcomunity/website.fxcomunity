# 📚 FX Community — WebsiteBaru (Full Stack)

Clone lengkap dari WebsiteBaru dengan sistem auth database penuh dan fitur keamanan tingkat tinggi.

## Fitur Baru (Update Keamanan)
- **Sistem Role & Jabatan**: Owner dapat mengubah jabatan user (Admin/User) dan memberikan notifikasi otomatis.
- **Admin Access Code**: Fitur "Decoder Kripto" kini memerlukan kode akses yang di-generate langsung oleh Owner dengan waktu kedaluwarsa.
- **IP Ban & Approval**: Sistem otomatis memblokir IP yang mencurigakan saat registrasi. Owner dapat menyetujui (Approve) pendaftaran dari IP yang terblokir.
- **UI Auth Modern**: Desain baru untuk halaman Verifikasi Email, Lupa Password, dan Reset Password.
- **Email Template Premium**: Desain email OTP yang lebih profesional dan informatif.

## Tech Stack
- Next.js 14 App Router + TypeScript
- PostgreSQL (Neon/Supabase)
- bcryptjs + JWT cookies
- Nodemailer (Gmail OTP)
- Tailwind CSS (UI Auth Components)

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
- Buat semua tabel (users, pdfs, otp_resets, activity_logs, admin_access_codes, dll)
- Seed data awal
- Buat akun owner default: owner@fxcomunity.com / owner123

## Halaman Utama
- `/login` - Login & Portal Auth
- `/register` - Daftar akun baru
- `/verify-email` - Verifikasi OTP pendaftaran
- `/forgot-password` - Minta OTP reset password
- `/reset-password` - Ganti password baru dengan OTP
- `/library` - Perpustakaan PDF (butuh login)
- `/admin` - Dashboard Admin & Owner (Security Overview)
- `/crypto` - Decoder Kripto (Eksklusif Owner/Admin dengan Kode)

## Fitur Owner (Eksklusif)
1. **Generate Kode Akses**: Buat kode untuk Admin agar bisa menggunakan tools tertentu.
2. **Manajemen Role**: Turunkan/naikkan jabatan user dengan satu klik.
3. **Persetujuan IP Banned**: Izinkan user dari IP terblokir untuk aktif kembali.
4. **Log Aktivitas**: Pantau semua tindakan sensitif di platform.

## Deploy ke Vercel
1. Push ke GitHub
2. Import repo di Vercel
3. Set semua ENV variables
4. Deploy
5. Buka `https://domain.vercel.app/api/init`
