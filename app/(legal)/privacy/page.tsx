'use client'
import Link from 'next/link'
import '../legal-pages.css'

export default function PrivacyPage() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1>🔒 Kebijakan Privasi</h1>
        <p>Kami menghormati dan melindungi privasi Anda</p>
      </div>

      <div className="legal-content">
        {/* Pendahuluan */}
        <div className="legal-section">
          <h2><span>📋</span> Pendahuluan</h2>
          <p>
            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan informasi personal Anda ketika Anda menggunakan platform kami (selanjutnya disebut "Platform" atau "Layanan").
          </p>
          <p>
            Terakhir diperbarui: Maret 2025
          </p>
        </div>

        {/* Informasi yang Kami Kumpulkan */}
        <div className="legal-section">
          <h2><span>📊</span> Informasi yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi personal berikut:</p>
          
          <h3>Informasi yang Anda Berikan Secara Langsung:</h3>
          <ul>
            <li>Nama lengkap</li>
            <li>Alamat email</li>
            <li>Password dan pertanyaan keamanan</li>
            <li>Nomor telepon (opsional)</li>
            <li>Profil pengguna dan preferensi pembelajaran</li>
          </ul>

          <h3>Informasi yang Dikumpulkan Secara Otomatis:</h3>
          <ul>
            <li>Alamat IP Anda</li>
            <li>Jenis browser dan perangkat yang Anda gunakan</li>
            <li>Halaman yang Anda kunjungi</li>
            <li>Waktu dan durasi kunjungan</li>
            <li>Cookies dan teknologi pelacakan serupa</li>
          </ul>
        </div>

        {/* Penggunaan Informasi */}
        <div className="legal-section">
          <h2><span>⚙️</span> Bagaimana Kami Menggunakan Informasi Anda</h2>
          <p>Kami menggunakan informasi yang kami kumpulkan untuk:</p>
          <ul>
            <li>Menyediakan, memelihara, dan meningkatkan Layanan kami</li>
            <li>Mengelola akun Anda dan memberikan dukungan pelanggan</li>
            <li>Mengirimkan informasi penting dan update tentang akun Anda</li>
            <li>Merespons pertanyaan dan permintaan Anda</li>
            <li>Mengirimkan newsletter dan promosi (dengan persetujuan Anda)</li>
            <li>Melakukan analisis dan riset untuk meningkatkan Layanan</li>
            <li>Mencegah fraud dan kegiatan ilegal</li>
            <li>Mematuhi kewajiban hukum dan peraturan</li>
          </ul>
        </div>

        {/* Perlindungan Data */}
        <div className="legal-section">
          <h2><span>🔐</span> Perlindungan Data Anda</h2>
          <p>
            Kami menggunakan berbagai teknik keamanan untuk melindungi informasi personal Anda, termasuk:
          </p>
          <ul>
            <li>Enkripsi SSL/TLS untuk semua komunikasi</li>
            <li>Password hashing dengan algoritma bcryptjs</li>
            <li>Akses terbatas ke data personal</li>
            <li>Audit keamanan reguler</li>
            <li>Backup data secara berkala</li>
            <li>Compliance dengan standar keamanan internasional</li>
          </ul>
          <p>
            Meskipun kami melakukan upaya maksimal untuk melindungi data Anda, tidak ada sistem keamanan yang 100% aman. Kami tidak dapat menjamin keamanan mutlak.
          </p>
        </div>

        {/* Pembagian Data */}
        <div className="legal-section">
          <h2><span>🤝</span> Pembagian Informasi</h2>
          <p>
            Kami <span className="highlight">tidak akan pernah</span> menjual atau membagikan informasi personal Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali:
          </p>
          <ul>
            <li>Diwajibkan oleh hukum atau proses hukum</li>
            <li>Untuk melayani penyedia layanan yang membantu kami beroperasi (misalnya: hosting, payment processor)</li>
            <li>Untuk melindungi hak, privasi, keamanan kami atau orang lain</li>
            <li>Dalam keadaan merger, akuisisi, atau penjualan aset</li>
          </ul>
        </div>

        {/* Cookies */}
        <div className="legal-section">
          <h2><span>🍪</span> Cookies dan Teknologi Pelacakan</h2>
          <p>
            Kami menggunakan cookies untuk meningkatkan pengalaman Anda di Platform kami. Cookies adalah file kecil yang disimpan di perangkat Anda dan membantu kami mengingat preferensi Anda.
          </p>
          <h3>Jenis Cookies yang Kami Gunakan:</h3>
          <ul>
            <li><span className="highlight">Essential Cookies</span>: Diperlukan untuk fungsi dasar Platform</li>
            <li><span className="highlight">Performance Cookies</span>: Membantu kami memahami bagaimana Anda menggunakan Platform</li>
            <li><span className="highlight">Preference Cookies</span>: Mengingat pilihan dan pengguna</li>
          </ul>
          <p>
            Anda dapat mengontrol dan menghapus cookies melalui pengaturan browser Anda. Namun, menghapus cookies mungkin mempengaruhi fungsionalitas Platform.
          </p>
        </div>

        {/* Hak Anda */}
        <div className="legal-section">
          <h2><span>⚖️</span> Hak Anda</h2>
          <p>Anda memiliki hak untuk:</p>
          <ul>
            <li>Mengakses data personal Anda yang kami simpan</li>
            <li>Meminta koreksi data yang tidak akurat</li>
            <li>Meminta penghapusan data Anda (Right to be Forgotten)</li>
            <li>Menolak penggunaan data untuk tujuan pemasaran</li>
            <li>Menerima copy data Anda dalam format yang dapat dibawa (Data Portability)</li>
            <li>Mengajukan keluhan kepada otoritas perlindungan data</li>
          </ul>
          <p>
            Untuk menggunakan hak-hak ini, silakan hubungi kami melalui email: privacy@tradingplatform.com
          </p>
        </div>

        {/* Retensi Data */}
        <div className="legal-section">
          <h2><span>📅</span> Retensi Data</h2>
          <p>
            Kami menyimpan informasi personal Anda selama akun Anda aktif atau sesuai dengan keperluan hukum. Anda dapat meminta penghapusan akun Anda kapan saja. Setelah penghapusan, kami akan menghapus data Anda dalam waktu 30 hari, kecuali kami diwajibkan untuk menyimpannya untuk alasan hukum.
          </p>
        </div>

        {/* Perubahan Kebijakan */}
        <div className="legal-section">
          <h2><span>📝</span> Perubahan pada Kebijakan Privasi Ini</h2>
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Jika ada perubahan material, kami akan memberitahu Anda melalui email atau pemberitahuan yang menonjol di Platform. Penggunaan Layanan yang berkelanjutan berarti Anda menerima perubahan-perubahan ini.
          </p>
        </div>

        {/* Hubungi Kami */}
        <div className="legal-section">
          <h2><span>💬</span> Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau praktik privasi kami, silakan hubungi kami:
          </p>
          <ul>
            <li>📧 Email: privacy@tradingplatform.com</li>
            <li>💬 WhatsApp: +62 895 404 147 521</li>
            <li>📍 Alamat: Indonesia</li>
          </ul>
        </div>
      </div>

      <div className="legal-back">
        <Link href="/">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
